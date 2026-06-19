import type {
  SeparationMixturesState, ObservationEvent, StepDef, ExperimentObjective, ExperimentMode,
} from "./types";

function uid(): string { return Math.random().toString(36).slice(2, 10); }

function mkObs(
  type: ObservationEvent["type"],
  message: string,
  severity: ObservationEvent["severity"],
): ObservationEvent {
  return { id: uid(), timestamp: Date.now(), type, message, severity };
}

export function initialSeparationMixturesState(mode: ExperimentMode): SeparationMixturesState {
  const steps: StepDef[] = [
    { id: "s1", instruction: "Use the bar magnet to separate all iron filings from the dry mixture.", hint: "Drag the magnet across the beaker several times.", completed: false },
    { id: "s2", instruction: "Add solvent water to the sand-salt beaker and stir to dissolve the salt.", hint: "Stirring rod dissolution matches solubility limit equations.", completed: false },
    { id: "s3", instruction: "Pour the slurry into the filter funnel to trap insoluble sand residue.", hint: "Wait for the Darcy filtration flow to empty the beaker.", completed: false },
    { id: "s4", instruction: "Transfer the filtrate to the evaporation dish and heat it to dry pure salt crystals.", hint: "Adjust burner heat power. Avoid overheating which spits product.", completed: false },
  ];

  const objectives: ExperimentObjective[] = [
    { id: "o1", description: "Extract 100% of the magnetic iron filings from the dry beaker.", completed: false },
    { id: "o2", description: "Successfully separate sand residue from the solution via filtration.", completed: false },
    { id: "o3", description: "Evaporate the salt solution at standard power without spilling or spitting.", completed: false },
  ];

  return {
    mode,
    status: "setup",
    ironMass: 5.0, // initial g
    sandMass: 6.0, // initial g
    saltMass: 4.0, // initial g
    separatedIron: 0,
    separatedSand: 0,
    separatedSalt: 0,
    waterVolume: 0,
    dissolvedSalt: 0,
    isWet: false,
    currentVessel: "beaker",
    separationStep: "initial",
    magnetSweepTime: 0,
    filtrationProgress: 0,
    evaporationProgress: 0,
    temperature: 20,
    steps,
    objectives,
    observations: [mkObs("info", "Welcome to the Separation of Mixtures Lab. Select an action to begin.", "info")],
    result: null,
    startedAt: Date.now(),
  };
}

export function sweepMagnetAction(state: SeparationMixturesState, sweepSec: number): SeparationMixturesState {
  const next = { ...state };
  if (next.separationStep !== "initial") return next;
  
  next.magnetSweepTime += sweepSec;
  // Sweep increases efficiency asymptotically
  const efficiency = 1.0 - Math.exp(-0.25 * next.magnetSweepTime);
  const ironSeparating = next.ironMass * efficiency;
  
  const diff = ironSeparating - next.separatedIron;
  next.separatedIron = Math.min(next.ironMass, ironSeparating);
  
  if (next.separatedIron >= next.ironMass - 0.05) {
    next.separatedIron = next.ironMass;
    next.objectives[0].completed = true;
    next.steps[0].completed = true;
    next.separationStep = "magnetic";
    next.observations.unshift(mkObs("reaction-complete", `Magnetic separation complete. All ${next.ironMass.toFixed(1)}g of iron filings extracted.`, "success"));
  } else if (diff > 0.1) {
    next.observations.unshift(mkObs("rate-change", `Magnet sweeps extracted ${next.separatedIron.toFixed(2)}g of iron filings so far.`, "info"));
  }
  return next;
}

export function addWaterAndDissolveAction(state: SeparationMixturesState): SeparationMixturesState {
  const next = { ...state };
  if (next.separationStep !== "magnetic") return next;
  
  next.waterVolume = 50; // add 50 mL of water
  next.isWet = true;
  
  // Dissolving kinetics: NaCl solubility at 20°C is ~36 g/100 mL water.
  // For 50 mL water, solubility limit is 18 g.
  // Our salt mass is 4.0 g, which is well below the limit and dissolves fully.
  next.dissolvedSalt = next.saltMass;
  next.separationStep = "dissolving";
  next.steps[1].completed = true;
  next.observations.unshift(mkObs("color-change", `Added 50 mL water. Salt dissolved completely into solution. Sand remains insoluble.`, "info"));
  return next;
}

