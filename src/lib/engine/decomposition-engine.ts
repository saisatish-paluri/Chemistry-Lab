import type {
  DecompositionState, ObservationEvent, StepDef, ExperimentObjective,
} from "./types";

function uid(): string { return Math.random().toString(36).slice(2, 10); }

function mkObs(
  type: ObservationEvent["type"],
  message: string,
  severity: ObservationEvent["severity"],
): ObservationEvent {
  return { id: uid(), timestamp: Date.now(), type, message, severity };
}

export function initialDecompositionState(mode: "guided" | "free" | "exam" | "advanced"): DecompositionState {
  const steps: StepDef[] = [
    { id: "s1", instruction: "Select a chemical compound and weigh out the starting mass.", hint: "Choose between CaCO3, KClO3, or H2O2 solution.", completed: false },
    { id: "s2", instruction: "Optionally add the Manganese Dioxide (MnO2) catalyst to lower activation energy.", hint: "Catalysts accelerate reactions without being consumed.", completed: false },
    { id: "s3", instruction: "Connect the gas tube, set heating power, and light the burner.", hint: "H2O2 decomposes at room temp if MnO2 is present.", completed: false },
    { id: "s4", instruction: "Collect the evolved oxygen or carbon dioxide gas and note mass reduction.", hint: "Wait for the reaction kinetics to complete.", completed: false },
  ];

  const objectives: ExperimentObjective[] = [
    { id: "o1", description: "Decompose CaCO3 (marble chips) at high heat (>= 800°C) to collect CO2 gas.", completed: false },
    { id: "o2", description: "Decompose KClO3 at lower temperature using MnO2 catalyst.", completed: false },
    { id: "o3", description: "Catalytically decompose H2O2 at room temperature (no burner active).", completed: false },
  ];

  return {
    mode,
    status: "setup",
    reactant: null,
    initialMass: 5.0,
    remainingMass: 5.0,
    hasCatalyst: false,
    temperature: 22, // ambient
    gasVolumeEvolved: 0,
    isHeating: false,
    heatingPower: 150, // W
    steps,
    objectives,
    observations: [mkObs("info", "Welcome to the Decomposition Reactions Lab. Select a reactant.", "info")],
    result: null,
    startedAt: Date.now(),
  };
}

export function selectReactant(state: DecompositionState, reactant: "caco3" | "kclo3" | "h2o2"): DecompositionState {
  const next = { ...state };
  next.reactant = reactant;
  next.initialMass = reactant === "h2o2" ? 20.0 : 5.0; // 20g of 10% H2O2 solution
  next.remainingMass = next.initialMass;
  next.status = "ready";
  next.steps[0].completed = true;
  next.observations.unshift(mkObs("chemical_added", `Weighed and loaded ${next.initialMass.toFixed(1)}g of ${reactant.toUpperCase()}.`, "info"));
  return next;
}

export function addMnO2CatalystAction(state: DecompositionState): DecompositionState {
  const next = { ...state };
  next.hasCatalyst = true;
  next.steps[1].completed = true;
  next.observations.unshift(mkObs("chemical_added", `Added Manganese Dioxide (MnO2) catalyst. Activation barrier lowered.`, "success"));
  return next;
}

export function setDecompHeatingPower(state: DecompositionState, power: number): DecompositionState {
  const next = { ...state };
  next.heatingPower = Math.max(50, Math.min(600, power));
  return next;
}

export function toggleDecompHeatingAction(state: DecompositionState, active: boolean): DecompositionState {
  const next = { ...state };
  next.isHeating = active;
  next.status = "running";
  next.steps[2].completed = true;
  next.observations.unshift(mkObs("rate-change", active ? `Bunsen burner active.` : `Bunsen burner extinguished.`, "info"));
  return next;
}

