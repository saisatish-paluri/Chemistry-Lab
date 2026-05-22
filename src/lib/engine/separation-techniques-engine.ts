import type {
  ExperimentStatus,
  ExperimentMode,
  ExperimentResult,
  ObservationEvent,
  StepDef,
  ExperimentObjective,
} from "./types";

// ── Technique types ──────────────────────────────────────────────────────────

export type SeparationTechnique = "filtration" | "evaporation" | "distillation" | "chromatography";

export interface FiltrationState {
  mixtureAdded:      boolean;
  filterSetUp:       boolean;
  pourStarted:       boolean;
  pourProgress:      number; // 0–100
  filtrateCollected: boolean;
  residueDried:      boolean;
  solidRecoveredG:   number;
  filtrateClear:     boolean;
}

export interface EvaporationState {
  solutionAdded:   boolean;
  heatApplied:     boolean;
  evapProgress:    number; // 0–100 (water evaporated %)
  crystalsForming: boolean;
  crystalsMassG:   number;
  complete:        boolean;
}

export interface DistillationState {
  flaskSetUp:      boolean;
  heaterOn:        boolean;
  tempC:           number;
  fraction1Ml:     number; // lower bp collected
  fraction2Ml:     number; // higher bp residue
  condenserOn:     boolean;
  firstFractionDone: boolean;
  complete:        boolean;
}

export interface ChromatographyState {
  paperPrepared:   boolean;
  sampleSpotted:   boolean;
  solventAdded:    boolean;
  runProgress:     number;  // 0–100
  solventFrontMm:  number;
  spotsData:       Array<{ color: string; distanceMm: number; rf: number; name: string }>;
  developed:       boolean;
}

export interface SeparationTechniquesState {
  technique:        SeparationTechnique | null;
  filtration:       FiltrationState;
  evaporation:      EvaporationState;
  distillation:     DistillationState;
  chromatography:   ChromatographyState;
  steps:            StepDef[];
  objectives:       ExperimentObjective[];
  observations:     ObservationEvent[];
  result:           ExperimentResult | null;
  status:           ExperimentStatus;
  mode:             ExperimentMode;
  lastError:        string | null;
}

// ── Initial states ───────────────────────────────────────────────────────────

const initFiltration = (): FiltrationState => ({
  mixtureAdded:      false,
  filterSetUp:       false,
  pourStarted:       false,
  pourProgress:      0,
  filtrateCollected: false,
  residueDried:      false,
  solidRecoveredG:   0,
  filtrateClear:     false,
});

const initEvaporation = (): EvaporationState => ({
  solutionAdded:   false,
  heatApplied:     false,
  evapProgress:    0,
  crystalsForming: false,
  crystalsMassG:   0,
  complete:        false,
});

const initDistillation = (): DistillationState => ({
  flaskSetUp:        false,
  heaterOn:          false,
  tempC:             20,
  fraction1Ml:       0,
  fraction2Ml:       0,
  condenserOn:       false,
  firstFractionDone: false,
  complete:          false,
});

const initChromatography = (): ChromatographyState => ({
  paperPrepared:  false,
  sampleSpotted:  false,
  solventAdded:   false,
  runProgress:    0,
  solventFrontMm: 0,
  spotsData:      [],
  developed:      false,
});

const OBJECTIVES_BY_TECHNIQUE: Record<SeparationTechnique, ExperimentObjective[]> = {
  filtration: [
    { id: "f1", description: "Set up filter funnel with filter paper cone", completed: false },
    { id: "f2", description: "Pour the sand–water mixture through the filter", completed: false },
    { id: "f3", description: "Collect the clear filtrate in a beaker", completed: false },
    { id: "f4", description: "Dry and record the recovered residue mass", completed: false },
  ],
  evaporation: [
    { id: "e1", description: "Transfer NaCl solution to evaporating dish", completed: false },
    { id: "e2", description: "Heat the solution with a Bunsen burner", completed: false },
    { id: "e3", description: "Monitor until crystals begin forming", completed: false },
    { id: "e4", description: "Allow crystals to cool and record mass", completed: false },
  ],
  distillation: [
    { id: "d1", description: "Assemble the distillation apparatus", completed: false },
    { id: "d2", description: "Start the condenser and heat the flask", completed: false },
    { id: "d3", description: "Collect the first fraction (lower b.p. component)", completed: false },
    { id: "d4", description: "Record both fractions and boiling temperatures", completed: false },
  ],
  chromatography: [
    { id: "c1", description: "Draw baseline and spot the mixed ink sample", completed: false },
    { id: "c2", description: "Add solvent to the tank — do not submerge baseline", completed: false },
    { id: "c3", description: "Allow solvent to travel up the paper", completed: false },
    { id: "c4", description: "Mark solvent front and calculate Rf values", completed: false },
  ],
};

