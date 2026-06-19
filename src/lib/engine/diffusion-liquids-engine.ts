import type {
  DiffusionLiquidsState, ObservationEvent, StepDef, ExperimentObjective, ExperimentMode,
} from "./types";

function uid(): string { return Math.random().toString(36).slice(2, 10); }

function mkObs(
  type: ObservationEvent["type"],
  message: string,
  severity: ObservationEvent["severity"],
): ObservationEvent {
  return { id: uid(), timestamp: Date.now(), type, message, severity };
}

export function initialDiffusionLiquidsState(mode: ExperimentMode): DiffusionLiquidsState {
  const steps: StepDef[] = [
    { id: "s1", instruction: "Select a solute dye and adjust the water temperature.", hint: "Higher temperature increases kinetic energy and diffusion rate.", completed: false },
    { id: "s2", instruction: "Set the magnetic stirrer speed.", hint: "Stirring adds active convection flow which accelerates mixing.", completed: false },
    { id: "s3", instruction: "Dispense a droplet of solute into the center of the water beaker.", hint: "Click the dropper pipette to release a droplet.", completed: false },
    { id: "s4", instruction: "Observe the radial spread and wait for concentration to equalize.", hint: "Diffusion is complete when the color is uniform throughout the beaker.", completed: false },
  ];

  const objectives: ExperimentObjective[] = [
    { id: "o1", description: "Observe thermal diffusion without stirring at hot temperature (>= 75°C).", completed: false },
    { id: "o2", description: "Compare diffusion speed: KMnO4 (small size) vs Food Dye (large size).", completed: false },
    { id: "o3", description: "Stir at maximum speed (>= 400 RPM) to achieve convective mixing under 10 seconds.", completed: false },
  ];

  return {
    mode,
    status: "setup",
    selectedSolute: null,
    temperature: 20, // 20°C ambient base
    stirringSpeed: 0, // RPM
    addedDroplets: 0,
    isStirring: false,
    diffusionProgress: 0,
    elapsedTime: 0,
    steps,
    objectives,
    observations: [mkObs("info", "Welcome to the Liquid Diffusion Lab. Configure your solute and temperature.", "info")],
    result: null,
    startedAt: Date.now(),
  };
}

export function selectSolute(state: DiffusionLiquidsState, solute: "kmno4" | "dye" | "cuso4"): DiffusionLiquidsState {
  const next = { ...state };
  next.selectedSolute = solute;
  next.status = "ready";
  next.steps[0].completed = true;
  next.observations.unshift(mkObs("chemical_added", `Selected solute: ${solute.toUpperCase()}. Ready to adjust variables.`, "info"));
  return next;
}

export function setTemperature(state: DiffusionLiquidsState, temp: number): DiffusionLiquidsState {
  const next = { ...state };
  next.temperature = Math.max(10, Math.min(95, temp));
  return next;
}

export function setStirringSpeed(state: DiffusionLiquidsState, speed: number): DiffusionLiquidsState {
  const next = { ...state };
  next.stirringSpeed = Math.max(0, Math.min(600, speed));
  next.isStirring = next.stirringSpeed > 0;
  if (next.stirringSpeed > 0) {
    next.steps[1].completed = true;
  }
  return next;
}

export function addDroplet(state: DiffusionLiquidsState): DiffusionLiquidsState {
  const next = { ...state };
  if (!next.selectedSolute) return next;
  next.addedDroplets += 1;
  next.status = "running";
  next.steps[2].completed = true;
  next.observations.unshift(mkObs("rate-change", `Dispensed droplet of ${next.selectedSolute.toUpperCase()} into water. Diffusion initiated.`, "success"));
  return next;
}

export function getDiffusionCoefficient(solute: "kmno4" | "dye" | "cuso4", tempCelsius: number, stirringRPM: number): number {
  // Base diffusion coefficients D0 at 25°C (10^-5 cm^2/s)
  const baseD = {
    kmno4: 1.62, // small
    cuso4: 0.72, // medium
    dye: 0.38,   // large organic dye molecule
  }[solute];

  const tempK = tempCelsius + 273.15;
  const tempRatio = tempK / 298.15;
  
  // Einstein-Stokes temperature factor (accounting for viscosity decrease of water at high temps)
  const viscosityFactor = Math.pow(tempRatio, 3.0); // crude approximation of temperature kinetic effect

  // Stirring introduces convection multiplier
  const stirringFactor = 1.0 + (stirringRPM / 15.0);

  return baseD * tempRatio * viscosityFactor * stirringFactor * 0.05;
}

export function tickDiffusionLiquids(state: DiffusionLiquidsState, deltaSec: number): DiffusionLiquidsState {
  const next = { ...state };
  if (next.status !== "running" || next.addedDroplets === 0 || !next.selectedSolute) return next;

  next.elapsedTime += deltaSec;

  const D = getDiffusionCoefficient(next.selectedSolute, next.temperature, next.stirringSpeed);
  
  // Progress approaches 1.0 asymptotically based on coefficient D
  // e.g. mixing time is inversely proportional to D
  const spreadRate = D * 0.08;
  next.diffusionProgress = Math.min(1.0, next.diffusionProgress + spreadRate * deltaSec);

  // Check objectives
  if (next.temperature >= 75 && next.stirringSpeed === 0 && next.diffusionProgress >= 0.5) {
    next.objectives[0].completed = true;
  }
  if (next.selectedSolute === "kmno4" || next.selectedSolute === "dye") {
    next.objectives[1].completed = true; // comparative analysis triggered
  }
  if (next.stirringSpeed >= 400 && next.elapsedTime <= 10.0 && next.diffusionProgress >= 0.98) {
    next.objectives[2].completed = true;
  }

  // Completion criteria
  if (next.diffusionProgress >= 0.99) {
    next.diffusionProgress = 1.0;
    next.status = "completed";
    next.steps[3].completed = true;
    next.observations.unshift(mkObs("reaction-complete", `Solute has diffused uniformly throughout the beaker. Diffusion complete.`, "info"));

    const allObjectivesCompleted = next.objectives.every(obj => obj.completed);
    next.result = {
      completedAt: Date.now(),
      success: true,
      score: allObjectivesCompleted ? 100 : Math.round(next.objectives.filter(o => o.completed).length * 33.3),
      summary: `Completed liquid diffusion study for ${next.selectedSolute.toUpperCase()} at ${next.temperature}°C with stirring speed of ${next.stirringSpeed} RPM.`,
      explanation: `Solute molecules dispersed from high-concentration center to equalized equilibrium. Diffusion was accelerated by higher water temperatures (greater Brownian molecular speed) and stirrer RPM (convective mixing currents).`,
    };
  }

  return next;
}

export function resetDiffusionLiquids(state: DiffusionLiquidsState): DiffusionLiquidsState {
  return initialDiffusionLiquidsState(state.mode);
}