export function tickDecomposition(state: DecompositionState, deltaSec: number): DecompositionState {
  const next = { ...state };
  if (!next.reactant) return next;

  // Temperature mechanics
  if (next.isHeating) {
    // Heat up to a max limit based on heating power (e.g. 500W can reach ~950°C)
    const maxTemp = next.heatingPower * 1.6;
    next.temperature = Math.min(maxTemp, next.temperature + 45.0 * deltaSec);
  } else {
    // Cool back down towards room temperature
    next.temperature = Math.max(22, next.temperature - 12.0 * deltaSec);
  }

  // Room temp reaction check for H2O2 catalyst
  const canReactRoomTemp = next.reactant === "h2o2" && next.hasCatalyst;
  const isCurrentlyReacting = next.isHeating || canReactRoomTemp;
  
  if (!isCurrentlyReacting && next.status === "running") {
    next.status = "ready";
  } else if (isCurrentlyReacting) {
    next.status = "running";
  }

  if (next.status !== "running") return next;

  // Arrhenius Kinetics: k = A * exp(-Ea / RT)
  const R = 8.314; // J/mol/K
  const tempK = next.temperature + 273.15;

  // Activation Energy Ea (J/mol) & Frequency factor A
  const kinetics = {
    caco3: { ea: 180000, eaCat: 180000, A: 1.2e10, gasMolarMass: 44.01 }, // CaCO3 -> CaO + CO2 (catalyst has no effect on limestone)
    kclo3: { ea: 220000, eaCat: 120000, A: 8.5e11, gasMolarMass: 32.00 }, // 2KClO3 -> 2KCl + 3O2
    h2o2:  { ea: 75000,  eaCat: 49000,  A: 1.5e8,  gasMolarMass: 32.00 }, // 2H2O2 -> 2H2O + O2
  }[next.reactant];

  const Ea = next.hasCatalyst ? kinetics.eaCat : kinetics.ea;
  const k = kinetics.A * Math.exp(-Ea / (R * tempK));

  // Decompose mass
  let massDecomposed = 0;
  if (next.reactant === "h2o2") {
    // For H2O2 solution, mass of reactant is 10% of total solution (2.0g)
    const activeReactantLeft = Math.max(0, next.remainingMass - 18.0); // 18g water base
    massDecomposed = activeReactantLeft * k * deltaSec;
  } else {
    massDecomposed = next.remainingMass * k * deltaSec;
  }

  // Cap mass decomposed
  const minLimit = next.reactant === "h2o2" ? 18.0 : 0.05; // H2O2 leaves water behind
  const actualDecomposed = Math.min(next.remainingMass - minLimit, massDecomposed);

  if (actualDecomposed > 0) {
    next.remainingMass -= actualDecomposed;

    // Evolved gas moles
    let gasMoles = 0;
    if (next.reactant === "caco3") {
      // 1 mol CaCO3 -> 1 mol CO2
      gasMoles = actualDecomposed / 100.09;
    } else if (next.reactant === "kclo3") {
      // 2 mol KClO3 -> 3 mol O2
      gasMoles = (actualDecomposed / 122.55) * 1.5;
    } else if (next.reactant === "h2o2") {
      // 2 mol H2O2 -> 1 mol O2
      gasMoles = (actualDecomposed / 34.01) * 0.5;
    }

    // Gas collection (mL) using Ideal Gas Law V = nRT/P
    const gasVolL = (gasMoles * 0.0821 * tempK) / 1.0;
    next.gasVolumeEvolved = Math.min(250, next.gasVolumeEvolved + gasVolL * 1000); // 250mL syringe cap
  }

  // Objectives verification
  if (next.reactant === "caco3" && next.temperature >= 800 && next.gasVolumeEvolved >= 50) {
    next.objectives[0].completed = true;
  }
  if (next.reactant === "kclo3" && next.hasCatalyst && next.temperature <= 320 && next.gasVolumeEvolved >= 50) {
    next.objectives[1].completed = true;
  }
  if (next.reactant === "h2o2" && next.hasCatalyst && !next.isHeating && next.gasVolumeEvolved >= 20) {
    next.objectives[2].completed = true;
  }

  // Completion check
  const reactantExhausted = next.reactant === "h2o2" 
    ? next.remainingMass <= 18.05 
    : next.remainingMass <= 0.1;

  if (reactantExhausted || next.gasVolumeEvolved >= 249.5) {
    next.isHeating = false;
    next.status = "completed";
    next.steps[3].completed = true;
    
    const allObjectivesCompleted = next.objectives.every(obj => obj.completed);
    next.observations.unshift(mkObs("reaction-complete", `Decomposition complete. Collected ${next.gasVolumeEvolved.toFixed(1)} mL of gas. Solid remaining mass: ${next.remainingMass.toFixed(2)}g.`, "success"));

    next.result = {
      completedAt: Date.now(),
      success: true,
      score: allObjectivesCompleted ? 100 : Math.round(next.objectives.filter(o => o.completed).length * 33.3),
      summary: `Decomposed ${next.initialMass}g of ${next.reactant.toUpperCase()} to evolve ${next.gasVolumeEvolved.toFixed(1)} mL of gas.`,
      explanation: `Decomposition reaction speeds are governed by temperature thermal inputs and catalysts. The MnO2 catalyst provides a lower activation barrier (Ea), allowing rapid decomposition at much lower temperatures.`,
    };
  }

  return next;
}

export function resetDecomposition(state: DecompositionState): DecompositionState {
  return initialDecompositionState(state.mode);
}
