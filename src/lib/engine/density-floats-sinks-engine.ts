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
  density:      number;   // g/cm³
  floats:       boolean;  // density < 1.0 g/cm³ (water)
  color:        string;   // CSS hex
  shape:        "cube" | "sphere" | "irregular";
  description:  string;
  funFact:      string;
}

export const DENSITY_MATERIALS: Record<DensityMaterialId, DensityMaterial> = {
  wood: {
    id: "wood", name: "Wood (Pine)", density: 0.60, floats: true,
    color: "#92400e", shape: "cube",
    description: "Pine wood has many air pockets making it much lighter than water.",
    funFact: "Most wood floats — that's why wooden boats work!",
  },
  ice: {
    id: "ice", name: "Ice", density: 0.92, floats: true,
    color: "#bfdbfe", shape: "irregular",
    description: "Ice is slightly less dense than liquid water — it floats just barely.",
    funFact: "Only about 10% of an iceberg is visible above water.",
  },
  plastic: {
    id: "plastic", name: "Plastic (HDPE)", density: 0.95, floats: true,
    color: "#fef9c3", shape: "cube",
    description: "HDPE plastic is just slightly less dense than water.",
    funFact: "Plastic bottle caps float — that's why they wash up on beaches.",
  },
  wax: {
    id: "wax", name: "Candle Wax", density: 0.90, floats: true,
    color: "#fef3c7", shape: "irregular",
    description: "Candle wax is less dense than water and floats.",
    funFact: "Wax water-proofing works partly because wax floats on water.",
  },
  rubber: {
    id: "rubber", name: "Rubber", density: 1.20, floats: false,
    color: "#1c1917", shape: "cube",
    description: "Rubber is denser than water and sinks.",
    funFact: "Rubber boots keep your feet dry because rubber repels water, not floats.",
  },
  aluminum: {
    id: "aluminum", name: "Aluminium", density: 2.70, floats: false,
    color: "#94a3b8", shape: "cube",
    description: "Aluminium is 2.7× denser than water — it sinks quickly.",
    funFact: "An aluminium boat floats because its hull shape displaces water — Archimedes' principle!",
  },
  steel: {
    id: "steel", name: "Steel", density: 7.85, floats: false,
    color: "#475569", shape: "cube",
    description: "Steel is nearly 8× denser than water — it sinks very fast.",
    funFact: "Steel ships float because the hull + air inside reduces average density below 1.0.",
  },
  stone: {
    id: "stone", name: "Granite Stone", density: 2.65, floats: false,
    color: "#78716c", shape: "irregular",
    description: "Granite is about 2.65× the density of water — it sinks.",
    funFact: "Pumice stone is the only rock that floats — it's full of tiny trapped bubbles!",
  },
};

const ORDERED_MATERIALS: DensityMaterialId[] = [
  "wood", "ice", "plastic", "wax", "rubber", "aluminum", "steel", "stone",
];

// ── Steps & objectives ───────────────────────────────────────────────────────
function makeSteps(): StepDef[] {
  return [
    { id: "s1", instruction: "Read the density of a material on the left panel.", hint: "Materials with density < 1.0 g/cm³ float.", completed: false },
    { id: "s2", instruction: "Make a prediction: will it float or sink?", hint: "Compare the density to water (1.0 g/cm³).", completed: false },
    { id: "s3", instruction: "Click the material to drop it into the water tank.", hint: "Watch the animation carefully.", completed: false },
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
  };
}

// ── Engine functions (pure) ────────────────────────────────────────────────────
export function selectMaterial(
  state: DensityState,
  materialId: DensityMaterialId,
): DensityState {
  return {
    ...state,
    status:           "ready",
    selectedMaterial: materialId,
    isDropping:       false,
    isSettled:        false,
  };
}

export function dropMaterial(state: DensityState): DensityState {
  if (!state.selectedMaterial) return state;
  const mat     = DENSITY_MATERIALS[state.selectedMaterial];
  const floats  = mat.floats;
  const alreadyTested = state.testedMaterials.includes(state.selectedMaterial);

  const obs = mkObs(
    floats ? "reaction-start" : "precipitation",
    floats
      ? `${mat.name} floats! Density = ${mat.density} g/cm³ < 1.0 g/cm³ (water). ${mat.funFact}`
      : `${mat.name} sinks! Density = ${mat.density} g/cm³ > 1.0 g/cm³ (water). ${mat.funFact}`,
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

  const floatingCount = testedMaterials.filter((m) => DENSITY_MATERIALS[m].floats).length;
  const sinkingCount  = testedMaterials.filter((m) => !DENSITY_MATERIALS[m].floats).length;
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
    observations:    [obs, ...state.observations],
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

export { ORDERED_MATERIALS };
