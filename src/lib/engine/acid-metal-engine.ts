import type {
  AcidMetalState, ObservationEvent, StepDef, ExperimentObjective, ExperimentMode,
} from "./types";

function uid(): string { return Math.random().toString(36).slice(2, 10); }

function mkObs(
  type: ObservationEvent["type"],
  message: string,
  severity: ObservationEvent["severity"],
): ObservationEvent {
  return { id: uid(), timestamp: Date.now(), type, message, severity };
}

export function initialAcidMetalState(mode: ExperimentMode): AcidMetalState {
  const steps: StepDef[] = [
    { id: "s1", instruction: "Select a metal (Mg, Zn, Fe, Cu) and choose its particle size.", hint: "Surface area directly determines the kinetic rate of the reaction.", completed: false },
    { id: "s2", instruction: "Measure the mass of the metal on the digital balance.", hint: "Use spatula to transfer metal. Note the balance's balance uncertainty (+/- 0.02g).", completed: false },
    { id: "s3", instruction: "Add the acid (HCl or H2SO4) and configure volume & concentration.", hint: "Concentration behaves as a rate order multiplier.", completed: false },
    { id: "s4", instruction: "Insert metal into the flask and seal stopper to start gas collection.", hint: "Gas collection syringe will measure the volume of hydrogen produced.", completed: false },
    { id: "s5", instruction: "Monitor the rate of bubble evolution, temperature changes, and gas volume.", hint: "Watch the exothermic curve and stoichiometric endpoint.", completed: false },
    { id: "s6", instruction: "Perform the squeaky pop test with a lighted splint to confirm hydrogen.", hint: "Sufficient gas (>20 mL) must be collected to get a positive pop.", completed: false },
  ];

  const objectives: ExperimentObjective[] = [
    { id: "o1", description: "Collect at least 50 mL of hydrogen gas using Magnesium.", completed: false },
    { id: "o2", description: "Confirm the presence of hydrogen using the squeaky pop test.", completed: false },
    { id: "o3", description: "Investigate reactivity series differences (e.g. Mg vs Cu).", completed: false },
  ];

  return {
    mode,
    status: "setup",
    selectedMetal: null,
    metalMass: 0,
    particleSize: "turnings",
    selectedAcid: null,
    acidVolume: 0,
    acidConcentration: 1.0,
    temperature: 22,
    isReacting: false,
    metalLeft: 0,
    gasVolumeCollected: 0,
    reactionRate: 0,
    elapsedTime: 0,
    experimentalError: Math.random() * 0.04 - 0.02, // ±2% random system yield variance
    popTestTriggered: false,
    popTestSuccess: null,
    steps,
    objectives,
    observations: [mkObs("info", "Welcome to the Acid-Metal Reactions Lab. Select a metal and particle size to start.", "info")],
    result: null,
    startedAt: Date.now(),
  };
}

export function selectMetalAndSize(state: AcidMetalState, metal: AcidMetalState["selectedMetal"], size: AcidMetalState["particleSize"]): AcidMetalState {
  if (state.status !== "setup" || state.isReacting) return state;
  const next = { ...state };
  next.selectedMetal = metal;
  next.particleSize = size;
  next.steps[0].completed = true;
  
  const mName = metal === "mg" ? "Magnesium" : metal === "zn" ? "Zinc" : metal === "fe" ? "Iron" : "Copper";
  next.observations.unshift(mkObs("info", `Selected ${mName} (${size}). Transfer it to the balance.`, "info"));
  return next;
}

export function weighMetal(state: AcidMetalState, mass: number): AcidMetalState {
  if (state.selectedMetal === null || state.metalMass > 0) return state;
  const next = { ...state };
  
  // Balance scale uncertainty
  const balanceNoise = (Math.random() * 0.04 - 0.02);
  const measured = Number((mass + balanceNoise).toFixed(2));
  
  next.metalMass = measured;
  next.metalLeft = measured;
  next.steps[1].completed = true;
  next.observations.unshift(mkObs("info", `Weighed ${measured}g of ${state.selectedMetal} (Actual mass: ${mass.toFixed(2)}g with balance noise).`, "info"));
  return next;
}

export function configureAcid(state: AcidMetalState, acid: "hcl" | "h2so4", vol: number, conc: number): AcidMetalState {
  if (state.metalMass === 0 || state.selectedAcid !== null) return state;
  const next = { ...state };
  next.selectedAcid = acid;
  next.acidVolume = vol;
  next.acidConcentration = conc;
  next.steps[2].completed = true;
  next.observations.unshift(mkObs("info", `Configured ${vol}mL of ${conc} M ${acid.toUpperCase()}. Prepare to connect stopper.`, "info"));
  return next;
}

export function startReaction(state: AcidMetalState): AcidMetalState {
  if (state.selectedAcid === null || state.isReacting || state.status === "completed") return state;
  const next = { ...state };
  next.isReacting = true;
  next.status = "reacting";
  next.steps[3].completed = true;
  next.observations.unshift(mkObs("state_change", `Stopper sealed. Reaction initiated. Bubbling starts.`, "info"));
  return next;
}

