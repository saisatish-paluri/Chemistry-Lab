import type {
  InstrumentReading,
  ExperimentalError,
  TitrationMeasurements,
  CalorimetryMeasurements,
  GasLawsMeasurements,
} from "@/lib/instruments/types";

// Re-export so callers can import measurement types from either location.
export type { InstrumentReading, ExperimentalError, TitrationMeasurements, CalorimetryMeasurements, GasLawsMeasurements };

export type ExperimentMode   = "guided" | "free" | "exam" | "advanced";
export type ExperimentStatus =
  | "idle"
  | "setup"
  | "ready"       // setup complete, awaiting first action
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "heating"
  | "cooling"
  | "reacting";

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
export type GasLaw = "boyle" | "charles" | "gay-lussac";

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
    | "heat-released"
    | "leak-alert"
    | "info"
    | "warning"
    | "error"
    | "state_change"
    | "chemical_added";
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
  /** Live instrument readings with uncertainty metadata. */
  measurements:      TitrationMeasurements | null;
  /** Experimental errors rolled at session start. */
  activeErrors:      ExperimentalError[];
  // ── Session-derived fields (sim-bridge) ────────────────────────────────────
  /** Effective acid concentration in the flask (mol/L). */
  acidConc:          number;
  /** Effective base concentration in the burette (mol/L). */
  baseConc:          number;
  /** Volume of acid pipetted into the flask (mL). */
  acidVolMl:         number;
  /** True acid concentration for % error reporting. */
  trueAcidConc:      number;
  /** ±mL endpoint detection noise from burette apparatus. */
  endpointNoiseMl:   number;
  acidType:          "strong" | "weak";
  baseType:          "strong" | "weak";
  acidName:          "HCl" | "CH3COOH";
  baseName:          "NaOH" | "NH3";
  trialCount:        number;
  trialVolumes:      number[];
  /** Incremented each time user swirls the flask — drives animation. */
  swirlCount:        number;
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
  current:          number;
  voltage:          number;
  runTimeSeconds:   number;
  anodeGasMl:       number;
  cathodeGasMl:     number;
  steps:            StepDef[];
  objectives:       ExperimentObjective[];
  observations:     ObservationEvent[];
  result:           ExperimentResult | null;
  startedAt:        number | null;
  temperatureC:     number;
  _conductivityScale: number;  // apparatus-derived scaling factor
  /** Additional overpotential from electrode surface condition (V). Added to thermodynamic minimum. */
  _overpotentialOffset: number;
  /** Minimum voltage required to drive this electrolyte (theoretical + overpotential). */
  minVoltage:       number;
  overpotentialActive: boolean;
  cathodeMassGainG?: number;
  anodeMassLossG?: number;
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
  /** Rendered colour intensity (0.3–1.0): varies by sample purity and technique. */
  flameIntensity:    number;
  testHistory:       FlameTestRecord[];
  steps:             StepDef[];
  objectives:        ExperimentObjective[];
  observations:      ObservationEvent[];
  result:            ExperimentResult | null;
  startedAt:         number | null;
  // ── Session-derived fields ─────────────────────────────────────────────────
  /** Session-rolled probability (0–0.4) that a dirty loop contaminates a result. */
  contaminationProbability: number;
  /** Session-rolled unknown sample that the student must identify. null = open mode. */
  unknownSampleId:   FlameTestSampleId | null;

  // Overhaul variables
  concentration:     number;    // M
  airCollarOpen:     boolean;   // true = non-luminous blue, false = luminous yellow soot
  contaminationLevel: number;   // %
  cobaltGlass:       boolean;   // filter toggled
  experimentalError: number;
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
  temperature:   number;
  volumeA:       number;
  volumeB:       number;
  concA:         number;
  concB:         number;
  precipitateMass: number;
  turbidity:     number;
}

// ─── Reaction Rate ────────────────────────────────────────────────────────────

export interface ReactionRateDataPoint {
  time:     number;   // seconds elapsed
  progress: number;   // 0–100 %
}

