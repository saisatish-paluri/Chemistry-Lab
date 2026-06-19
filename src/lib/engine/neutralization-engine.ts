import type {
  NeutralizationState, NeutStepId,
  ObservationEvent, StepDef, ExperimentObjective, ExperimentResult,
} from "./types";

function uid(): string { return Math.random().toString(36).slice(2, 10); }

function mkObs(
  type: ObservationEvent["type"],
  message: string,
  severity: ObservationEvent["severity"],
): ObservationEvent {
  return { id: uid(), timestamp: Date.now(), type, message, severity };
}

const INITIAL_STEPS: StepDef[] = [
  { id: "s1", instruction: "Measure 25 mL of 0.1 M HCl into the beaker", hint: "Use the measuring cylinder for accuracy — check the meniscus at eye level.", completed: false },
  { id: "s2", instruction: "Measure 25 mL of 0.1 M NaOH in the cylinder", hint: "Keep the base separate until ready to combine.", completed: false },
  { id: "s3", instruction: "Pour NaOH into the HCl beaker and stir", hint: "Watch the thermometer — an exothermic reaction produces heat.", completed: false },
  { id: "s4", instruction: "Observe and record the temperature rise", hint: "ΔT confirms that neutralisation released heat energy.", completed: false },
  { id: "s5", instruction: "Record observations and complete the experiment", hint: "NaCl (table salt) and water are the products.", completed: false },
];

const INITIAL_OBJECTIVES: ExperimentObjective[] = [
  { id: "o1", description: "Combine acid and base in stoichiometric ratio", completed: false },
  { id: "o2", description: "Observe exothermic temperature rise", completed: false },
  { id: "o3", description: "Confirm NaCl and H₂O formation", completed: false },
];

export function initialNeutralizationState(mode: NeutralizationState["mode"] = "guided"): NeutralizationState {
  return {
    mode,
    status: "idle",
    currentStep: "measure-hcl",
    hclVolumeMl: 0,
    naohVolumeMl: 0,
    isMixing: false,
    mixProgress: 0,
    initialTempC: 25.0,
    currentTempC: 25.0,
    reactionDone: false,
    saltFormed: false,
    steps: INITIAL_STEPS.map(s => ({ ...s })),
    objectives: INITIAL_OBJECTIVES.map(o => ({ ...o })),
    observations: [],
    result: null,
    startedAt: null,
    acidType: "strong",
    baseType: "strong",
    acidConc: 0.1,
    baseConc: 0.1,
    beakerInsulated: false,
    currentPh: 7.0,
    heatEvolvedJ: 0,
    experimentalError: (Math.random() - 0.5) * 2.0,
    indicator: "universal",
  };
}

export function measureHCl(state: NeutralizationState, volumeMl: number): NeutralizationState {
  if (state.currentStep !== "measure-hcl") return state;
  const acidName = state.acidType === "strong" ? "HCl" : "CH₃COOH";
  const obs = mkObs("reaction-start", `Measured ${volumeMl.toFixed(0)} mL of ${state.acidConc.toFixed(2)} M ${acidName} into the beaker.`, "info");
  const steps = state.steps.map(s => s.id === "s1" ? { ...s, completed: true } : s);
  const volAcid = volumeMl / 1000.0;
  const n_acid = volAcid * state.acidConc;
  const currentPh = solvepH(n_acid, 0, volAcid, 0, state.acidType, state.baseType);
  return {
    ...state,
    status: "running",
    hclVolumeMl: volumeMl,
    currentStep: "measure-naoh",
    steps,
    observations: [obs, ...state.observations],
    startedAt: state.startedAt ?? Date.now(),
    objectives: state.objectives.map(o => o.id === "o1" ? { ...o, completed: false } : o),
    currentPh,
  };
}

export function measureNaOH(state: NeutralizationState, volumeMl: number): NeutralizationState {
  if (state.currentStep !== "measure-naoh") return state;
  const baseName = state.baseType === "strong" ? "NaOH" : "NH₃";
  const obs = mkObs("reaction-start", `Measured ${volumeMl.toFixed(0)} mL of ${state.baseConc.toFixed(2)} M ${baseName} — ready to add to the acid.`, "info");
  const steps = state.steps.map(s => s.id === "s2" ? { ...s, completed: true } : s);
  return {
    ...state,
    naohVolumeMl: volumeMl,
    currentStep: "mix",
    steps,
    observations: [obs, ...state.observations],
  };
}

