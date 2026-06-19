import type {
  AcidCarbonateState, ObservationEvent, StepDef, ExperimentObjective, ExperimentMode,
} from "./types";

function uid(): string { return Math.random().toString(36).slice(2, 10); }

function mkObs(
  type: ObservationEvent["type"],
  message: string,
  severity: ObservationEvent["severity"],
): ObservationEvent {
  return { id: uid(), timestamp: Date.now(), type, message, severity };
}

export function initialAcidCarbonateState(mode: ExperimentMode): AcidCarbonateState {
  const steps: StepDef[] = [
    { id: "s1", instruction: "Select a carbonate source (Marble Chips, CaCO3 Powder, or Sodium Carbonate).", hint: "Lattice solubility and particle surface area determine reactivity speed.", completed: false },
    { id: "s2", instruction: "Weigh out a measured mass of the carbonate solid (0.5 to 5g).", hint: "Stoichiometry is proportional to the moles of carbonate.", completed: false },
    { id: "s3", instruction: "Configure and add the acid reagent, and decide whether to seal the stopper.", hint: "WARNING: Failing to seal the stopper will result in gas leakage.", completed: false },
    { id: "s4", instruction: "Observe the effervescence rate and collect the carbon dioxide gas.", hint: "Observe the gas syringe displacement.", completed: false },
    { id: "s5", instruction: "Perform the limewater test to confirm carbon dioxide.", hint: "Route the gas into calcium hydroxide solution. Watch it turn milky, then clear upon excess CO2.", completed: false },
  ];

  const objectives: ExperimentObjective[] = [
    { id: "o1", description: "Collect at least 40 mL of carbon dioxide gas.", completed: false },
    { id: "o2", description: "Turn the limewater milky using the evolved CO2 gas.", completed: false },
    { id: "o3", description: "Perform a reaction with an unsealed stopper and note the leak error.", completed: false },
  ];

  return {
    mode,
    status: "setup",
    selectedCarbonate: null,
    carbonateMass: 0,
    selectedAcid: null,
    acidVolume: 0,
    acidConcentration: 1.0,
    temperature: 22,
    isReacting: false,
    stopperSealed: true,
    pressure: 1.0,
    carbonateLeft: 0,
    gasVolumeCollected: 0,
    reactionRate: 0,
    elapsedTime: 0,
    limeWaterMilky: false,
    limeWaterTestActive: false,
    steps,
    objectives,
    observations: [mkObs("info", "Welcome to the Acid-Carbonate Reactions Lab. Select a carbonate to begin.", "info")],
    result: null,
    startedAt: Date.now(),
  };
}

export function selectCarbonate(state: AcidCarbonateState, carb: AcidCarbonateState["selectedCarbonate"]): AcidCarbonateState {
  if (state.status !== "setup" || state.isReacting) return state;
  const next = { ...state };
  next.selectedCarbonate = carb;
  next.steps[0].completed = true;
  const cName = carb === "marble-chips" ? "Marble Chips" : carb === "caco3-powder" ? "CaCO3 Powder" : "Sodium Carbonate";
  next.observations.unshift(mkObs("info", `Selected ${cName}. Measure its mass.`, "info"));
  return next;
}

export function weighCarbonate(state: AcidCarbonateState, mass: number): AcidCarbonateState {
  if (state.selectedCarbonate === null || state.carbonateMass > 0) return state;
  const next = { ...state };
  next.carbonateMass = mass;
  next.carbonateLeft = mass;
  next.steps[1].completed = true;
  next.observations.unshift(mkObs("info", `Weighed ${mass.toFixed(1)}g of ${state.selectedCarbonate}.`, "info"));
  return next;
}

export function configureCarbonateAcid(state: AcidCarbonateState, acid: "hcl" | "h2so4", vol: number, conc: number, sealed: boolean): AcidCarbonateState {
  if (state.carbonateMass === 0 || state.selectedAcid !== null) return state;
  const next = { ...state };
  next.selectedAcid = acid;
  next.acidVolume = vol;
  next.acidConcentration = conc;
  next.stopperSealed = sealed;
  next.steps[2].completed = true;
  
  if (!sealed) {
    next.objectives[2].completed = true; // unsealed stopper leak error checked
    next.observations.unshift(mkObs("warning", "Stopper left unsealed. Gas is free to escape into the atmosphere.", "warning"));
  } else {
    next.observations.unshift(mkObs("info", `Configured ${vol}mL of ${conc} M ${acid.toUpperCase()} with sealed stopper.`, "info"));
  }
  return next;
}

export function startCarbonateReaction(state: AcidCarbonateState): AcidCarbonateState {
  if (state.selectedAcid === null || state.isReacting || state.status === "completed") return state;
  const next = { ...state };
  next.isReacting = true;
  next.status = "reacting";
  next.observations.unshift(mkObs("state_change", `Acid added. Vigorous effervescence initiated.`, "info"));
  return next;
}

