/**
 * Universal Chemistry Simulation Engine — Core Types
 *
 * Shared by all sub-engines (environment, reagents, apparatus, observations,
 * actions, samples, noise, calculations) and the unified SimulationSession.
 */

// ─── Environment ──────────────────────────────────────────────────────────────

export interface EnvironmentConfig {
  temperatureRange?: [number, number]; // °C [min, max]; default [20, 26]
  pressureRange?:    [number, number]; // atm; default [0.97, 1.03]
  humidityRange?:    [number, number]; // % RH; default [30, 70]
}

export interface EnvironmentEffects {
  /** Reaction rate multiplier (Arrhenius-based relative to 25 °C reference). */
  rateMultiplier:   number;
  /** Gas volume fraction relative to STP (affects gas law / collection labs). */
  gasVolumeAdj:     number;
  /** Solubility adjustment fraction (+/- relative to 25 °C reference). */
  solubilityAdj:    number;
  /** Evaporation rate multiplier (humidity + temperature driven). */
  evaporationAdj:   number;
  /** Calorimetry temperature baseline shift (°C above/below 25 °C). */
  calorimetryTempOffset: number;
}

export interface EnvironmentState {
  temperatureC: number;
  pressureAtm:  number;
  humidityPct:  number;
  effects:      EnvironmentEffects;
}

// ─── Reagents ─────────────────────────────────────────────────────────────────

export type ReagentId = string;

export interface ReagentConfig {
  nominalConc?:     number;       // mol/L as labelled on the bottle
  concVariancePct?: number;       // ±% on concentration (default 3 %)
  purityRange?:     [number, number]; // [min%, max%] (default [97.0, 99.9])
  quantityMl?:      number;       // available volume in mL (default 500)
  isAged?:          boolean;      // aged reagents get double variance
}

export interface ReagentState {
  id:              ReagentId;
  formula:         string;
  label:           string;
  nominalConc:     number;       // mol/L as labelled
  actualConc:      number;       // mol/L true (session-rolled)
  purityPct:       number;       // % (session-rolled)
  effectiveConc:   number;       // actualConc × purityPct/100
  quantityMl:      number;       // total available
  quantityUsedMl:  number;       // consumed this session
  isExpired:       boolean;
  preparationNote: string;       // e.g. "Freshly prepared", "Aged — higher variance"
}

// ─── Apparatus ────────────────────────────────────────────────────────────────

export type ApparatusConditionId =
  | "clean-dry"
  | "rinsed-water"
  | "rinsed-solution"
  | "wet"
  | "contaminated"
  | "poorly-calibrated"
  | "cracked";

export interface ApparatusCondition {
  id:              ApparatusConditionId;
  label:           string;
  /** Multiplicative bias: 1.0 = none; >1 = over-reads; <1 = under-reads. */
  biasMultiplier:  number;
  /** Absolute additive offset in measurement units. */
  additiveBias:    number;
  severity:        "none" | "minor" | "moderate" | "major";
  educationalNote: string;
}

export interface ApparatusConfig {
  /** Probability of receiving a non-ideal apparatus (0–1). Default 0.35. */
  faultProbability?: number;
  difficulty?:       "beginner" | "intermediate" | "advanced";
}

// ─── Observations ─────────────────────────────────────────────────────────────

export type ObservationCategory =
  | "color-change"
  | "precipitate"
  | "gas-evolution"
  | "temperature-change"
  | "endpoint"
  | "reaction-start"
  | "reaction-progress"
  | "measurement"
  | "procedural"
  | "warning";

export interface ObservationContext {
  intensity?:    "faint" | "moderate" | "intense";
  speed?:        "slow" | "moderate" | "rapid" | "vigorous";
  color?:        string;
  colorBefore?:  string;
  colorAfter?:   string;
  amount?:       "trace" | "small" | "moderate" | "large";
  reagentLabel?: string;
  value?:        number;
  unit?:         string;
  extra?:        string;
}

export interface GeneratedObservation {
  category: ObservationCategory;
  message:  string;
  /** Relative signal strength for display emphasis. */
  weight:   "info" | "warning" | "success" | "error";
}

// ─── Student Actions ──────────────────────────────────────────────────────────

export type StudentActionType =
  | "add-reagent"
  | "mix"
  | "heat"
  | "cool"
  | "measure"
  | "record"
  | "wait"
  | "rinse"
  | "filter"
  | "titrate-fast"
  | "titrate-slow"
  | "titrate-dropwise"
  | "endpoint-detected";

export interface StudentAction {
  type:      StudentActionType;
  timestamp: number;
  /** Arbitrary numeric data (e.g. volume added, temperature set). */
  value?:    number;
  unit?:     string;
}

export type ProcedureQuality = "excellent" | "good" | "fair" | "poor";

export interface ActionSummary {
  totalActions:  number;
  /** mL/min average addition rate for liquid transfers. */
  additionRate:  number;
  /** 0–1 mixing quality (frequency × duration heuristic). */
  mixingScore:   number;
  procedural:    ProcedureQuality;
  heatingEvents: number;
  mixingEvents:  number;
  titrateDropwise: number; // count of dropwise additions
  titrateFast:     number; // count of fast additions (penalised near endpoint)
}