export interface ReactionRateState {
  mode:            ExperimentMode;
  status:          ExperimentStatus;
  temperature:     number;
  concentration:   number;
  surfaceArea:     SurfaceAreaType;
  rateMultiplier:  number;
  progress:        number;
  timeElapsed:     number;
  dataPoints:      ReactionRateDataPoint[];
  steps:           StepDef[];
  objectives:      ExperimentObjective[];
  observations:    ObservationEvent[];
  result:          ExperimentResult | null;
  startedAt:       number | null;
  // ── Session-derived fields ─────────────────────────────────────────────────
  _envRateMultiplier: number;   // Arrhenius multiplier from lab environment
  _baseRatePctPerSec: number;   // Session-rolled base rate constant
  /** Whether a catalyst has been added to the reaction vessel. */
  catalystAdded:   boolean;
  /** Rate multiplier from catalyst (session-rolled, 1.0 when no catalyst). */
  _catalystFactor: number;
  /** Fraction of reactant remaining (1.0 → 0.0 as reaction proceeds). Drives first-order kinetics. */
  concFraction:    number;
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
  /** Volume held constant for Gay-Lussac's Law (L). */
  referenceVolume:    number;
  dataPoints:         GasDataPoint[];
  steps:              StepDef[];
  objectives:         ExperimentObjective[];
  observations:       ObservationEvent[];
  result:             ExperimentResult | null;
  startedAt:          number | null;
  measurements:       GasLawsMeasurements | null;
  activeErrors:       ExperimentalError[];
  gasType:            "he" | "n2" | "co2";
  sealQuality:        number; // 0 to 1
  pistonFriction:     number; // 0 to 1
  calibrationBias:    number; // bias factor, e.g. 1.015
  leakRate:           number; // calculated leak rate
  lastVolumeChangeDirection: "up" | "down" | "none";
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
  temperatureK:    number;
  concFe3:         number;
  concSCN:         number;
  concFeSCN:       number;
  keq:             number;
  q:               number;
  shiftDirection:  "forward" | "reverse" | "none";
  atEquilibrium:   boolean;
  /**
   * Fraction of equilibration complete after the last perturbation (0–1).
   * The system moves from Q → Keq over multiple ticks; 1.0 = fully equilibrated.
   * Drives smooth colour and concentration animation in the UI.
   */
  equilibrationFraction: number;
  perturbHistory:  string[];
  steps:           StepDef[];
  objectives:      ExperimentObjective[];
  observations:    ObservationEvent[];
  result:          ExperimentResult | null;
  startedAt:       number | null;
  // ── Session-derived fields ─────────────────────────────────────────────────
  _tempPerturbK:   number;   // K step for heat/cool perturbations
  _addConc:        number;   // mol/L step for add-fe3/add-scn
  /** Pre-equilibration concentrations — snapshot at moment of perturbation. */
  _preEqFe3:       number;
  _preEqSCN:       number;
  _preEqFeSCN:     number;
  /** Target concentrations after full equilibration. */
  _targetFe3:      number;
  _targetSCN:      number;
  _targetFeSCN:    number;
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
  theoreticalCo2Ml:  number;    // stoichiometric expected volume
  reactionComplete:  boolean;
  steps:             StepDef[];
  objectives:        ExperimentObjective[];
  observations:      ObservationEvent[];
  result:            ExperimentResult | null;
  startedAt:         number | null;

  // Overhaul variables
  temperature:       number;    // °C
  pressure:          number;    // atm
  leakRate:          number;    // %
  gasPurity:         number;    // %
  collectionEfficiency: number; // %
  experimentalError: number;
  bubbleRate:        number;    // scale factor for bubble generation animation
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
  // session-derived
  _cuConc:           number;
  _metalMassG:       number;
  _rateMultiplier:   number;

  // Overhaul variables
  temperature:       number;    // °C
  metalConc:         number;    // [Mᶻ⁺] mol/L — increases during reaction
  cellPotential:     number;    // V (Nernst calculated)
  equilibriumReached: boolean;
  experimentalError: number;
}

// ─── Calorimetry (Neutralization Heat) ───────────────────────────────────────

export interface CalorimetryDataPoint {
  naohVolumeMl: number;
  tempC:        number;
}

