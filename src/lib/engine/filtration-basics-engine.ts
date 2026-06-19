import type {
  FiltrationState,
  ObservationEvent, StepDef, ExperimentObjective,
} from "./types";

function uid(): string { return Math.random().toString(36).slice(2, 10); }

function mkObs(
  type: ObservationEvent["type"],
  message: string,
  severity: ObservationEvent["severity"],
): ObservationEvent {
  return { id: uid(), timestamp: Date.now(), type, message, severity };
}

// ── Constants ─────────────────────────────────────────────────────────────────
export const DEFAULT_SAND_G   = 5.0;   // g
export const DEFAULT_SALT_G   = 3.0;   // g
export const DEFAULT_WATER_ML = 100.0; // mL

// ── Steps & objectives ────────────────────────────────────────────────────────
function makeSteps(): StepDef[] {
  return [
    { id: "s1", instruction: "Observe the mixture of sand and salt in the beaker.", hint: "Can you tell them apart just by looking?", completed: false },
    { id: "s2", instruction: "Set composition parameters if desired, then add water to dissolve salt.", hint: "Salt (NaCl) is soluble in water; sand (SiO₂) is not.", completed: false },
    { id: "s3", instruction: "Stir the mixture for 30 seconds to dissolve the salt.", hint: "The turbid mixture contains suspended sand particles.", completed: false },
    { id: "s4", instruction: "Set up the filter funnel with folded filter paper.", hint: "Fold the filter paper into a cone — four layers on one side.", completed: false },
    { id: "s5", instruction: "Slowly pour the mixture through the funnel.", hint: "Flow rate depends on viscosity and clogging.", completed: false },
    { id: "s6", instruction: "Observe the clear filtrate and the residue on the paper.", hint: "Filtrate = salt solution. Residue = sand.", completed: false },
  ];
}

function makeObjectives(): ExperimentObjective[] {
  return [
    { id: "o1", description: "Understand why sand does not dissolve in water.", completed: false },
    { id: "o2", description: "Complete the filtration and collect the filtrate.", completed: false },
    { id: "o3", description: "Identify what is left on the filter paper (residue).", completed: false },
    { id: "o4", description: "Complete all steps and finish the experiment.", completed: false },
  ];
}

// ── Initial state ─────────────────────────────────────────────────────────────
export function initialFiltrationState(mode: FiltrationState["mode"]): FiltrationState {
  return {
    mode,
    status:         "setup",
    stage:          "setup",
    sandGrams:      DEFAULT_SAND_G,
    saltGrams:      DEFAULT_SALT_G,
    waterMl:        DEFAULT_WATER_ML,
    mixProgress:    0,
    filterProgress: 0,
    filtrateVolume: 0,
    residueMass:    DEFAULT_SAND_G,
    steps:          makeSteps(),
    objectives:     makeObjectives(),
    observations:   [],
    result:         null,
    startedAt:      null,
    temperature:    20,
    funnelVolume:   0,
    viscosity:      1.002, // cP
    cloggingFactor: 1.0,
    flowRate:       0.0,
  };
}

// ── Engine functions (pure) ───────────────────────────────────────────────────
export function updateFiltrationParameters(
  state: FiltrationState,
  changes: Partial<Pick<FiltrationState, "sandGrams" | "saltGrams" | "waterMl" | "temperature">>,
): FiltrationState {
  if (state.stage !== "setup") return state;
  return {
    ...state,
    sandGrams: changes.sandGrams !== undefined ? changes.sandGrams : state.sandGrams,
    saltGrams: changes.saltGrams !== undefined ? changes.saltGrams : state.saltGrams,
    waterMl: changes.waterMl !== undefined ? changes.waterMl : state.waterMl,
    temperature: changes.temperature !== undefined ? changes.temperature : state.temperature,
    residueMass: changes.sandGrams !== undefined ? changes.sandGrams : state.sandGrams,
  };
}

export function addWater(state: FiltrationState): FiltrationState {
  if (state.stage !== "setup") return state;
  const steps = state.steps.map((s) => (s.id === "s1" || s.id === "s2" ? { ...s, completed: true } : s));
  const concentration = state.saltGrams / state.waterMl;
  // Viscosity: base decreases with temperature, salt concentration increases it
  const visc = 1.79 * Math.exp(-0.025 * state.temperature) * (1.0 + 0.02 * concentration);
  
  const obs = mkObs(
    "reaction-start",
    `Added ${state.waterMl} mL of water at ${state.temperature}°C. Salt begins dissolving; sand remains insoluble and suspended. Calculated fluid viscosity ≈ ${visc.toFixed(3)} cP.`,
    "info"
  );
  return {
    ...state,
    stage:        "mixing",
    status:       "running",
    startedAt:    state.startedAt ?? Date.now(),
    steps,
    viscosity:    visc,
    observations: [obs, ...state.observations],
  };
}

export function tickMixProgress(state: FiltrationState, delta: number): FiltrationState {
  if (state.stage !== "mixing") return state;
  const newProgress = Math.min(1, state.mixProgress + delta / 4); // 4 seconds to mix
  if (newProgress >= 1) {
    const steps = state.steps.map((s) => (s.id === "s3" ? { ...s, completed: true } : s));
    const objectives = state.objectives.map((o) => (o.id === "o1" ? { ...o, completed: true } : o));
    const obs = mkObs("reaction-start", "Stirring complete. Soluble salt has fully dissolved into ions (Na⁺/Cl⁻); insoluble sand remains suspended.", "success");
    return {
      ...state,
      stage:        "mixed",
      mixProgress:  1,
      steps,
      objectives,
      observations: [obs, ...state.observations],
    };
  }
  return { ...state, mixProgress: newProgress };
}