const STEPS_BY_TECHNIQUE: Record<SeparationTechnique, StepDef[]> = {
  filtration: [
    { id: "s1", instruction: "Select filtration as the technique and set up filter paper in funnel", hint: "Fold filter paper in quarters, open one corner to fit the funnel", completed: false },
    { id: "s2", instruction: "Add the sand–water mixture to the filter", hint: "Pour slowly using a glass rod to guide the liquid", completed: false },
    { id: "s3", instruction: "Collect the filtrate in a clean beaker below the funnel", hint: "The filtrate should be clear if filtration is working correctly", completed: false },
    { id: "s4", instruction: "Remove the filter paper, dry the residue and record its mass", hint: "The residue is the insoluble solid (sand) that was retained on the filter paper", completed: false },
  ],
  evaporation: [
    { id: "s1", instruction: "Pour 50 mL of NaCl solution into the evaporating dish", hint: "NaCl(aq) — sodium chloride dissolved in water — is colourless", completed: false },
    { id: "s2", instruction: "Place the dish on a tripod and gauze above a Bunsen burner flame", hint: "Use a gentle blue flame to begin evaporation", completed: false },
    { id: "s3", instruction: "Heat and watch the water evaporate — stop when white crystals appear on the surface", hint: "Do not continue to total dryness — this cracks the crystals", completed: false },
    { id: "s4", instruction: "Allow to cool; weigh the recovered NaCl crystals", hint: "Compare with the theoretical yield from the known concentration", completed: false },
  ],
  distillation: [
    { id: "s1", instruction: "Assemble the distillation flask, thermometer, condenser and collection flask", hint: "Thermometer bulb should be level with the side-arm of the flask", completed: false },
    { id: "s2", instruction: "Start cooling water through the condenser, then heat the flask", hint: "Always start the condenser before heating to prevent vapour escaping uncondensed", completed: false },
    { id: "s3", instruction: "Collect the first fraction as temperature reaches the first component's boiling point", hint: "For ethanol–water: collect fraction from ~78 °C before temperature rises sharply", completed: false },
    { id: "s4", instruction: "Record both fractions and compare boiling points to identify each component", hint: "A sharp rise in temperature signals transition to the second component", completed: false },
  ],
  chromatography: [
    { id: "s1", instruction: "Draw a pencil baseline 2 cm from the bottom of the chromatography paper", hint: "Always use pencil, not pen — pen ink contains dyes that will run with the solvent", completed: false },
    { id: "s2", instruction: "Place sample spots on the baseline using a capillary tube", hint: "Use small concentrated spots; allow each spot to dry before re-spotting for intensity", completed: false },
    { id: "s3", instruction: "Place in solvent tank ensuring solvent level is below the baseline", hint: "If solvent covers the baseline spots, they will dissolve into the solvent rather than travelling up the paper", completed: false },
    { id: "s4", instruction: "Mark the solvent front when developed, measure spot and front distances, calculate Rf values", hint: "Rf = distance spot moved / distance solvent front moved. Values 0–1 identify each component.", completed: false },
  ],
};

// ── Initial state factory ────────────────────────────────────────────────────

export function initialSeparationTechniquesState(): SeparationTechniquesState {
  return {
    technique:     null,
    filtration:    initFiltration(),
    evaporation:   initEvaporation(),
    distillation:  initDistillation(),
    chromatography: initChromatography(),
    steps:         [],
    objectives:    [],
    observations:  [],
    result:        null,
    status:        "idle",
    mode:          "guided",
    lastError:     null,
  };
}

// ── Observation helper ───────────────────────────────────────────────────────

let _obsCounter = 0;
function makeObs(
  type: ObservationEvent["type"],
  message: string,
  severity: ObservationEvent["severity"] = "info",
): ObservationEvent {
  return {
    id:        `sep-${++_obsCounter}-${Date.now()}`,
    timestamp: Date.now(),
    type,
    message,
    severity,
  };
}