export interface CalorimetryState {
  mode:              ExperimentMode;
  status:            ExperimentStatus;
  hclVolumeMl:       number;
  hclConc:           number;
  naohConc:          number;
  naohAddedMl:       number;
  initialTempC:      number;
  currentTempC:      number;
  dataPoints:        CalorimetryDataPoint[];
  calculatedDeltaH:  number | null;
  steps:             StepDef[];
  objectives:        ExperimentObjective[];
  observations:      ObservationEvent[];
  result:            ExperimentResult | null;
  startedAt:         number | null;
  measurements:      CalorimetryMeasurements | null;
  activeErrors:      ExperimentalError[];
  // ── Session-derived fields ─────────────────────────────────────────────────
  heatLossProb:      number;   // 0-1, probability a heat loss error occurs per addition
  heatLossMagnitude: number;   // fractional ΔT deduction when heat loss occurs
}

// ─── Density / Floating-Sinking (Class 6) ─────────────────────────────────────

export type DensityMaterialId =
  | "wood"
  | "ice"
  | "plastic"
  | "wax"
  | "rubber"
  | "aluminum"
  | "steel"
  | "stone";

export interface DensityState {
  mode:             ExperimentMode;
  status:           ExperimentStatus;
  selectedMaterial: DensityMaterialId | null;
  isDropping:       boolean;
  isSettled:        boolean;
  testedMaterials:  DensityMaterialId[];
  steps:            StepDef[];
  objectives:       ExperimentObjective[];
  observations:     ObservationEvent[];
  result:           ExperimentResult | null;
  startedAt:        number | null;
  mass:             number;
  volume:           number;
  temperature:      number;
  salinity:         number;
  fluidDensity:     number;
  solidDensity:     number;
  displacementRatio: number;
}

// ─── Dissolving Rate (Class 6–7) ───────────────────────────────────────────────

export type DissolveTemp        = "cold" | "warm" | "hot";
export type DissolveGranularity = "coarse" | "fine" | "powder";

export interface DissolvingDataPoint {
  label: string;
  time:  number; // simulated seconds
}

export interface DissolvingRateState {
  mode:             ExperimentMode;
  status:           ExperimentStatus;
  temperature:      DissolveTemp;
  granularity:      DissolveGranularity;
  stirring:         boolean;
  isDissolving:     boolean;
  dissolveProgress: number;        // 0–100
  dissolveTime:     number | null; // simulated seconds when complete
  dataPoints:       DissolvingDataPoint[];
  steps:            StepDef[];
  objectives:       ExperimentObjective[];
  observations:     ObservationEvent[];
  result:           ExperimentResult | null;
  startedAt:        number | null;
  massAdded:        number;
  dissolvedMass:    number;
  waterVolume:      number;
  celsius:          number;
  solubilityLimit:  number;
  surfaceArea:      number;
  isSaturated:      boolean;
}

// ─── Indicator Test (Class 7) ──────────────────────────────────────────────────

export type IndicatorTestId =
  | "turmeric"
  | "red-litmus"
  | "blue-litmus"
  | "cabbage-juice";

export type TestSubstanceId =
  | "vinegar"
  | "lemon-juice"
  | "baking-soda"
  | "soap-solution"
  | "milk"
  | "distilled-water"
  | "ammonia"
  | "salt-solution";

export type AcidityClass = "acidic" | "neutral" | "basic";

export interface IndicatorTestRecord {
  id:             string;
  indicator:      IndicatorTestId;
  substance:      TestSubstanceId;
  resultColor:    string;
  classification: AcidityClass;
  pH:             number;
  timestamp:      number;
}

export interface IndicatorTestState {
  mode:              ExperimentMode;
  status:            ExperimentStatus;
  selectedIndicator: IndicatorTestId | null;
  selectedSubstance: TestSubstanceId | null;
  isTesting:         boolean;
  currentResult:     { color: string; classification: AcidityClass; pH: number } | null;
  testHistory:       IndicatorTestRecord[];
  steps:             StepDef[];
  objectives:        ExperimentObjective[];
  observations:      ObservationEvent[];
  result:            ExperimentResult | null;
  startedAt:         number | null;
}

// ─── Filtration Basics (Class 6) ──────────────────────────────────────────────

export type FiltrationStage =
  | "setup"
  | "mixing"
  | "mixed"
  | "pouring"
  | "filtering"
  | "complete";