export function toggleLimeWaterTest(state: AcidCarbonateState, active: boolean): AcidCarbonateState {
  const next = { ...state };
  next.limeWaterTestActive = active;
  if (active) {
    next.observations.unshift(mkObs("info", "Routing evolved gas into the calcium hydroxide (limewater) solution.", "info"));
  }
  return next;
}

export function tickAcidCarbonate(state: AcidCarbonateState, deltaSec: number): AcidCarbonateState {
  if (!state.isReacting) return state;
  const next = { ...state };
  next.elapsedTime += deltaSec;

  // Reactivity coefficients
  const kCarb = { "marble-chips": 0.08, "caco3-powder": 0.35, "na2co3": 0.95 }[state.selectedCarbonate!];
  const acidConc = next.acidConcentration;
  const carbRatio = Math.max(0, next.carbonateLeft / (next.carbonateMass || 1));
  
  // Kinetics rate: Rate = k * [Acid] * RemainingRatio
  const currentRate = kCarb * acidConc * carbRatio * 1.5;
  next.reactionRate = currentRate;

  // Stoichiometry
  // Carbonate + 2H+ -> Ca2+ + H2O + CO2 (1:1 stoichiometry)
  const formulaWeight = { "marble-chips": 100.1, "caco3-powder": 100.1, "na2co3": 106.0 }[state.selectedCarbonate!];
  const maxMassReacted = currentRate * deltaSec * 0.12;
  const massReacted = Math.min(next.carbonateLeft, maxMassReacted);

  next.carbonateLeft -= massReacted;
  const molesReacted = massReacted / formulaWeight;

  // Gas collection
  const R = 0.0821;
  const gasVolumeL = (molesReacted * R * (next.temperature + 273.15)) / 1.0;
  const volumeAddedMl = gasVolumeL * 1000;

  if (next.stopperSealed) {
    next.gasVolumeCollected = Math.min(100, next.gasVolumeCollected + volumeAddedMl);
    next.pressure = 1.0 + (next.gasVolumeCollected / 100) * 0.15; // mild pressure increase
  } else {
    next.gasVolumeCollected = Math.min(100, next.gasVolumeCollected + volumeAddedMl * 0.04); // mostly leaks out
    next.pressure = 1.0;
  }

  // Limewater test logic (Milky CO2 test)
  if (next.limeWaterTestActive && next.stopperSealed) {
    // Precipitate Ca(OH)2 + CO2 -> CaCO3 (insoluble)
    // Excess CO2 turns it clear CaCO3 + CO2 + H2O -> Ca(HCO3)2 (soluble)
    const accumGas = next.gasVolumeCollected;
    if (accumGas >= 12 && accumGas <= 48) {
      next.limeWaterMilky = true;
      next.objectives[1].completed = true; // limewater milky achieved
      next.steps[4].completed = true;
    } else if (accumGas > 48) {
      next.limeWaterMilky = false; // excess CO2 dissolves the precipitate!
    }
  }

  if (next.gasVolumeCollected >= 40) {
    next.objectives[0].completed = true;
  }

  if (next.carbonateLeft <= 0.005 || next.gasVolumeCollected >= 99.8) {
    next.isReacting = false;
    next.status = "completed";
    next.steps[3].completed = true;
    next.observations.unshift(mkObs("info", `Reaction completed. Total CO2 collected: ${next.gasVolumeCollected.toFixed(1)} mL. Limewater is ${next.limeWaterMilky ? "MILKY" : "CLEAR"}.`, "info"));

    const allObjectivesCompleted = next.objectives.every(obj => obj.completed);
    next.result = {
      completedAt: Date.now(),
      success: allObjectivesCompleted,
      score: allObjectivesCompleted ? 100 : Math.round(next.objectives.filter(o => o.completed).length * 33.3),
      summary: `Reacted ${state.selectedCarbonate!.toUpperCase()} with ${state.selectedAcid!.toUpperCase()}. Evolved ${next.gasVolumeCollected.toFixed(1)} mL of Carbon Dioxide gas. Limewater endpoint: ${next.limeWaterMilky ? "Milky (precipitate)" : "Clear (redissolved / unreacted)"}.`,
      explanation: allObjectivesCompleted
        ? "You successfully completed all objectives for the acid-carbonate reaction, including observing the limewater milky/clear transitions."
        : "Make sure to react the carbonate, configure the gas tube, and run the evolved gas through limewater to observe transitions.",
    };
  }

  return next;
}

export function resetAcidCarbonate(state: AcidCarbonateState): AcidCarbonateState {
  return initialAcidCarbonateState(state.mode);
}