// ── Action: select technique ─────────────────────────────────────────────────

export function selectTechnique(
  state: SeparationTechniquesState,
  technique: SeparationTechnique,
): SeparationTechniquesState {
  const steps = STEPS_BY_TECHNIQUE[technique].map((s) => ({ ...s, completed: false }));
  const objectives = OBJECTIVES_BY_TECHNIQUE[technique].map((o) => ({ ...o, completed: false }));
  return {
    ...state,
    technique,
    steps,
    objectives,
    filtration:     initFiltration(),
    evaporation:    initEvaporation(),
    distillation:   initDistillation(),
    chromatography: initChromatography(),
    observations:   [makeObs("reaction-start", `Selected technique: ${technique.toUpperCase()}. Follow the step guide on the right.`, "info")],
    status:         "running",
    result:         null,
    lastError:      null,
  };
}

// ── Filtration actions ───────────────────────────────────────────────────────

export function filtrationSetupFilter(state: SeparationTechniquesState): SeparationTechniquesState {
  if (!state.filtration.filterSetUp) {
    const f = { ...state.filtration, filterSetUp: true };
    const obs = makeObs("reaction-start", "Filter paper folded into a cone and placed in the funnel over a beaker.", "info");
    const steps = markStep(state.steps, 0);
    const objectives = markObjective(state.objectives, 0);
    return { ...state, filtration: f, steps, objectives, observations: [obs, ...state.observations] };
  }
  return state;
}

export function filtrationAddMixture(state: SeparationTechniquesState): SeparationTechniquesState {
  if (state.filtration.filterSetUp && !state.filtration.mixtureAdded) {
    const f = { ...state.filtration, mixtureAdded: true, pourStarted: true, pourProgress: 0 };
    const obs = makeObs("reaction-start", "Sand–water mixture being poured into the filter funnel.", "info");
    const steps = markStep(state.steps, 1);
    return { ...state, filtration: f, observations: [obs, ...state.observations], steps };
  }
  if (!state.filtration.filterSetUp) {
    return { ...state, lastError: "Set up the filter funnel first." };
  }
  return state;
}

export function filtrationTick(state: SeparationTechniquesState): SeparationTechniquesState {
  const f = state.filtration;
  if (!f.pourStarted || f.filtrateCollected) return state;

  const newProgress = Math.min(100, f.pourProgress + 8);
  const newObs: ObservationEvent[] = [];

  let updated = { ...f, pourProgress: newProgress };

  if (newProgress >= 60 && !f.filtrateClear) {
    updated = { ...updated, filtrateClear: true };
    newObs.push(makeObs("color-change", "Filtrate dripping through appears clear — suspended particles retained on filter paper.", "success"));
  }

  if (newProgress >= 100 && !f.filtrateCollected) {
    updated = { ...updated, filtrateCollected: true, solidRecoveredG: 2.4 };
    const steps = markStep(state.steps, 2);
    const objectives = markObjective(state.objectives, 1);
    newObs.push(makeObs("reaction-complete", "Filtration complete. 2.4 g of sand residue retained on filter paper.", "success"));
    return { ...state, filtration: updated, steps, objectives, observations: [...newObs, ...state.observations] };
  }

  return { ...state, filtration: updated, observations: [...newObs, ...state.observations] };
}

export function filtrationDryResidue(state: SeparationTechniquesState): SeparationTechniquesState {
  if (state.filtration.filtrateCollected && !state.filtration.residueDried) {
    const f = { ...state.filtration, residueDried: true };
    const obs = makeObs("reaction-complete", `Residue dried: ${f.solidRecoveredG} g of sand recovered. Filtrate volume: ~50 mL clear water solution.`, "success");
    const steps = markStep(state.steps, 3);
    const objectives = markObjective(state.objectives, 2);
    const objectives2 = markObjective(objectives, 3);
    return { ...state, filtration: f, steps, objectives: objectives2, observations: [obs, ...state.observations], ...completeLab(state, 88) };
  }
  return state;
}

// ── Evaporation actions ──────────────────────────────────────────────────────

