export type ExperimentMode   = "guided" | "free";
export type ExperimentStatus =
  | "idle"
  | "setup"
  | "ready"       // setup complete, awaiting first action
  | "running"
  | "paused"
  | "completed"
  | "failed";

export type IndicatorName    = "phenolphthalein" | "litmus" | "methylOrange";
export type ElectrolyteId    =
  | "sodium-chloride"
  | "sulfuric-acid"
  | "copper-sulfate"
  | "sodium-hydroxide"
  | "distilled-water";
export type ElectrodeMaterial = "platinum" | "carbon" | "copper";
export type TitrantFlowRate   = 0.1 | 0.5 | 1 | 5;

// ─── Flame Test ───────────────────────────────────────────────────────────────
export type FlameTestSampleId =
  | "lithium-chloride"
  | "sodium-chloride"
  | "potassium-chloride"
  | "barium-chloride"
  | "copper-sulfate"
  | "calcium-chloride"
  | "strontium-chloride";

// ─── Solubility ───────────────────────────────────────────────────────────────
export type SolutionId =
  | "silver-nitrate"
  | "sodium-chloride-sol"
  | "potassium-iodide"
  | "calcium-chloride-sol"
  | "sodium-sulfate"
  | "barium-chloride-sol"
  | "lead-nitrate"
  | "sodium-hydroxide-sol"
  | "iron-nitrate";

// ─── Reaction Rate ────────────────────────────────────────────────────────────
export type SurfaceAreaType = "powder" | "granules" | "chips" | "solid";

// ─── Gas Laws ─────────────────────────────────────────────────────────────────
export type GasLaw = "boyle" | "charles";

export interface ObservationEvent {
  id:        string;
  timestamp: number;
  type:
    | "color-change"
    | "gas-evolution"
    | "endpoint-reached"
    | "neutralization"
    | "overheating"
    | "contamination"
    | "conductivity-change"
    | "reaction-start"
    | "reaction-complete"
    | "precipitation"
    | "no-reaction"
    | "rate-change"
    | "pressure-change"
    | "equilibrium-shift"
    | "temperature-change"
    | "deposition"
    | "heat-released";
  message:  string;
  severity: "info" | "warning" | "success" | "error";
}

export interface StepDef {
  id:          string;
  instruction: string;
  hint?:       string;
  completed:   boolean;
}

export interface ExperimentObjective {
  id:          string;
  description: string;
  completed:   boolean;
}

export interface ExperimentResult {
  completedAt:  number;
  success:      boolean;
  score:        number;
  summary:      string;
  explanation:  string;
  precision?:   number; // deviation from equivalence point (mL), undefined if N/A
}

export interface ValidationError {
  code:    string;
  message: string;
}

// ─── Titration ────────────────────────────────────────────────────────────────

export interface TitrationFlask {
  pH:             number;
  color:          string;
  volume:         number;
  indicator:      IndicatorName | null;
  indicatorAdded: boolean;
}

export interface TitrationBurette {
  volumeRemaining: number;
  flowRate:        TitrantFlowRate;
  stopcockOpen:    boolean;
}

export interface TitrationState {
  mode:              ExperimentMode;
  status:            ExperimentStatus;
  flask:             TitrationFlask;
  burette:           TitrationBurette;
  volumeAdded:       number;
  titrationCurve:    Array<{ v: number; pH: number }>;
  equivalenceVolume: number;
  endpointReached:   boolean;
  overshot:          boolean;
  steps:             StepDef[];
  objectives:        ExperimentObjective[];
  observations:      ObservationEvent[];
  result:            ExperimentResult | null;
  startedAt:         number | null;
}

// ─── Electrolysis ─────────────────────────────────────────────────────────────

export interface ElectrodeState {
  material:    ElectrodeMaterial;
  polarity:    "anode" | "cathode";
  connected:   boolean;
  gasFormula:  string | null;
  gasMoles:    number;
  bubbleRate:  number;
}