export function startMixing(state: NeutralizationState): NeutralizationState {
  if (state.currentStep !== "mix" || state.isMixing) return state;
  const acidName = state.acidType === "strong" ? "HCl" : "CH₃COOH";
  const baseName = state.baseType === "strong" ? "NaOH" : "NH₃";
  const saltName = (state.acidType === "strong" && state.baseType === "strong") ? "NaCl" 
                 : (state.acidType === "weak" && state.baseType === "strong") ? "CH₃COONa"
                 : (state.acidType === "strong" && state.baseType === "weak") ? "NH₄Cl"
                 : "CH₃COONH₄";
  const obs = mkObs("neutralization", `Solutions combined — neutralisation reaction starts. ${acidName} + ${baseName} → ${saltName} + H₂O. Heat is being released.`, "info");
  const steps = state.steps.map(s => s.id === "s3" ? { ...s, completed: true } : s);
  return {
    ...state,
    isMixing: true,
    mixProgress: 0,
    steps,
    observations: [obs, ...state.observations],
    objectives: state.objectives.map(o => o.id === "o1" ? { ...o, completed: true } : o),
  };
}

function solvepH(
  n_a: number, n_b: number, v_a: number, v_b: number,
  acidType: "strong" | "weak", baseType: "strong" | "weak"
): number {
  const totVol = v_a + v_b;
  if (totVol <= 0) return 7.0;

  if (acidType === "strong" && baseType === "strong") {
    if (n_a > n_b) {
      const hConc = (n_a - n_b) / totVol;
      return -Math.log10(Math.max(1e-14, hConc));
    } else if (n_b > n_a) {
      const ohConc = (n_b - n_a) / totVol;
      return 14 + Math.log10(Math.max(1e-14, ohConc));
    } else {
      return 7.0;
    }
  }

  const pKa = 4.76; // acetic acid
  const pKb = 4.75; // ammonia, pKa of conjugate acid = 9.25

  if (acidType === "weak" && baseType === "strong") {
    if (n_b < 1e-9) {
      const c_a = n_a / v_a;
      const hConc = Math.sqrt(Math.max(0, Math.pow(10, -pKa) * c_a));
      return -Math.log10(Math.max(1e-14, hConc));
    } else if (n_b < n_a) {
      return pKa + Math.log10(n_b / (n_a - n_b));
    } else if (Math.abs(n_b - n_a) < 1e-9) {
      const c_salt = n_a / totVol;
      const Kw = 1e-14;
      const Ka = Math.pow(10, -pKa);
      const ohConc = Math.sqrt((Kw / Ka) * c_salt);
      return 14 + Math.log10(Math.max(1e-14, ohConc));
    } else {
      const ohConc = (n_b - n_a) / totVol;
      return 14 + Math.log10(Math.max(1e-14, ohConc));
    }
  }

  if (acidType === "strong" && baseType === "weak") {
    const pKaConj = 9.25;
    if (n_b < 1e-9) {
      const hConc = n_a / totVol;
      return -Math.log10(Math.max(1e-14, hConc));
    } else if (n_b > n_a) {
      return pKaConj + Math.log10((n_b - n_a) / n_a);
    } else if (Math.abs(n_b - n_a) < 1e-9) {
      const c_salt = n_a / totVol;
      const KaConj = Math.pow(10, -pKaConj);
      const hConc = Math.sqrt(KaConj * c_salt);
      return -Math.log10(Math.max(1e-14, hConc));
    } else {
      const hConc = (n_a - n_b) / totVol;
      return -Math.log10(Math.max(1e-14, hConc));
    }
  }

  return 7.0 + 0.5 * (pKa - pKb);
}

export function updateNeutralizationParameters(
  state: NeutralizationState,
  changes: Partial<Pick<NeutralizationState, "acidType" | "baseType" | "acidConc" | "baseConc" | "beakerInsulated" | "indicator">>,
): NeutralizationState {
  if (state.status !== "idle" && state.status !== "setup") return state;
  return {
    ...state,
    acidType: changes.acidType !== undefined ? changes.acidType : state.acidType,
    baseType: changes.baseType !== undefined ? changes.baseType : state.baseType,
    acidConc: changes.acidConc !== undefined ? changes.acidConc : state.acidConc,
    baseConc: changes.baseConc !== undefined ? changes.baseConc : state.baseConc,
    beakerInsulated: changes.beakerInsulated !== undefined ? changes.beakerInsulated : state.beakerInsulated,
    indicator: changes.indicator !== undefined ? changes.indicator : state.indicator,
  };
}

