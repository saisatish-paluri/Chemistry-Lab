/**
 * Universal Chemistry Simulation Engine — Public API
 *
 * Import everything you need from this single entry point.
 * Avoid importing from individual sub-modules in experiment code.
 *
 * ─── Quick Integration Guide ──────────────────────────────────────────────────
 *
 * 1. In an experiment PAGE component:
 *
 *    import { useSimulationSession } from "@/lib/simulation";
 *
 *    const { session, recordAction } = useSimulationSession({
 *      domain: "titration",
 *      difficulty: "intermediate",
 *    });
 *    // session.environment.temperatureC — ambient lab temp
 *    // session.reagents["hcl-0.1"].actualConc — realistic concentration
 *    // session.apparatus["burette"].additiveBias — bias this session
 *
 * 2. In an experiment ENGINE (pure function):
 *
 *    import { applyRateEffect, kineticsCalc } from "@/lib/simulation";
 *
 *    const adjustedRate = applyRateEffect(baseRate, session.environment);
 *    const { rate }     = kineticsCalc(k, concentration, 1);
 *
 * 3. To generate varied observations:
 *
 *    import { generateObservation, endpointObservation } from "@/lib/simulation";
 *
 *    const obs = endpointObservation("pale pink");
 *    // obs.message: "Color changed to pale pink and persisted on swirling."
 *
 * 4. To add realistic noise to a displayed reading:
 *
 *    import { noisyReadingFromProfile } from "@/lib/simulation";
 *
 *    const reading = noisyReadingFromProfile(24.83, "burette");
 *    // reading.displayed: 24.85  (different each render)
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type {
  // Environment
  EnvironmentConfig,
  EnvironmentEffects,
  EnvironmentState,
  // Reagents
  ReagentId,
  ReagentConfig,
  ReagentState,
  // Apparatus
  ApparatusConditionId,
  ApparatusCondition,
  ApparatusConfig,
  // Observations
  ObservationCategory,
  ObservationContext,
  GeneratedObservation,
  // Actions
  StudentActionType,
  StudentAction,
  ActionSummary,
  ProcedureQuality,
  // Samples
  UnknownSaltSample,
  UnknownMetalSample,
  UnknownSolutionSample,
  UnknownWaterSample,
  UnknownSample,
  // Noise
  NoisyReading,
  MeasurementSet,
  // Calculations
  StoichiometryInput,
  StoichiometryResult,
  TitrationCalcResult,
  CalorimetryCalcResult,
  GasLawCalcResult,
  GasLawVariable,
  EquilibriumCalcResult,
  KineticsCalcResult,
  ElectrochemCalcResult,
  // Session
  ExperimentDomain,
  SimulationSessionConfig,
  SimulationSession,
} from "./types";

// ─── Environment Engine ───────────────────────────────────────────────────────

export {
  createEnvironment,
  applyRateEffect,
  applyGasVolumeEffect,
  applySolubilityEffect,
  describeEnvironment,
  getEnvironmentNote,
} from "./environment";

// ─── Reagent Engine ───────────────────────────────────────────────────────────

export {
  REAGENT_CATALOGUE,
  createReagent,
  createCustomReagent,
  createReagentSet,
  consumeReagent,
  remainingVolume,
  availableMoles,
  describeReagent,
} from "./reagents";

// ─── Apparatus Engine ─────────────────────────────────────────────────────────

export {
  rollApparatusCondition,
  rollApparatusSet,
  applyApparatusBias,
  conditionHasBias,
  describeCondition,
} from "./apparatus";

// ─── Observation Engine ───────────────────────────────────────────────────────

export {
  generateObservation,
  endpointObservation,
  precipitateObservation,
  gasObservation,
  temperatureObservation,
  generateObservationSet,
  pickPhrase,
} from "./observations";

// ─── Student Action Engine ────────────────────────────────────────────────────

export {
  createActionLog,
  recordAction,
  filterActions,
  additionRate,
  mixingScore,
  procedureQuality,
  buildActionSummary,
  procedureFeedback,
} from "./actions";

// ─── Sample Engine ────────────────────────────────────────────────────────────

export {
  generateUnknownSalt,
  generateUnknownMetal,
  generateUnknownSolution,
  generateUnknownWater,
  generateUnknownSample,
} from "./samples";

// ─── Noise Engine ─────────────────────────────────────────────────────────────

export {
  gaussianSample,
  noisyReading,
  measurementSet,
  roundToSigFigs,
  countSigFigs,
  quantise,
  NOISE_PROFILES,
  noisyReadingFromProfile,
} from "./noise";

export type { NoiseProfileKey } from "./noise";

// ─── Calculation Engine ───────────────────────────────────────────────────────

export {
  // Constants
  GAS_R,
  GAS_R_SI,
  FARADAY,
  STP_TEMP_K,
  STP_PRES_ATM,
  STP_MOLAR_VOL_L,
  // Functions
  stoichiometry,
  titrationCalc,
  calorimetryCalc,
  gasLawCalc,
  equilibriumCalc,
  kineticsCalc,
  electrochemCalc,
  strongAcidPH,
  strongBasePH,
  pOHFromPH,
  bufferPH,
  waterHardnessCalc,
} from "./calculations";

// ─── Session Model + Store ────────────────────────────────────────────────────

export {
  createSimulationSession,
  sessionWithAction,
  sessionWithMeta,
  useSimulationStore,
} from "./session";

// ─── React Hooks ─────────────────────────────────────────────────────────────

export {
  useSimulationSession,
  useEnvironment,
  useReagents,
  useApparatus,
  useUnknownSample,
  useEnvironmentEffects,
  useSessionMeta,
} from "./hooks";