export interface FiltrationState {
  mode:           ExperimentMode;
  status:         ExperimentStatus;
  stage:          FiltrationStage;
  sandGrams:      number;
  saltGrams:      number;
  waterMl:        number;
  mixProgress:    number; // 0–1
  filterProgress: number; // 0–1
  filtrateVolume: number; // mL clear filtrate collected
  residueMass:    number; // g sand remaining on filter
  steps:          StepDef[];
  objectives:     ExperimentObjective[];
  observations:   ObservationEvent[];
  result:         ExperimentResult | null;
  startedAt:      number | null;
  temperature:    number;
  funnelVolume:   number;
  viscosity:      number;
  cloggingFactor: number;
  flowRate:       number;
}

// ─── Neutralization Reaction ──────────────────────────────────────────────────
export type NeutStepId = "measure-hcl" | "measure-naoh" | "mix" | "observe" | "record";

export interface NeutralizationState {
  mode:           ExperimentMode;
  status:         ExperimentStatus;
  currentStep:    NeutStepId;
  hclVolumeMl:    number;
  naohVolumeMl:   number;
  isMixing:       boolean;
  mixProgress:    number;
  initialTempC:   number;
  currentTempC:   number;
  reactionDone:   boolean;
  saltFormed:     boolean;
  steps:          StepDef[];
  objectives:     ExperimentObjective[];
  observations:   ObservationEvent[];
  result:         ExperimentResult | null;
  startedAt:      number | null;

  // Overhaul variables
  acidType:       "strong" | "weak";
  baseType:       "strong" | "weak";
  acidConc:       number;    // M
  baseConc:       number;    // M
  beakerInsulated: boolean;  // true = calorimeter, false = glass beaker
  currentPh:      number;    // pH value
  heatEvolvedJ:   number;    // J
  experimentalError: number;
  indicator:      "universal" | "phenolphthalein" | "bromothymol" | "methyl-orange";
}

// ─── Qualitative Salt Analysis ────────────────────────────────────────────────
export type SaltCationId   = "copper" | "iron" | "zinc" | "calcium" | "ammonium";
export type SaltAnionId    = "chloride" | "sulfate" | "carbonate" | "nitrate";
export type UnknownSaltId  =
  | "copper-sulfate"
  | "iron-chloride"
  | "zinc-carbonate"
  | "calcium-nitrate"
  | "ammonium-chloride";

export type SaltTestPhase = "select" | "preliminary" | "cation" | "anion" | "identify";

export interface SaltTestResult {
  testName:      string;
  observation:   string;
  color:         string;
  precipitate:   boolean;
  effervescence: boolean;
  timestamp:     number;
}

export interface SaltAnalysisState {
  mode:             ExperimentMode;
  status:           ExperimentStatus;
  selectedSalt:     UnknownSaltId | null;
  phase:            SaltTestPhase;
  cationResults:    SaltTestResult[];
  anionResults:     SaltTestResult[];
  identifiedCation: SaltCationId | null;
  identifiedAnion:  SaltAnionId | null;
  currentTest:      string | null;
  isTesting:        boolean;
  testProgress:     number;
  steps:            StepDef[];
  objectives:       ExperimentObjective[];
  observations:     ObservationEvent[];
  result:           ExperimentResult | null;
  startedAt:        number | null;
  // Overhaul variables
  temperature:      number;
  reagentDrops:     number;
  reagentConc:      number;
  contamination:    number;
  experimentalError: number;
  
  // Accumulated reagent variables
  cationDropsAdded: number;
  anionDropsAdded:  number;
  cationReagentConc: number;
  anionReagentConc: number;
  
  // Live tube properties
  cationLiquidColor: string;
  cationPptColor:    string | null;
  cationPptMass:     number; // in mg
  cationBubbles:     boolean;
  cationGasLabel:    string;
  
  anionLiquidColor:  string;
  anionPptColor:     string | null;
  anionPptMass:      number; // in mg
  anionBubbles:      boolean;
  anionGasLabel:     string;
  
  flameColor:        string | null;
}

// ─── Water Hardness (EDTA Titration) ──────────────────────────────────────────
export type HardnessCategory = "soft" | "moderately-hard" | "hard" | "very-hard";