export function evaporationAddSolution(state: SeparationTechniquesState): SeparationTechniquesState {
  if (!state.evaporation.solutionAdded) {
    const e = { ...state.evaporation, solutionAdded: true };
    const obs = makeObs("reaction-start", "50 mL of 0.5 M NaCl(aq) transferred to evaporating dish. Solution is colourless, liquid state.", "info");
    const steps = markStep(state.steps, 0);
    const objectives = markObjective(state.objectives, 0);
    return { ...state, evaporation: e, steps, objectives, observations: [obs, ...state.observations] };
  }
  return state;
}

export function evaporationApplyHeat(state: SeparationTechniquesState): SeparationTechniquesState {
  if (state.evaporation.solutionAdded && !state.evaporation.heatApplied) {
    const e = { ...state.evaporation, heatApplied: true };
    const obs = makeObs("temperature-change", "Bunsen burner lit — blue flame applied beneath evaporating dish. Water beginning to evaporate.", "info");
    const steps = markStep(state.steps, 1);
    const objectives = markObjective(state.objectives, 1);
    return { ...state, evaporation: e, steps, objectives, observations: [obs, ...state.observations] };
  }
  if (!state.evaporation.solutionAdded) {
    return { ...state, lastError: "Add the solution to the evaporating dish first." };
  }
  return state;
}

export function evaporationTick(state: SeparationTechniquesState): SeparationTechniquesState {
  const e = state.evaporation;
  if (!e.heatApplied || e.complete) return state;

  const newProgress = Math.min(100, e.evapProgress + 6);
  const newObs: ObservationEvent[] = [];
  let updated = { ...e, evapProgress: newProgress };

  if (newProgress >= 55 && !e.crystalsForming) {
    updated = { ...updated, crystalsForming: true };
    newObs.push(makeObs("reaction-start", "White crystals of NaCl appearing at the dish edges — solution is becoming supersaturated.", "warning"));
    const steps = markStep(state.steps, 2);
    const objectives = markObjective(state.objectives, 2);
    return { ...state, evaporation: updated, steps, objectives, observations: [...newObs, ...state.observations] };
  }

  if (newProgress >= 100 && !e.complete) {
    const crystalsMass = 1.46;
    updated = { ...updated, complete: true, crystalsMassG: crystalsMass };
    newObs.push(makeObs("reaction-complete", `Evaporation complete. ${crystalsMass} g of pure NaCl crystals recovered (theoretical: 1.46 g).`, "success"));
    const steps = markStep(state.steps, 3);
    const objectives = markObjective(state.objectives, 3);
    return { ...state, evaporation: updated, steps, objectives, observations: [...newObs, ...state.observations], ...completeLab(state, 91) };
  }

  return { ...state, evaporation: updated, observations: [...newObs, ...state.observations] };
}

// ── Distillation actions ─────────────────────────────────────────────────────

export function distillationSetUp(state: SeparationTechniquesState): SeparationTechniquesState {
  if (!state.distillation.flaskSetUp) {
    const d = { ...state.distillation, flaskSetUp: true };
    const obs = makeObs("reaction-start", "Distillation flask, thermometer, Liebig condenser and collection flask assembled. Ethanol–water mixture (50 mL) loaded.", "info");
    const steps = markStep(state.steps, 0);
    const objectives = markObjective(state.objectives, 0);
    return { ...state, distillation: d, steps, objectives, observations: [obs, ...state.observations] };
  }
  return state;
}

export function distillationStartHeat(state: SeparationTechniquesState): SeparationTechniquesState {
  if (state.distillation.flaskSetUp && !state.distillation.heaterOn) {
    const d = { ...state.distillation, heaterOn: true, condenserOn: true };
    const obs = makeObs("temperature-change", "Condenser water flowing. Heater on — temperature rising from 20 °C.", "info");
    const steps = markStep(state.steps, 1);
    const objectives = markObjective(state.objectives, 1);
    return { ...state, distillation: d, steps, objectives, observations: [obs, ...state.observations] };
  }
  if (!state.distillation.flaskSetUp) {
    return { ...state, lastError: "Set up the distillation apparatus first." };
  }
  return state;
}