export interface ElectrolysisState {
  mode:             ExperimentMode;
  status:           ExperimentStatus;
  electrolyte:      ElectrolyteId | null;
  electrolyteConc:  number;
  anode:            ElectrodeState;
  cathode:          ElectrodeState;
  circuitComplete:  boolean;
  current:          number;   // derived from voltage + conductivity
  voltage:          number;   // user-controlled (0–12 V)
  runTimeSeconds:   number;
  anodeGasMl:       number;
  cathodeGasMl:     number;
  steps:            StepDef[];
  objectives:       ExperimentObjective[];
  observations:     ObservationEvent[];
  result:           ExperimentResult | null;
  startedAt:        number | null;
}

// ─── Flame Test ───────────────────────────────────────────────────────────────

export interface FlameTestRecord {
  id:              string;
  sampleId:        FlameTestSampleId;
  flameColor:      string;
  colorName:       string;
  contaminated:    boolean;
  timestamp:       number;
}

export interface FlameTestState {
  mode:              ExperimentMode;
  status:            ExperimentStatus;
  flameLit:          boolean;
  selectedSample:    FlameTestSampleId | null;
  loopDipped:        boolean;
  loopClean:         boolean;
  contaminated:      boolean;
  lastTestedSample:  FlameTestSampleId | null;
  currentFlameColor: string | null;
  testHistory:       FlameTestRecord[];
  steps:             StepDef[];
  objectives:        ExperimentObjective[];
  observations:      ObservationEvent[];
  result:            ExperimentResult | null;
  startedAt:         number | null;
}

// ─── Solubility / Precipitation ───────────────────────────────────────────────

export interface PrecipitateInfo {
  formula:      string;
  color:        string;        // hex colour of precipitate
  colorName:    string;
  netIonic:     string;
  explanation:  string;
}

export interface SolubilityTestRecord {
  id:            string;
  solutionA:     SolutionId;
  solutionB:     SolutionId;
  hasPrecipitate: boolean;
  precipitate:   PrecipitateInfo | null;
  timestamp:     number;
}

export interface SolubilityState {
  mode:          ExperimentMode;
  status:        ExperimentStatus;
  solutionA:     SolutionId | null;
  solutionB:     SolutionId | null;
  precipitate:   PrecipitateInfo | null;
  hasPrecipitate: boolean;
  mixProgress:   number;         // 0–1, animation driven
  testHistory:   SolubilityTestRecord[];
  steps:         StepDef[];
  objectives:    ExperimentObjective[];
  observations:  ObservationEvent[];
  result:        ExperimentResult | null;
  startedAt:     number | null;
}

// ─── Reaction Rate ────────────────────────────────────────────────────────────

export interface ReactionRateDataPoint {
  time:     number;   // seconds elapsed
  progress: number;   // 0–100 %
}

export interface ReactionRateState {
  mode:            ExperimentMode;
  status:          ExperimentStatus;
  temperature:     number;        // °C, range 15–80
  concentration:   number;        // mol/L, range 0.1–2.0
  surfaceArea:     SurfaceAreaType;
  rateMultiplier:  number;        // computed from the three factors above
  progress:        number;        // 0–100 %
  timeElapsed:     number;        // seconds
  dataPoints:      ReactionRateDataPoint[];
  steps:           StepDef[];
  objectives:      ExperimentObjective[];
  observations:    ObservationEvent[];
  result:          ExperimentResult | null;
  startedAt:       number | null;
}

// ─── Gas Laws ─────────────────────────────────────────────────────────────────

export interface GasDataPoint {
  x: number;   // Volume (L) for Boyle's; Temperature (K) for Charles's
  y: number;   // Pressure (atm) for Boyle's; Volume (L) for Charles's
}

export interface GasLawsState {
  mode:               ExperimentMode;
  status:             ExperimentStatus;
  law:                GasLaw | null;
  nMoles:             number;   // fixed moles of gas
  temperature:        number;   // K
  volume:             number;   // L
  pressure:           number;   // atm
  referenceTemp:      number;   // K  – held constant in Boyle's
  referencePressure:  number;   // atm – held constant in Charles's
  dataPoints:         GasDataPoint[];
  steps:              StepDef[];
  objectives:         ExperimentObjective[];
  observations:       ObservationEvent[];
  result:             ExperimentResult | null;
  startedAt:          number | null;
}