export interface WaterHardnessState {
  mode:             ExperimentMode;
  status:           ExperimentStatus;
  buretteFilled:    boolean;
  samplePrepared:   boolean;
  indicatorAdded:   boolean;
  edtaAddedMl:      number;
  endpointReached:  boolean;
  solutionColor:    string;
  hardnessMgL:      number | null;
  hardnessCategory: HardnessCategory | null;
  isTitrating:      boolean;
  steps:            StepDef[];
  objectives:       ExperimentObjective[];
  observations:     ObservationEvent[];
  result:           ExperimentResult | null;
  startedAt:        number | null;
  // ── Session-derived fields ─────────────────────────────────────────────────
  edtaConc:         number;   // mol/L (from session reagent)
  endpointMl:       number;   // mL EDTA at equivalence (derived from true hardness)
  trueHardnessMgL:  number;   // true hardness for % error reporting
  sampleVolMl:      number;
  /**
   * ±noise on endpoint detection (mL). Simulates indicator colour change
   * transition range — the endpoint appears slightly early or late each run.
   * Session-rolled from Gaussian σ=0.4 mL.
   */
  endpointNoiseMl:  number;
  /** Number of titration trials completed (supports repeat-trial workflow). */
  trialCount:       number;
  /** EDTA volumes recorded at endpoint for each trial (mL). */
  trialVolumes:     number[];
}

// ─── Functional Group Identification ─────────────────────────────────────────
export type FunctionalGroupId    = "alcohol" | "aldehyde" | "ketone" | "carboxylic-acid" | "amine";
export type FGTestId =
  | "lucas-test"
  | "tollens-test"
  | "dnp-test"
  | "nahco3-test"
  | "hinsberg-test";
export type UnknownCompoundId =
  | "compound-a"
  | "compound-b"
  | "compound-c"
  | "compound-d"
  | "compound-e";

export interface FGTestResult {
  testId:        FGTestId;
  testName:      string;
  observation:   string;
  color:         string;
  positive:      boolean;
  timestamp:     number;
}

export interface FunctionalGroupsState {
  mode:             ExperimentMode;
  status:           ExperimentStatus;
  selectedCompound: UnknownCompoundId | null;
  selectedTest:     FGTestId | null;
  testResults:      FGTestResult[];
  isTesting:        boolean;
  identified:       FunctionalGroupId | null;
  steps:            StepDef[];
  objectives:       ExperimentObjective[];
  observations:     ObservationEvent[];
  result:           ExperimentResult | null;
  startedAt:        number | null;
  // Overhaul variables
  temperature:      number;
  reagentConc:      number;
  elapsedTime:      number;
  turbidity:        number;
  experimentalError: number;
}

// ─── Paper Chromatography ─────────────────────────────────────────────────────
export type InkId = "black-ink" | "blue-ink" | "green-ink" | "red-ink";

export interface ChromaDye {
  name:       string;
  color:      string;
  rfValue:    number;
  distanceCm: number;
}

export interface ChromatographyState {
  mode:           ExperimentMode;
  status:         ExperimentStatus;
  selectedInk:    InkId | null;
  inkApplied:     boolean;
  paperInChamber: boolean;
  solventAdded:   boolean;
  isRunning:      boolean;
  solventFrontCm: number;
  dyes:           ChromaDye[];
  rfValues:       { name: string; rf: number; color: string }[];
  runComplete:    boolean;
  steps:          StepDef[];
  objectives:     ExperimentObjective[];
  observations:   ObservationEvent[];
  result:         ExperimentResult | null;
  startedAt:      number | null;

  // Overhaul variables
  solventType:    "water" | "ethanol" | "ethyl-acetate" | "hexane";
  temperature:    number;    // °C
  chamberSealed:  boolean;   // true = sealed, false = unsealed (solvent evaporates)
  spotWidths:     number[];  // parallel array matching dyes/inks
  experimentalError: number;
}

// ─── Crystallization ──────────────────────────────────────────────────────────
export interface CrystallizationState {
  mode:                 ExperimentMode;
  status:               ExperimentStatus;
  impureSaltMass:       number; // in grams
  waterVolume:          number; // in mL
  temperature:          number; // in Celsius
  dissolvedMass:        number; // in grams
  undissolvedMass:      number; // in grams
  crystalsFormedMass:   number; // in grams
  crystalSize:          number; // in mm
  impurityLevel:        number; // percentage (e.g. 5)
  coolingRate:          "slow" | "medium" | "fast";
  isHeating:            boolean;
  isCooling:            boolean;
  filtrateVolume:       number; // in mL
  pureProductCollected: number; // final crystals collected after filtration
  productPurity:        number; // final purity percentage
  dissolvedImpurityMass: number;
  solidImpurityMass:    number;
  crystalColor:         string;
  isFiltered:           boolean;
  isCollected:          boolean;
  stepProgress:         number; // 0 to 1
  steps:                StepDef[];
  objectives:           ExperimentObjective[];
  observations:         ObservationEvent[];
  result:               ExperimentResult | null;
  startedAt:            number | null;
}