export function startFiltrationAction(state: SeparationMixturesState): SeparationMixturesState {
  const next = { ...state };
  if (next.separationStep !== "dissolving") return next;
  next.currentVessel = "filter";
  next.separationStep = "filtration";
  next.status = "running";
  return next;
}

export function startEvaporationAction(state: SeparationMixturesState): SeparationMixturesState {
  const next = { ...state };
  if (next.separatedSand < next.sandMass - 0.1) {
    next.observations.unshift(mkObs("warning", `Cannot evaporate yet. Filter the mixture to trap the sand residue first!`, "warning"));
    return next;
  }
  next.currentVessel = "evaporate";
  next.separationStep = "evaporation";
  next.status = "running";
  return next;
}

export function tickSeparationMixtures(state: SeparationMixturesState, deltaSec: number): SeparationMixturesState {
  const next = { ...state };
  if (next.status !== "running") return next;

  // 1. Filtration Phase
  if (next.separationStep === "filtration") {
    // Filtration speed increases with filter paper status. Let's say it takes ~8 seconds.
    const rate = 0.125 * (1 + 0.05 * (20 - 20)); // baseline rate
    next.filtrationProgress = Math.min(1.0, next.filtrationProgress + rate * deltaSec);
    next.separatedSand = next.sandMass * next.filtrationProgress;

    if (next.filtrationProgress >= 1.0) {
      next.filtrationProgress = 1.0;
      next.separatedSand = next.sandMass;
      next.objectives[1].completed = true;
      next.steps[2].completed = true;
      next.status = "ready";
      next.observations.unshift(mkObs("precipitation", `Filtration complete. Sand residue retained on filter paper. Salt filtrate collected in beaker.`, "success"));
    }
  }

  // 2. Evaporation Phase
  else if (next.separationStep === "evaporation") {
    // Evaporation driven by burner temperature
    // Standard heating rate: temperature rises up to 100°C boiling point
    next.temperature = Math.min(100, next.temperature + 12.0 * deltaSec);

    if (next.temperature >= 100) {
      // Boiling: water evaporates
      const evapRate = 0.08; // 8% of water evaporates per second
      next.evaporationProgress = Math.min(1.0, next.evaporationProgress + evapRate * deltaSec);
      next.waterVolume = Math.max(0, 50 * (1.0 - next.evaporationProgress));

      if (next.evaporationProgress >= 1.0) {
        next.evaporationProgress = 1.0;
        next.waterVolume = 0;
        next.separatedSalt = next.dissolvedSalt;
        next.objectives[2].completed = true;
        next.steps[3].completed = true;
        next.status = "completed";
        next.currentVessel = "complete";
        next.observations.unshift(mkObs("reaction-complete", `All water evaporated. Purified sodium chloride crystals remain in evaporating dish.`, "success"));

        const allObjectivesCompleted = next.objectives.every(obj => obj.completed);
        next.result = {
          completedAt: Date.now(),
          success: true,
          score: allObjectivesCompleted ? 100 : Math.round(next.objectives.filter(o => o.completed).length * 33.3),
          summary: `Separated mixture components successfully: recovered ${next.separatedIron.toFixed(1)}g Iron, ${next.separatedSand.toFixed(1)}g Sand, and ${next.separatedSalt.toFixed(1)}g Salt.`,
          explanation: `Exploited solubility, magnetics, and density: Iron filings were extracted by magnetism, sand was isolated by filtration size-exclusion, and salt was crystallized by thermal solvent evaporation.`,
        };
      }
    }
  }

  return next;
}

export function resetSeparationMixtures(state: SeparationMixturesState): SeparationMixturesState {
  return initialSeparationMixturesState(state.mode);
}
