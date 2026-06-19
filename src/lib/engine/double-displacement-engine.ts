import type {
  DoubleDisplacementState, ObservationEvent, StepDef, ExperimentObjective,
} from "./types";

function uid(): string { return Math.random().toString(36).slice(2, 10); }

function mkObs(
  type: ObservationEvent["type"],
  message: string,
  severity: ObservationEvent["severity"],
): ObservationEvent {
  return { id: uid(), timestamp: Date.now(), type, message, severity };
}

export function initialDoubleDisplacementState(mode: "guided" | "free" | "exam" | "advanced"): DoubleDisplacementState {
  const steps: StepDef[] = [
    { id: "s1", instruction: "Select a reactant system from the cabinet.", hint: "Silver Nitrate, Lead Nitrate, or Barium Chloride combinations.", completed: false },
    { id: "s2", instruction: "Configure reactant concentrations, volumes, and solution temperature.", hint: "Solubility constant Ksp varies dynamically with temperature.", completed: false },
    { id: "s3", instruction: "Combine solutions in the reaction beaker to trigger double displacement.", hint: "Observe the color transition and precipitate crystals forming.", completed: false },
    { id: "s4", instruction: "Perform thermal verification: heat the solution and note precipitate dissolution.", hint: "For some systems, Ksp increases enough at high temps to redissolve the solid.", completed: false },
  ];

  const objectives: ExperimentObjective[] = [
    { id: "o1", description: "Successfully precipitate AgCl (silver chloride) white solid.", completed: false },
    { id: "o2", description: "Trigger 'Golden Rain' PbI2 precipitation and dissolve it by heating to >= 85°C.", completed: false },
    { id: "o3", description: "Precipitate BaSO4 and verify stoichiometry matches calculated mass yields.", completed: false },
  ];

  return {
    mode,
    status: "setup",
    system: null,
    solution1Volume: 20, // mL
    solution2Volume: 20, // mL
    solution1Conc: 0.1,  // M
    solution2Conc: 0.1,  // M
    temperature: 25,     // Celsius
    precipitateMass: 0,
    mixingProgress: 0,
    steps,
    objectives,
    observations: [mkObs("info", "Welcome to the Double Displacement Reactions Lab. Select a system to analyze.", "info")],
    result: null,
    startedAt: Date.now(),
  };
}

export function selectSystem(state: DoubleDisplacementState, system: DoubleDisplacementState["system"]): DoubleDisplacementState {
  const next = { ...state };
  next.system = system;
  next.status = "ready";
  next.steps[0].completed = true;
  next.observations.unshift(mkObs("chemical_added", `Selected reactant system: ${system!.toUpperCase()}.`, "info"));
  return next;
}

export function configureReactants(
  state: DoubleDisplacementState,
  vol1: number,
  vol2: number,
  conc1: number,
  conc2: number,
  temp: number,
): DoubleDisplacementState {
  const next = { ...state };
  next.solution1Volume = vol1;
  next.solution2Volume = vol2;
  next.solution1Conc = conc1;
  next.solution2Conc = conc2;
  next.temperature = temp;
  next.steps[1].completed = true;
  return next;
}

export function mixReactantsAction(state: DoubleDisplacementState): DoubleDisplacementState {
  const next = { ...state };
  if (!next.system) return next;
  next.status = "running";
  next.steps[2].completed = true;
  next.observations.unshift(mkObs("reaction-start", `Mixing reactant solutions...`, "info"));
  return next;
}

export function getSolubilityProductKsp(system: "agno3-nacl" | "pbno3-ki" | "bacl2-na2so4", tempCelsius: number): number {
  const tempK = tempCelsius + 273.15;
  const R = 8.314; // J/mol/K

  // Standard thermodynamic values at 298.15 K
  // Ksp_298, deltaH_dissolution (J/mol)
  const data = {
    "agno3-nacl": { ksp298: 1.77e-10, deltaH: 65700 },  // AgCl
    "pbno3-ki":   { ksp298: 7.9e-9,   deltaH: 46200 },  // PbI2
    "bacl2-na2so4": { ksp298: 1.08e-10, deltaH: 19100 },  // BaSO4
  }[system];

  // Van 't Hoff relation: ln(Ksp_T / Ksp_298) = -deltaH/R * (1/T_K - 1/298.15)
  const term = (-data.deltaH / R) * ((1.0 / tempK) - (1.0 / 298.15));
  return data.ksp298 * Math.exp(term);
}