// ─── Natural Indicators ────────────────────────────────────────────────────────
export interface NaturalIndicatorsState {
  mode:                 ExperimentMode;
  status:               ExperimentStatus;
  selectedIndicator:    "turmeric" | "china-rose" | "red-cabbage" | null;
  preparationStep:      "mortar" | "solvent" | "extracted" | null;
  extractProgress:      number; // 0 to 1
  extractConcentration: number; // 0 to 1
  selectedSolution:     "hcl" | "vinegar" | "lemon-juice" | "water" | "soap" | "naoh" | null;
  solutionPh:           number;
  addedIndicatorDrops:  number;
  liquidColor:          string;
  colorMixProgress:     number; // 0 to 1
  steps:                StepDef[];
  objectives:           ExperimentObjective[];
  observations:         ObservationEvent[];
  result:               ExperimentResult | null;
  startedAt:            number | null;
}

// ─── Acid-Metal Reactions ──────────────────────────────────────────────────────
export interface AcidMetalState {
  mode:                 ExperimentMode;
  status:               ExperimentStatus;
  selectedMetal:        "mg" | "zn" | "fe" | "cu" | null;
  metalMass:            number; // in grams
  particleSize:         "powder" | "turnings" | "ribbon" | "strip";
  selectedAcid:         "hcl" | "h2so4" | null;
  acidVolume:           number; // in mL
  acidConcentration:    number; // in M
  temperature:          number; // in Celsius
  isReacting:           boolean;
  metalLeft:            number; // in grams
  gasVolumeCollected:   number; // in mL
  reactionRate:         number; // in mL/s
  elapsedTime:          number; // in seconds
  experimentalError:    number; // stoichiometry variation
  popTestTriggered:     boolean;
  popTestSuccess:       boolean | null;
  steps:                StepDef[];
  objectives:           ExperimentObjective[];
  observations:         ObservationEvent[];
  result:               ExperimentResult | null;
  startedAt:            number | null;
}

// ─── Acid-Carbonate Reactions ──────────────────────────────────────────────────
export interface AcidCarbonateState {
  mode:                 ExperimentMode;
  status:               ExperimentStatus;
  selectedCarbonate:    "marble-chips" | "caco3-powder" | "na2co3" | null;
  carbonateMass:        number; // in grams
  selectedAcid:         "hcl" | "h2so4" | null;
  acidVolume:           number; // in mL
  acidConcentration:    number; // in M
  temperature:          number; // in Celsius
  isReacting:           boolean;
  stopperSealed:        boolean; // false = leak error
  pressure:             number; // in atm
  carbonateLeft:        number; // in grams
  gasVolumeCollected:   number; // in mL
  reactionRate:         number; // in mL/s
  elapsedTime:          number; // in seconds
  limeWaterMilky:       boolean; // test for CO2
  limeWaterTestActive:  boolean;
  steps:                StepDef[];
  objectives:           ExperimentObjective[];
  observations:         ObservationEvent[];
  result:               ExperimentResult | null;
  startedAt:            number | null;
}

// ─── States of Matter ──────────────────────────────────────────────────────────
export interface StatesOfMatterState {
  mode:                 ExperimentMode;
  status:               ExperimentStatus;
  selectedSubstance:    "water" | "ethanol" | "wax" | null;
  temperature:          number; // in Celsius
  phase:                "solid" | "liquid" | "gas" | "solid-liquid" | "liquid-gas";
  heatingPower:         number; // in W
  isHeating:            boolean;
  isCooling:            boolean;
  latentHeatProgress:   number; // 0 to 1
  elapsedTime:          number; // in seconds
  altitude:             number; // in meters
  pressure:             number; // in atm
  splatterTriggered:    boolean; // error if overheating liquid
  thermometerEyeLevelOffset: number; // eye-level reading error
  steps:                StepDef[];
  objectives:           ExperimentObjective[];
  observations:         ObservationEvent[];
  result:               ExperimentResult | null;
  startedAt:            number | null;
}

