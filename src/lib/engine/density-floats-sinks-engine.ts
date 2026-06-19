import type {
  DensityState, DensityMaterialId,
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

// ── Material definitions ─────────────────────────────────────────────────────
export interface DensityMaterial {
  id:           DensityMaterialId;
  name:         string;
  density:      number;   // g/cm³ (default/typical density)
  color:        string;   // CSS hex
  shape:        "cube" | "sphere" | "irregular";
  description:  string;
  funFact:      string;
}

export const DENSITY_MATERIALS: Record<DensityMaterialId, DensityMaterial> = {
  wood: {
    id: "wood", name: "Wood (Pine)", density: 0.60,
    color: "#92400e", shape: "cube",
    description: "Pine wood has many air pockets making it much lighter than water.",
    funFact: "Most wood floats — that's why wooden boats work!",
  },
  ice: {
    id: "ice", name: "Ice", density: 0.92,
    color: "#bfdbfe", shape: "irregular",
    description: "Ice is slightly less dense than liquid water — it floats just barely.",
    funFact: "Only about 10% of an iceberg is visible above water.",
  },
  plastic: {
    id: "plastic", name: "Plastic (HDPE)", density: 0.95,
    color: "#fef9c3", shape: "cube",
    description: "HDPE plastic is just slightly less dense than water.",
    funFact: "Plastic bottle caps float — that's why they wash up on beaches.",
  },
  wax: {
    id: "wax", name: "Candle Wax", density: 0.90,
    color: "#fef3c7", shape: "irregular",
    description: "Candle wax is less dense than water and floats.",
    funFact: "Wax water-proofing works partly because wax floats on water.",
  },
  rubber: {
    id: "rubber", name: "Rubber", density: 1.20,
    color: "#1c1917", shape: "cube",
    description: "Rubber is denser than water and sinks.",
    funFact: "Rubber boots keep your feet dry because rubber repels water, not floats.",
  },
  aluminum: {
    id: "aluminum", name: "Aluminium", density: 2.70,
    color: "#94a3b8", shape: "cube",
    description: "Aluminium is 2.7× denser than water — it sinks quickly.",
    funFact: "An aluminium boat floats because its hull shape displaces water — Archimedes' principle!",
  },
  steel: {
    id: "steel", name: "Steel", density: 7.85,
    color: "#475569", shape: "cube",
    description: "Steel is nearly 8× denser than water — it sinks very fast.",
    funFact: "Steel ships float because the hull + air inside reduces average density below 1.0.",
  },
  stone: {
    id: "stone", name: "Granite Stone", density: 2.65,
    color: "#78716c", shape: "irregular",
    description: "Granite is about 2.65× the density of water — it sinks.",
    funFact: "Pumice stone is the only rock that floats — it's full of tiny trapped bubbles!",
  },
};

export const ORDERED_MATERIALS: DensityMaterialId[] = [
  "wood", "ice", "plastic", "wax", "rubber", "aluminum", "steel", "stone",
];

// ── Fluid and Solid density equations ──────────────────────────────────────────
export function calculateFluidDensity(temp: number, salinity: number): number {
  // Pure water density vs temperature: peaks at 4°C at 1.000 g/mL
  const rhoPure = 1.0 - 0.000006 * Math.pow(temp - 4, 2);
  // Salinity adds approx 0.0075 g/mL per % salinity (NaCl)
  const rhoFluid = rhoPure + 0.0075 * salinity;
  return Math.round(rhoFluid * 1000) / 1000;
}

// ── Steps & objectives ───────────────────────────────────────────────────────
function makeSteps(): StepDef[] {
  return [
    { id: "s1", instruction: "Read the density of a material on the left panel.", hint: "Materials with density < fluid density float.", completed: false },
    { id: "s2", instruction: "Adjust the mass, volume, fluid temperature, or salinity if desired.", hint: "Changing these will update the calculated densities.", completed: false },
    { id: "s3", instruction: "Click the material to drop it into the water tank.", hint: "Watch the animation speed and settling depth.", completed: false },
    { id: "s4", instruction: "Record your observation and test all 8 materials.", hint: "At least 5 needed to complete the lab.", completed: false },
    { id: "s5", instruction: "Click \"Complete Lab\" once you have tested enough materials.", hint: "Try to predict each one before testing!", completed: false },
  ];
}

function makeObjectives(): ExperimentObjective[] {
  return [
    { id: "o1", description: "Test at least 4 materials in the water tank.", completed: false },
    { id: "o2", description: "Identify at least 2 floating materials.", completed: false },
    { id: "o3", description: "Identify at least 2 sinking materials.", completed: false },
    { id: "o4", description: "Test all 8 materials to earn full marks.", completed: false },
  ];
}

// ── Initial state ─────────────────────────────────────────────────────────────
export function initialDensityState(mode: DensityState["mode"]): DensityState {
  return {
    mode,
    status:           "idle",
    selectedMaterial: null,
    isDropping:       false,
    isSettled:        false,
    testedMaterials:  [],
    steps:            makeSteps(),
    objectives:       makeObjectives(),
    observations:     [],
    result:           null,
    startedAt:        null,
    mass:             30,
    volume:           50,
    temperature:      20,
    salinity:         0,
    fluidDensity:     1.0,
    solidDensity:     0.60,
    displacementRatio: 0.60,
  };
}

// ── Engine functions (pure) ────────────────────────────────────────────────────
export function selectMaterial(
  state: DensityState,
  materialId: DensityMaterialId,
): DensityState {
  const mat = DENSITY_MATERIALS[materialId];
  const volume = 50.0; // default volume
  const mass = Math.round(mat.density * volume * 10) / 10;
  const solidDensity = mat.density;
  const fluidDensity = calculateFluidDensity(state.temperature, state.salinity);
  const displacementRatio = Math.min(1.0, solidDensity / fluidDensity);

  return {
    ...state,
    status:           "ready",
    selectedMaterial: materialId,
    isDropping:       false,
    isSettled:        false,
    mass,
    volume,
    solidDensity,
    fluidDensity,
    displacementRatio,
  };
}

export function updateDensityParameters(
  state: DensityState,
  changes: Partial<Pick<DensityState, "mass" | "volume" | "temperature" | "salinity">>,
): DensityState {
  const mass = changes.mass !== undefined ? changes.mass : state.mass;
  const volume = changes.volume !== undefined ? changes.volume : state.volume;
  const temperature = changes.temperature !== undefined ? changes.temperature : state.temperature;
  const salinity = changes.salinity !== undefined ? changes.salinity : state.salinity;

  const solidDensity = Math.round((mass / volume) * 1000) / 1000;
  const fluidDensity = calculateFluidDensity(temperature, salinity);
  const displacementRatio = Math.min(1.0, solidDensity / fluidDensity);

  return {
    ...state,
    mass,
    volume,
    temperature,
    salinity,
    solidDensity,
    fluidDensity,
    displacementRatio,
    isDropping: state.isDropping,
    isSettled: state.isDropping ? state.isSettled : false,
  };
}

export function dropMaterial(state: DensityState): DensityState {
  if (!state.selectedMaterial) return state;
  const mat     = DENSITY_MATERIALS[state.selectedMaterial];
  const solidDensity = state.solidDensity;
  const fluidDensity = state.fluidDensity;
  const floats  = solidDensity < fluidDensity;
  const alreadyTested = state.testedMaterials.includes(state.selectedMaterial);

  // Add small experimental uncertainty to measured values in observations
  const obsMass = Math.round((state.mass + (Math.random() - 0.5) * 0.05) * 100) / 100; // ±0.025g
  const obsVol = Math.round((state.volume + (Math.random() - 0.5) * 0.1) * 10) / 10;   // ±0.05mL
  const obsSolidDensity = Math.round((obsMass / obsVol) * 100) / 100;
  const obsFluidDensity = Math.round((fluidDensity + (Math.random() - 0.5) * 0.004) * 1000) / 1000;

  const obs = mkObs(
    floats ? "reaction-start" : "precipitation",
    floats
      ? `${mat.name} floats! Measured mass: ${obsMass} g, vol: ${obsVol} mL (density ≈ ${obsSolidDensity} g/cm³). Fluid density ≈ ${obsFluidDensity} g/mL (T = ${state.temperature}°C, S = ${state.salinity}%). ${mat.funFact}`
      : `${mat.name} sinks! Measured mass: ${obsMass} g, vol: ${obsVol} mL (density ≈ ${obsSolidDensity} g/cm³). Fluid density ≈ ${obsFluidDensity} g/mL (T = ${state.temperature}°C, S = ${state.salinity}%). ${mat.funFact}`,
    floats ? "success" : "info",
  );

  const testedMaterials = alreadyTested
    ? state.testedMaterials
    : [...state.testedMaterials, state.selectedMaterial];

  // Update step/objective completions
  const steps = state.steps.map((s) => {
    if (s.id === "s1" || s.id === "s2") return { ...s, completed: true };
    if (s.id === "s3") return { ...s, completed: true };
    if (s.id === "s4" && testedMaterials.length >= 5) return { ...s, completed: true };
    return s;
  });

  const historicalObservations = [obs, ...state.observations];
  const floatingCount = historicalObservations.filter((o) => o.message.includes("floats!")).length;
  const sinkingCount  = historicalObservations.filter((o) => o.message.includes("sinks!")).length;

  const objectives = state.objectives.map((o) => {
    if (o.id === "o1" && testedMaterials.length >= 4) return { ...o, completed: true };
    if (o.id === "o2" && floatingCount >= 2)          return { ...o, completed: true };
    if (o.id === "o3" && sinkingCount >= 2)           return { ...o, completed: true };
    if (o.id === "o4" && testedMaterials.length >= 8) return { ...o, completed: true };
    return o;
  });

  return {
    ...state,
    status:          "running",
    isDropping:      true,
    isSettled:       false,
    testedMaterials,
    startedAt:       state.startedAt ?? Date.now(),
    steps,
    objectives,
    observations:    historicalObservations,
  };
}

export function settleAnimation(state: DensityState): DensityState {
  return { ...state, isDropping: false, isSettled: true };
}

export function completeDensity(state: DensityState): DensityState {
  const tested   = state.testedMaterials.length;
  const score    = Math.round((tested / ORDERED_MATERIALS.length) * 100);
  const success  = tested >= 4;

  const steps = state.steps.map((s) => ({ ...s, completed: true }));

  return {
    ...state,
    status: "completed",
    steps,
    result: {
      completedAt:  Date.now(),
      success,
      score,
      summary:
        `Tested ${tested} / ${ORDERED_MATERIALS.length} materials. ` +
        (success ? "Lab complete!" : "Test at least 4 to complete."),
      explanation:
        "Objects float when their density is less than the density of water (1.0 g/cm³). " +
        "This is Archimedes' Principle — an object floats when it displaces a weight of " +
        "water equal to its own weight.",
    },
  };
}

export function resetDensity(state: DensityState): DensityState {
  return initialDensityState(state.mode);
}