export function tickDoubleDisplacement(state: DoubleDisplacementState, deltaSec: number): DoubleDisplacementState {
  const next = { ...state };
  if ((next.status !== "running" && next.status !== "completed") || !next.system) return next;

  // Mix solutions over ~2.5 seconds
  if (next.status === "running") {
    next.mixingProgress = Math.min(1.0, next.mixingProgress + 0.4 * deltaSec);
  }

  // Molar masses of precipitates
  const molarMass = {
    "agno3-nacl": 143.32, // AgCl
    "pbno3-ki":   461.01, // PbI2
    "bacl2-na2so4": 233.39, // BaSO4
  }[next.system];

  // Calculate stoichiometric yield
  const volTotalL = (next.solution1Volume + next.solution2Volume) / 1000.0;
  
  // Moles reactant 1 & 2
  const n1 = next.solution1Conc * (next.solution1Volume / 1000.0);
  const n2 = next.solution2Conc * (next.solution2Volume / 1000.0);

  // Stoichiometry ratios: 
  // Ag+ + Cl- -> AgCl (1:1)
  // Pb2+ + 2I- -> PbI2 (1:2)
  // Ba2+ + SO42- -> BaSO4 (1:1)
  let limitMolesPrecip = 0;
  let moles1Reacted = 0;
  let moles2Reacted = 0;

  if (next.system === "pbno3-ki") {
    // Pb(NO3)2 + 2KI -> PbI2 (KI is limiting if n2 < 2*n1)
    if (n2 < 2 * n1) {
      limitMolesPrecip = n2 / 2.0;
      moles2Reacted = n2;
      moles1Reacted = n2 / 2.0;
    } else {
      limitMolesPrecip = n1;
      moles1Reacted = n1;
      moles2Reacted = n1 * 2;
    }
  } else {
    // 1:1 reaction
    limitMolesPrecip = Math.min(n1, n2);
    moles1Reacted = limitMolesPrecip;
    moles2Reacted = limitMolesPrecip;
  }

  // Calculate ion concentrations remaining in dissolved state if no precip forms
  // Or check against Ksp to see if precipitation conditions are met
  const Ksp = getSolubilityProductKsp(next.system, next.temperature);

  // Ion product Q checks
  let dissolvedMolesOfPrecip = 0;
  if (next.system === "pbno3-ki") {
    // PbI2 solubility product: s * (2s)^2 = 4s^3 = Ksp -> s = (Ksp/4)^(1/3)
    const solubilityLimit = Math.pow(Ksp / 4.0, 1.0 / 3.0);
    dissolvedMolesOfPrecip = solubilityLimit * volTotalL;
  } else {
    // 1:1 solubility limit: s = sqrt(Ksp)
    const solubilityLimit = Math.sqrt(Ksp);
    dissolvedMolesOfPrecip = solubilityLimit * volTotalL;
  }

  const maxPrecipMoles = Math.max(0, limitMolesPrecip - dissolvedMolesOfPrecip);
  const targetMass = maxPrecipMoles * molarMass;
  
  next.precipitateMass = targetMass * next.mixingProgress;

  if (next.status === "running" && next.mixingProgress >= 1.0) {
    next.status = "completed";
    next.steps[3].completed = true;

    // Handle objectives checks
    if (next.system === "agno3-nacl" && next.precipitateMass > 0.05) {
      next.objectives[0].completed = true;
    }
    if (next.system === "bacl2-na2so4" && next.precipitateMass > 0.05) {
      next.objectives[2].completed = true;
    }

    const allObjectivesCompleted = next.objectives.every(obj => obj.completed);
    next.observations.unshift(mkObs("precipitation", `Double displacement complete. Formed ${next.precipitateMass.toFixed(3)}g of crystalline precipitate.`, "success"));

    next.result = {
      completedAt: Date.now(),
      success: true,
      score: allObjectivesCompleted ? 100 : Math.round(next.objectives.filter(o => o.completed).length * 33.3),
      summary: `Reacted ${next.solution1Volume} mL of reactant 1 with ${next.solution2Volume} mL of reactant 2. Formed ${next.precipitateMass.toFixed(3)}g of solid precipitate.`,
      explanation: `Double displacement occurs when the ionic product Qsp exceeds Ksp(T), forming an insoluble salt lattice. Heating shifts the solubility product equilibrium constant Ksp(T), redissolving the crystals.`,
    };
  }

  if (next.status === "completed") {
    // If PbI2 is heated and dissolved, complete objective o2
    if (next.system === "pbno3-ki") {
      if (next.temperature >= 85 && next.precipitateMass <= 0.01) {
        if (!next.objectives[1].completed) {
          next.objectives[1].completed = true;
          next.observations.unshift(mkObs("reaction-complete", "Recrystallization success: lead iodide dissolved fully at high temperature.", "success"));
        }
      }
      // Re-calculate results based on updated objectives
      const allObjectivesCompleted = next.objectives.every(obj => obj.completed);
      if (next.result) {
        next.result.score = allObjectivesCompleted ? 100 : Math.round(next.objectives.filter(o => o.completed).length * 33.3);
        next.result.summary = `Reacted reactant solutions. Formed ${next.precipitateMass.toFixed(3)}g PbI₂ precipitate at temperature ${next.temperature.toFixed(1)}°C.`;
      }
    }
  }

  return next;
}

export function resetDoubleDisplacement(state: DoubleDisplacementState): DoubleDisplacementState {
  return initialDoubleDisplacementState(state.mode);
}