export function setupFilter(state: FiltrationState): FiltrationState {
  if (state.stage !== "mixed") return state;
  const steps = state.steps.map((s) => (s.id === "s4" ? { ...s, completed: true } : s));
  const obs   = mkObs("reaction-start", "Filter funnel set up with folded filter paper. Ready to pour mixture.", "info");
  return {
    ...state,
    stage:        "pouring",
    steps,
    observations: [obs, ...state.observations],
  };
}

export function startPouring(state: FiltrationState): FiltrationState {
  if (state.stage !== "pouring") return state;
  const obs = mkObs("reaction-start", "Pouring the turbid mixture into the filter funnel...", "info");
  return {
    ...state,
    stage:        "filtering",
    funnelVolume: state.waterMl, // transfer mixture volume to funnel
    observations: [obs, ...state.observations],
  };
}

export function tickFilterProgress(state: FiltrationState, delta: number): FiltrationState {
  if (state.stage !== "filtering") return state;

  const concentration = state.saltGrams / state.waterMl;
  // Viscosity: centipoise (cP)
  const viscosity = 1.79 * Math.exp(-0.025 * state.temperature) * (1.0 + 0.02 * concentration);
  
  // Deposited sand clogging factor
  const depositedSand = state.sandGrams * state.filterProgress;
  const cloggingFactor = 1.0 + 0.15 * depositedSand;
  
  // Hydrostatic pressure proportional to head level
  const headPressure = Math.max(0.08, state.funnelVolume / state.waterMl);
  
  // Darcy's porous flow rate (mL/s)
  const basePermeability = 5.0; // base flow rate factor
  const noise = (Math.random() - 0.5) * 0.15; // small measurement variance
  const flowRate = Math.max(0.05, (basePermeability * headPressure) / (viscosity * cloggingFactor) + noise);
  
  const dV = flowRate * delta;
  const maxFiltrate = state.waterMl * 0.95; // 5% absorbed by filter paper
  
  const filtrateVolume = Math.min(maxFiltrate, state.filtrateVolume + dV);
  const funnelVolume = Math.max(0, state.funnelVolume - dV);
  const filterProgress = filtrateVolume / maxFiltrate;
  
  const steps = state.steps.map((s) => (s.id === "s5" ? { ...s, completed: filterProgress > 0.1 } : s));
  const residueMass = filterProgress * state.sandGrams;

  if (filterProgress >= 1.0) {
    const finalSteps = steps.map((s) => (s.id === "s6" ? { ...s, completed: true } : s));
    const objectives = state.objectives.map((o) => {
      if (o.id === "o2" || o.id === "o3") return { ...o, completed: true };
      return o;
    });
    
    // Add small experimental uncertainty to final measurements
    const finalFiltrate = Math.round((maxFiltrate + (Math.random() - 0.5) * 0.4) * 10) / 10;
    const finalResidue = Math.round((state.sandGrams + (Math.random() - 0.5) * 0.08) * 100) / 100;

    const obs = mkObs(
      "reaction-complete",
      `Filtration complete. Measured ${finalFiltrate} mL of clear filtrate collected. Sand residue (${finalResidue} g) remains on filter paper. Average viscosity was ${viscosity.toFixed(3)} cP; final clogging factor reached ${cloggingFactor.toFixed(2)}.`,
      "success",
    );
    return {
      ...state,
      stage:          "complete",
      status:         "ready",
      filterProgress: 1,
      filtrateVolume: finalFiltrate,
      residueMass:    finalResidue,
      funnelVolume:   0,
      flowRate:       0,
      steps:          finalSteps,
      objectives,
      observations:   [obs, ...state.observations],
    };
  }

  return {
    ...state,
    filterProgress,
    filtrateVolume,
    funnelVolume,
    residueMass,
    flowRate,
    viscosity,
    cloggingFactor,
    steps,
  };
}

export function completeFiltration(state: FiltrationState): FiltrationState {
  const score = state.stage === "complete" ? 100 :
    state.filterProgress > 0.5 ? 70 : 40;

  const steps = state.steps.map((s) => ({ ...s, completed: true }));
  const objectives = state.objectives.map((o) => (o.id === "o4" ? { ...o, completed: true } : o));

  return {
    ...state,
    status: "completed",
    steps,
    objectives,
    result: {
      completedAt: Date.now(),
      success:     state.stage === "complete",
      score,
      summary:
        state.stage === "complete"
          ? `Separated sand from saltwater. Collected ${state.filtrateVolume.toFixed(1)} mL of clear salt solution filtrate.`
          : "Filtration not fully completed — try pouring more of the mixture.",
      explanation:
        "Filtration separates an insoluble solid (sand) from a liquid (salt solution). " +
        "The filter paper has tiny pores that allow liquid molecules to pass through " +
        "but block larger solid particles. The liquid that passes through is the filtrate; " +
        "the solid left behind is the residue. To recover the salt, the filtrate would need to be evaporated.",
    },
  };
}

export function resetFiltration(state: FiltrationState): FiltrationState {
  return initialFiltrationState(state.mode);
}