// ─── Diffusion in Liquids ──────────────────────────────────────────────────────
export interface DiffusionLiquidsState {
  mode:                 ExperimentMode;
  status:               ExperimentStatus;
  selectedSolute:       "kmno4" | "dye" | "cuso4" | null;
  temperature:          number; // in Celsius (10 to 90)
  stirringSpeed:        number; // in RPM (0 to 600)
  addedDroplets:        number;
  isStirring:           boolean;
  diffusionProgress:    number; // 0 to 1
  elapsedTime:          number; // in seconds
  steps:                StepDef[];
  objectives:           ExperimentObjective[];
  observations:         ObservationEvent[];
  result:               ExperimentResult | null;
  startedAt:            number | null;
}

// ─── Separation of Mixtures ────────────────────────────────────────────────────
export interface SeparationMixturesState {
  mode:                 ExperimentMode;
  status:               ExperimentStatus;
  ironMass:             number; // in grams
  sandMass:             number; // in grams
  saltMass:             number; // in grams
  separatedIron:        number; // in grams
  separatedSand:        number; // in grams
  separatedSalt:        number; // in grams
  waterVolume:          number; // in mL
  dissolvedSalt:        number; // in grams
  isWet:                boolean;
  currentVessel:        "beaker" | "magnet" | "filter" | "evaporate" | "complete";
  separationStep:       "initial" | "magnetic" | "dissolving" | "filtration" | "evaporation";
  magnetSweepTime:      number; // in seconds
  filtrationProgress:   number; // 0 to 1
  evaporationProgress:  number; // 0 to 1
  temperature:          number; // in Celsius
  steps:                StepDef[];
  objectives:           ExperimentObjective[];
  observations:         ObservationEvent[];
  result:               ExperimentResult | null;
  startedAt:            number | null;
}

// ─── Double Displacement Reactions ─────────────────────────────────────────────
export interface DoubleDisplacementState {
  mode:                 ExperimentMode;
  status:               ExperimentStatus;
  system:               "agno3-nacl" | "pbno3-ki" | "bacl2-na2so4" | null;
  solution1Volume:      number; // in mL
  solution2Volume:      number; // in mL
  solution1Conc:        number; // in M
  solution2Conc:        number; // in M
  temperature:          number; // in Celsius
  precipitateMass:      number; // in grams
  mixingProgress:       number; // 0 to 1
  steps:                StepDef[];
  objectives:           ExperimentObjective[];
  observations:         ObservationEvent[];
  result:               ExperimentResult | null;
  startedAt:            number | null;
}

// ─── Decomposition Reactions ───────────────────────────────────────────────────
export interface DecompositionState {
  mode:                 ExperimentMode;
  status:               ExperimentStatus;
  reactant:             "caco3" | "kclo3" | "h2o2" | null;
  initialMass:          number; // in grams
  remainingMass:        number; // in grams
  hasCatalyst:          boolean;
  temperature:          number; // in Celsius
  gasVolumeEvolved:     number; // in mL
  isHeating:            boolean;
  heatingPower:         number; // in W
  steps:                StepDef[];
  objectives:           ExperimentObjective[];
  observations:         ObservationEvent[];
  result:               ExperimentResult | null;
  startedAt:            number | null;
}

// ─── Physical vs Chemical Changes ─────────────────────────────────────────────
export interface PhysicalChemicalState {
  mode:                 ExperimentMode;
  status:               ExperimentStatus;
  selectedProcess:      "melting-wax" | "dissolving-sugar" | "freezing-water" | "burning-paper" | "rusting-iron" | "neutralization" | null;
  processType:          "physical" | "chemical" | null;
  temperature:          number; // in Celsius
  reactionProgress:     number; // 0 to 1
  heatReleasedJ:        number; // in Joules
  reversibilityChecked: boolean;
  isTriggered:          boolean;
  steps:                StepDef[];
  objectives:           ExperimentObjective[];
  observations:         ObservationEvent[];
  result:               ExperimentResult | null;
  startedAt:            number | null;
}