// ─── Chemical Equilibrium (Le Chatelier) ──────────────────────────────────────

export type EquilibriumPerturbation =
  | "add-fe3"      // add more Fe³⁺
  | "add-scn"      // add more SCN⁻
  | "remove-fescn" // precipitate FeSCN²⁺ (simulate removal)
  | "dilute"       // add water
  | "heat"         // raise temperature
  | "cool";        // lower temperature

export interface ChemicalEquilibriumState {
  mode:            ExperimentMode;
  status:          ExperimentStatus;
  temperatureK:    number;    // 273–373 K
  concFe3:         number;    // [Fe³⁺]  mol/L
  concSCN:         number;    // [SCN⁻]  mol/L
  concFeSCN:       number;    // [FeSCN²⁺] mol/L
  keq:             number;    // equilibrium constant at current T
  q:               number;    // current reaction quotient
  shiftDirection:  "forward" | "reverse" | "none";
  atEquilibrium:   boolean;
  perturbHistory:  string[];
  steps:           StepDef[];
  objectives:      ExperimentObjective[];
  observations:    ObservationEvent[];
  result:          ExperimentResult | null;
  startedAt:       number | null;
}

// ─── Gas Collection ───────────────────────────────────────────────────────────

export interface GasCollectionState {
  mode:              ExperimentMode;
  status:            ExperimentStatus;
  caco3Grams:        number;    // grams of marble chips in flask
  hclVolumeMl:       number;    // mL of HCl added to flask
  hclConc:           number;    // mol/L (fixed 1.0 M)
  caco3MolesLeft:    number;    // unreacted moles of CaCO₃
  hclMolesLeft:      number;    // unreacted moles of HCl
  co2CollectedMl:    number;    // mL of CO₂ collected
  theoreticalCo2Ml: number;    // stoichiometric expected volume
  reactionComplete:  boolean;
  steps:             StepDef[];
  objectives:        ExperimentObjective[];
  observations:      ObservationEvent[];
  result:            ExperimentResult | null;
  startedAt:         number | null;
}

// ─── Redox Displacement ───────────────────────────────────────────────────────

export type MetalId =
  | "magnesium"
  | "zinc"
  | "iron"
  | "lead"
  | "copper"
  | "silver";

export interface RedoxDisplacementState {
  mode:              ExperimentMode;
  status:            ExperimentStatus;
  selectedMetal:     MetalId | null;
  metalMassG:        number;    // grams placed in solution
  cupricConc:        number;    // [Cu²⁺] mol/L — decreases as Cu deposits
  solutionVolumeMl:  number;    // fixed 100 mL
  cuDepositedG:      number;    // grams of Cu deposited on electrode
  metalConsumedG:    number;    // grams of selected metal consumed
  reactionOccurs:    boolean;   // false for Cu and Ag
  steps:             StepDef[];
  objectives:        ExperimentObjective[];
  observations:      ObservationEvent[];
  result:            ExperimentResult | null;
  startedAt:         number | null;
}

// ─── Calorimetry (Neutralization Heat) ───────────────────────────────────────

export interface CalorimetryDataPoint {
  naohVolumeMl: number;
  tempC:        number;
}

export interface CalorimetryState {
  mode:              ExperimentMode;
  status:            ExperimentStatus;
  hclVolumeMl:       number;    // fixed 100 mL
  hclConc:           number;    // fixed 1.0 M
  naohConc:          number;    // fixed 1.0 M
  naohAddedMl:       number;    // mL of NaOH added so far
  initialTempC:      number;    // 25°C
  currentTempC:      number;    // rises as NaOH added
  dataPoints:        CalorimetryDataPoint[];
  calculatedDeltaH:  number | null;  // kJ/mol (negative, exothermic)
  steps:             StepDef[];
  objectives:        ExperimentObjective[];
  observations:      ObservationEvent[];
  result:            ExperimentResult | null;
  startedAt:         number | null;
}