export function triggerPopTest(state: AcidMetalState): AcidMetalState {
  if (state.status !== "reacting" && state.status !== "completed") return state;
  const next = { ...state };
  next.popTestTriggered = true;

  if (next.gasVolumeCollected >= 20) {
    next.popTestSuccess = true;
    next.objectives[1].completed = true;
    next.observations.unshift(mkObs("info", `POP! Squeaky pop splint test positive. Hydrogen gas confirmed!`, "success"));
  } else {
    next.popTestSuccess = false;
    next.observations.unshift(mkObs("warning", `Splint extinguished. Insufficient gas collected (${next.gasVolumeCollected.toFixed(1)} mL) to trigger squeaky pop.`, "warning"));
  }

  return next;
}

export function tickAcidMetal(state: AcidMetalState, deltaSec: number): AcidMetalState {
  if (!state.isReacting) return state;
  const next = { ...state };
  next.elapsedTime += deltaSec;

  // Reactivity coefficients
  const kMetal = { mg: 0.85, zn: 0.14, fe: 0.035, cu: 0.0 }[state.selectedMetal!];
  const kSize = { powder: 4.0, turnings: 2.0, ribbon: 1.0, strip: 0.5 }[state.particleSize];
  
  if (kMetal === 0) {
    // Copper does not react with non-oxidizing acids
    next.isReacting = false;
    next.status = "completed";
    next.reactionRate = 0;
    next.objectives[2].completed = true; // copper reactivity investigated
    next.observations.unshift(mkObs("warning", "No reaction observed. Copper does not displace hydrogen from acids.", "warning"));
    return next;
  }

  // Kinetics equation: Rate = k * Size * [Acid]^1.2 * TempEffect * MetalRemainingRatio
  const tempK = next.temperature + 273.15;
  const tempEffect = Math.exp(-3200 / tempK) * 4.2; // Arrhenius temperature speed-up
  const acidRatio = Math.max(0, next.acidConcentration / 3.0);
  const metalRatio = Math.max(0, next.metalLeft / (next.metalMass || 1));

  const currentRate = kMetal * kSize * acidRatio * tempEffect * metalRatio * (1 + next.experimentalError);
  next.reactionRate = currentRate;

  // Moles calculations
  // Metal + 2H+ -> Metal2+ + H2 (stoichiometric factor 1:1 for Mg, Zn, Fe)
  const atomicMass = ({ mg: 24.3, zn: 65.4, fe: 55.8, cu: 63.5 } as Record<string, number>)[state.selectedMetal!] || 1;
  const maxMassReacted = currentRate * deltaSec * 0.08;
  const massReacted = Math.min(next.metalLeft, maxMassReacted);
  
  next.metalLeft -= massReacted;
  const molesReacted = massReacted / atomicMass;
  
  // Exothermic heat release
  const deltaH = ({ mg: -462000, zn: -153000, fe: -87000, cu: 0 } as Record<string, number>)[state.selectedMetal!] || 0; // J/mol
  const q = molesReacted * -deltaH;
  const solutionMass = state.acidVolume * 1.0; // density ~ 1g/mL
  const cp = 4.18; // J/g/C
  next.temperature += q / (solutionMass * cp);

  // Cool back towards ambient (Newton's cooling law)
  next.temperature = Math.max(22, next.temperature - 0.08 * (next.temperature - 22) * deltaSec);

  // Gas collection (in mL) using Ideal Gas Law V = nRT/P
  const R = 0.0821; // L*atm/mol/K
  const pressure = 1.0; // atm
  const gasVolumeL = (molesReacted * R * (next.temperature + 273.15)) / pressure;
  next.gasVolumeCollected = Math.min(100, next.gasVolumeCollected + gasVolumeL * 1000); // syringe cap is 100mL

  if (state.selectedMetal === "mg" && next.gasVolumeCollected >= 50) {
    next.objectives[0].completed = true;
  }

  if (next.metalLeft <= 0.005 || next.gasVolumeCollected >= 99.8) {
    next.isReacting = false;
    next.status = "completed";
    next.steps[4].completed = true;
    next.observations.unshift(mkObs("info", `Reaction finished. Total gas collected: ${next.gasVolumeCollected.toFixed(1)} mL. Final temperature: ${next.temperature.toFixed(1)}°C.`, "info"));
    
    const allObjectivesCompleted = next.objectives.every(obj => obj.completed);
    next.result = {
      completedAt: Date.now(),
      success: allObjectivesCompleted,
      score: allObjectivesCompleted ? 100 : Math.round(next.objectives.filter(o => o.completed).length * 33.3),
      summary: `Reacted ${state.selectedMetal!.toUpperCase()} with ${state.selectedAcid!.toUpperCase()}. Generated ${next.gasVolumeCollected.toFixed(1)} mL of Hydrogen gas. Squeaky pop test: ${next.popTestSuccess ? "Positive" : "Negative/Untested"}.`,
      explanation: allObjectivesCompleted
        ? "You successfully completed all objectives for the acid-metal displacement reaction."
        : "Make sure to react a reactive metal (like Mg) and test the collected hydrogen gas with a burning splint.",
    };
  }

  return next;
}

export function resetAcidMetal(state: AcidMetalState): AcidMetalState {
  return initialAcidMetalState(state.mode);
}