// ─── Unknown Samples ──────────────────────────────────────────────────────────

export interface UnknownSaltSample {
  type:          "salt";
  id:            string;
  formula:       string;
  cation:        string;
  anion:         string;
  concentration: number;   // mol/L
  color:         string;   // solution color hex
  colorName:     string;
  sessionCode:   string;
}

export interface UnknownMetalSample {
  type:        "metal";
  id:          string;
  symbol:      string;
  name:        string;
  massG:       number;
  surfaceArea: "powder" | "granules" | "strip" | "solid";
  sessionCode: string;
}

export interface UnknownSolutionSample {
  type:          "solution";
  id:            string;
  formula:       string;
  label:         string;
  concentration: number; // mol/L
  pH:            number;
  sessionCode:   string;
}

export interface UnknownWaterSample {
  type:        "water";
  id:          string;
  source:      string;
  hardnessMgL: number;   // ppm as CaCO₃
  pHValue:     number;
  turbidity:   "clear" | "slightly-turbid" | "turbid";
  sessionCode: string;
}

export type UnknownSample =
  | UnknownSaltSample
  | UnknownMetalSample
  | UnknownSolutionSample
  | UnknownWaterSample;

// ─── Scientific Noise ─────────────────────────────────────────────────────────

export interface NoisyReading {
  actual:    number;
  displayed: number;   // rounded to instrument resolution
  noise:     number;   // Gaussian noise component
  sigFigs:   number;
  formatted: string;
}

export interface MeasurementSet {
  readings: NoisyReading[];
  mean:     number;
  stdDev:   number;
  range:    number;
  n:        number;
}

// ─── Chemistry Calculations ───────────────────────────────────────────────────

export interface StoichiometryInput {
  /** Molar coefficients for each species (positive = reactant, negative = product). */
  coefficients: Record<string, number>;
  /** Known amounts in mol for at least one species. */
  knownMoles:   Record<string, number>;
}

export interface StoichiometryResult {
  limitingReagent: string;
  molesReacted:    Record<string, number>;
  molesProduced:   Record<string, number>;
  excessReagents:  Record<string, number>; // moles left over
}

export interface TitrationCalcResult {
  unknownConc:   number;   // mol/L of analyte
  molesAtEP:     number;
  volumeAtEP:    number;   // mL
  percentError?: number;
}

export interface CalorimetryCalcResult {
  qJoules:        number;   // heat (J), negative = exothermic
  deltaHkJperMol: number;   // molar enthalpy kJ/mol
  deltaT:         number;   // °C
  massG:          number;
  percentError?:  number;
}

export type GasLawVariable = "P" | "V" | "T" | "n";

export interface GasLawCalcResult {
  law:        "boyle" | "charles" | "combined" | "ideal";
  calculated: number;
  variable:   GasLawVariable;
  unit:       string;
}

export interface EquilibriumCalcResult {
  keq:            number;
  concentrations: Record<string, number>;
  direction:      "forward" | "reverse" | "none";
  qc:             number;
}

export interface KineticsCalcResult {
  rate:        number;    // mol/L/s
  halfLife?:   number;    // s (first-order only)
  order:       0 | 1 | 2;
  rateConstant: number;
}

export interface ElectrochemCalcResult {
  moles:         number;
  massG:         number;
  chargeC:       number;
  gasVolumeMl?:  number;  // for gaseous products at STP
}

// ─── Simulation Session ───────────────────────────────────────────────────────

export type ExperimentDomain =
  | "titration"
  | "calorimetry"
  | "gas-laws"
  | "equilibrium"
  | "kinetics"
  | "electrolysis"
  | "precipitation"
  | "flame-test"
  | "separation"
  | "redox"
  | "neutralization"
  | "salt-analysis"
  | "water-hardness"
  | "functional-groups"
  | "chromatography"
  | "density"
  | "dissolving-rate"
  | "indicator-test"
  | "filtration"
  | "gas-collection";

export interface SimulationSessionConfig {
  experimentId?:   string;
  domain:          ExperimentDomain;
  difficulty?:     "beginner" | "intermediate" | "advanced";
  enableNoise?:    boolean;
  enableVariance?: boolean;
  reagentIds?:     ReagentId[];
  apparatusIds?:   string[];
  includeUnknown?: boolean;
  unknownType?:    UnknownSample["type"];
}

export interface SimulationSession {
  sessionId:      string;
  experimentId:   string;
  domain:         ExperimentDomain;
  difficulty:     "beginner" | "intermediate" | "advanced";
  createdAt:      number;
  environment:    EnvironmentState;
  reagents:       Record<ReagentId, ReagentState>;
  apparatus:      Record<string, ApparatusCondition>;
  unknownSample:  UnknownSample | null;
  actions:        StudentAction[];
  actionSummary:  ActionSummary;
  enableNoise:    boolean;
  enableVariance: boolean;
  metadata:       Record<string, unknown>;
}