export function distillationTick(state: SeparationTechniquesState): SeparationTechniquesState {
  const d = state.distillation;
  if (!d.heaterOn || d.complete) return state;

  const rise = d.firstFractionDone ? 2.5 : 1.5;
  const newTemp = Math.min(105, d.tempC + rise);
  const newObs: ObservationEvent[] = [];
  let updated = { ...d, tempC: newTemp };

  // Collecting ethanol fraction (78–82 °C)
  if (newTemp >= 78 && newTemp <= 84 && !d.firstFractionDone) {
    const newFraction1 = Math.min(18, d.fraction1Ml + 1.2);
    updated = { ...updated, fraction1Ml: newFraction1 };
    if (d.fraction1Ml === 0) {
      newObs.push(makeObs("gas-evolution", "Vapour condensing — first fraction (ethanol, b.p. ≈ 78 °C) collecting in receiver flask.", "success"));
    }
  }

  if (newTemp >= 85 && !d.firstFractionDone && d.fraction1Ml > 0) {
    updated = { ...updated, firstFractionDone: true };
    newObs.push(makeObs("temperature-change", `Temperature rising past 85 °C — ethanol fraction complete (${d.fraction1Ml.toFixed(1)} mL). Switching collection vessel for water fraction.`, "warning"));
    const steps = markStep(state.steps, 2);
    const objectives = markObjective(state.objectives, 2);
    return { ...state, distillation: updated, steps, objectives, observations: [...newObs, ...state.observations] };
  }

  // Collecting water fraction (99–102 °C)
  if (newTemp >= 99 && d.firstFractionDone) {
    const newFraction2 = Math.min(30, d.fraction2Ml + 1.5);
    updated = { ...updated, fraction2Ml: newFraction2 };
    if (d.fraction2Ml === 0) {
      newObs.push(makeObs("gas-evolution", "Second fraction (water, b.p. ≈ 100 °C) now condensing in new collection vessel.", "success"));
    }
  }

  if (newTemp >= 104 && d.firstFractionDone && !d.complete) {
    updated = { ...updated, complete: true };
    newObs.push(makeObs("reaction-complete", `Distillation complete. Fraction 1 (ethanol): ${updated.fraction1Ml.toFixed(1)} mL. Fraction 2 (water): ${updated.fraction2Ml.toFixed(1)} mL.`, "success"));
    const steps = markStep(state.steps, 3);
    const objectives = markObjective(state.objectives, 3);
    return { ...state, distillation: updated, steps, objectives, observations: [...newObs, ...state.observations], ...completeLab(state, 93) };
  }

  return { ...state, distillation: updated, observations: [...newObs, ...state.observations] };
}

// ── Chromatography actions ───────────────────────────────────────────────────

const CHROMA_SPOTS = [
  { color: "#2563eb", name: "Blue dye",    rfExpected: 0.72 },
  { color: "#dc2626", name: "Red dye",     rfExpected: 0.48 },
  { color: "#16a34a", name: "Yellow dye",  rfExpected: 0.88 },
];

export function chromatographyPreparePaper(state: SeparationTechniquesState): SeparationTechniquesState {
  if (!state.chromatography.paperPrepared) {
    const c = { ...state.chromatography, paperPrepared: true };
    const obs = makeObs("reaction-start", "Chromatography paper cut to size. Pencil baseline drawn 2 cm from the bottom edge.", "info");
    const steps = markStep(state.steps, 0);
    const objectives = markObjective(state.objectives, 0);
    return { ...state, chromatography: c, steps, objectives, observations: [obs, ...state.observations] };
  }
  return state;
}

export function chromatographySpotSample(state: SeparationTechniquesState): SeparationTechniquesState {
  if (state.chromatography.paperPrepared && !state.chromatography.sampleSpotted) {
    const c = { ...state.chromatography, sampleSpotted: true };
    const obs = makeObs("reaction-start", "Mixed ink sample spotted on baseline using capillary tube. Three sample spots applied. Allow to dry before placing in solvent.", "info");
    const steps = markStep(state.steps, 1);
    const objectives = markObjective(state.objectives, 1);
    return { ...state, chromatography: c, steps, objectives, observations: [obs, ...state.observations] };
  }
  if (!state.chromatography.paperPrepared) {
    return { ...state, lastError: "Prepare the paper with a baseline first." };
  }
  return state;
}