export function updateMixProgress(state: NeutralizationState, progress: number): NeutralizationState {
  if (!state.isMixing) return state;

  const volAcid = state.hclVolumeMl / 1000.0;
  const volBase = (state.naohVolumeMl / 1000.0) * progress;
  const n_acid = volAcid * state.acidConc;
  const n_base = volBase * state.baseConc;

  const currentPh = solvepH(n_acid, n_base, volAcid, volBase, state.acidType, state.baseType);

  const dH = (state.acidType === "strong" && state.baseType === "strong") ? -55800 : -51500;
  const n_reacted = Math.min(n_acid, n_base);
  const heatJ = Math.abs(n_reacted * dH);

  const massSol = (state.hclVolumeMl + state.naohVolumeMl * progress) * 1.0; 
  const C_beaker = 50.0; 
  const cp = 4.184; 
  const theoreticalDeltaT = heatJ / (massSol * cp + C_beaker);

  const k_cool = state.beakerInsulated ? 0.0015 : 0.012;
  const simulatedTime = progress * 10.0; 
  const coolingFactor = Math.exp(-k_cool * simulatedTime);
  const actualTempRise = theoreticalDeltaT * coolingFactor * (1.0 + 0.02 * state.experimentalError);
  const currentTemp = state.initialTempC + actualTempRise;

  let newStep: NeutStepId = state.currentStep;
  let newObs   = [...state.observations];
  const newSteps = [...state.steps];

  if (progress >= 1.0 && state.currentStep === "mix") {
    newStep = "observe";
    const obs = mkObs("heat-released", `Temperature rose to ${currentTemp.toFixed(1)}°C (+${actualTempRise.toFixed(1)}°C). Solution pH is ${currentPh.toFixed(2)}.`, "success");
    newObs = [obs, ...newObs];
    newSteps[3] = { ...newSteps[3], completed: true };
  }

  return {
    ...state,
    mixProgress:  Math.min(1, progress),
    currentTempC: currentTemp,
    currentPh:    currentPh,
    heatEvolvedJ: heatJ,
    isMixing:     progress < 1.0,
    currentStep:  newStep,
    steps:        newSteps,
    observations: newObs,
  };
}

export function recordNeutObservations(state: NeutralizationState): NeutralizationState {
  if (state.currentStep !== "observe") return state;
  const deltaT = (state.currentTempC - state.initialTempC).toFixed(1);
  const saltName = (state.acidType === "strong" && state.baseType === "strong") ? "NaCl" 
                 : (state.acidType === "weak" && state.baseType === "strong") ? "CH₃COONa"
                 : (state.acidType === "strong" && state.baseType === "weak") ? "NH₄Cl"
                 : "CH₃COONH₄";
  const obs = mkObs("temperature-change", `Final T = ${state.currentTempC.toFixed(1)}°C. ΔT = ${deltaT}°C. Solution pH = ${state.currentPh.toFixed(2)}. ${saltName}(aq) formed.`, "success");
  const steps = state.steps.map(s => s.id === "s4" ? { ...s, completed: true } : s);
  return {
    ...state,
    currentStep: "record",
    saltFormed: true,
    steps,
    observations: [obs, ...state.observations],
    objectives: state.objectives.map(o => o.id === "o2" ? { ...o, completed: true } : o),
  };
}

export function completeNeutralization(state: NeutralizationState): NeutralizationState {
  const n_acid  = (state.hclVolumeMl / 1000) * state.acidConc;
  const n_base  = (state.naohVolumeMl / 1000) * state.baseConc;
  const n_reacted = Math.min(n_acid, n_base);
  const heatKJ  = state.heatEvolvedJ / 1000.0;
  const deltaT  = (state.currentTempC - state.initialTempC).toFixed(1);

  const acidName = state.acidType === "strong" ? "HCl" : "CH₃COOH";
  const baseName = state.baseType === "strong" ? "NaOH" : "NH₃";
  const saltName = (state.acidType === "strong" && state.baseType === "strong") ? "NaCl" 
                 : (state.acidType === "weak" && state.baseType === "strong") ? "CH₃COONa"
                 : (state.acidType === "strong" && state.baseType === "weak") ? "NH₄Cl"
                 : "CH₃COONH₄";

  const result: ExperimentResult = {
    completedAt:  Date.now(),
    success:      true,
    score:        95,
    summary:      `Neutralisation of ${acidName} and ${baseName} completed successfully.`,
    explanation:
      `${acidName}(aq) + ${baseName}(aq) → ${saltName}(aq) + H₂O(l).\n` +
      `${n_reacted.toFixed(4)} mol of reactants neutralized, releasing ${heatKJ.toFixed(2)} kJ of thermal energy.\n` +
      `Final beaker temperature: ${state.currentTempC.toFixed(1)}°C (rise of +${deltaT}°C).\n` +
      `Final solution pH was calculated as ${state.currentPh.toFixed(2)}.\n` +
      `Beaker insulation state: ${state.beakerInsulated ? "Insulated calorimeter (low heat loss)" : "Glass beaker (open to surroundings)"}.`,
  };

  const steps = state.steps.map(s => s.id === "s5" ? { ...s, completed: true } : s);
  const obs   = mkObs("reaction-complete", `Experiment complete! ${saltName} + H₂O produced. Final pH: ${state.currentPh.toFixed(2)}.`, "success");

  return {
    ...state,
    status:       "completed",
    reactionDone: true,
    steps,
    observations: [obs, ...state.observations],
    result,
    objectives: state.objectives.map(o => ({ ...o, completed: true })),
  };
}

export function resetNeutralization(state: NeutralizationState): NeutralizationState {
  return initialNeutralizationState(state.mode);
}