export function chromatographyAddSolvent(state: SeparationTechniquesState): SeparationTechniquesState {
  if (state.chromatography.sampleSpotted && !state.chromatography.solventAdded) {
    const c = { ...state.chromatography, solventAdded: true };
    const obs = makeObs("reaction-start", "Paper placed in solvent tank. Solvent (ethanol) level is below the baseline — beginning to wick upward.", "info");
    const steps = markStep(state.steps, 2);
    const objectives = markObjective(state.objectives, 2);
    return { ...state, chromatography: c, steps, objectives, observations: [obs, ...state.observations] };
  }
  if (!state.chromatography.sampleSpotted) {
    return { ...state, lastError: "Spot the sample on the baseline first." };
  }
  return state;
}

export function chromatographyTick(state: SeparationTechniquesState): SeparationTechniquesState {
  const c = state.chromatography;
  if (!c.solventAdded || c.developed) return state;

  const totalFrontMm = 80;
  const newProgress = Math.min(100, c.runProgress + 5);
  const newFrontMm  = (newProgress / 100) * totalFrontMm;
  const newObs: ObservationEvent[] = [];

  const spotsData = CHROMA_SPOTS.map(({ color, name, rfExpected }) => ({
    color,
    name,
    distanceMm: Math.min(newFrontMm * rfExpected, newFrontMm - 1),
    rf: rfExpected,
  }));

  let updated = { ...c, runProgress: newProgress, solventFrontMm: newFrontMm, spotsData };

  if (newProgress >= 50 && c.runProgress < 50) {
    newObs.push(makeObs("reaction-start", "Coloured spots beginning to separate as components travel at different speeds through the paper.", "success"));
  }

  if (newProgress >= 100 && !c.developed) {
    updated = { ...updated, developed: true };
    const rfLines = spotsData.map((s) => `${s.name}: Rf = ${s.rf.toFixed(2)}`).join(" | ");
    newObs.push(makeObs("reaction-complete", `Chromatogram developed. Solvent front: ${totalFrontMm} mm. ${rfLines}`, "success"));
    const steps = markStep(state.steps, 3);
    const objectives = markObjective(state.objectives, 3);
    return { ...state, chromatography: updated, steps, objectives, observations: [...newObs, ...state.observations], ...completeLab(state, 90) };
  }

  return { ...state, chromatography: updated, observations: [...newObs, ...state.observations] };
}

// ── Reset ────────────────────────────────────────────────────────────────────

export function resetSeparationTechniques(
  state: SeparationTechniquesState,
): SeparationTechniquesState {
  return initialSeparationTechniquesState();
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function markStep(steps: StepDef[], index: number): StepDef[] {
  return steps.map((s, i) => (i === index ? { ...s, completed: true } : s));
}

function markObjective(objectives: ExperimentObjective[], index: number): ExperimentObjective[] {
  return objectives.map((o, i) => (i === index ? { ...o, completed: true } : o));
}

function completeLab(
  state: SeparationTechniquesState,
  score: number,
): Partial<SeparationTechniquesState> {
  const names: Record<SeparationTechnique, string> = {
    filtration:     "Filtration",
    evaporation:    "Evaporation",
    distillation:   "Distillation",
    chromatography: "Paper Chromatography",
  };
  const explanations: Record<SeparationTechnique, string> = {
    filtration:     "Filtration separates insoluble particles from liquid by passing the mixture through a porous medium. The liquid (filtrate) passes through; the solid (residue) is retained. This relies on particle size, not chemical properties.",
    evaporation:    "Evaporation recovers dissolved solids by removing the solvent using heat. As water evaporates, the salt concentration increases until the solution becomes supersaturated and crystals form. The process is limited to soluble solids with high thermal stability.",
    distillation:   "Distillation separates miscible liquids by exploiting their different boiling points. The mixture is heated; the lower b.p. component evaporates first, is condensed, and collected separately. The boiling point of each fraction identifies the component.",
    chromatography: "Paper chromatography separates components of a mixture by their differential affinity for the mobile phase (solvent) vs. stationary phase (paper). Components with higher affinity for solvent travel further. Rf values fingerprint each component under standard conditions.",
  };

  const technique = state.technique!;
  return {
    status: "completed",
    result: {
      completedAt:  Date.now(),
      success:      score >= 70,
      score,
      summary:      `${names[technique]} completed successfully. All procedure steps followed correctly.`,
      explanation:  explanations[technique],
    },
    objectives: state.objectives.map((o) => ({ ...o, completed: true })),
    steps:      state.steps.map((s) => ({ ...s, completed: true })),
  };
}
