import { create } from "zustand";
import {
  initialSeparationTechniquesState,
  selectTechnique,
  filtrationSetupFilter,
  filtrationAddMixture,
  filtrationTick,
  filtrationDryResidue,
  evaporationAddSolution,
  evaporationApplyHeat,
  evaporationTick,
  distillationSetUp,
  distillationStartHeat,
  distillationTick,
  chromatographyPreparePaper,
  chromatographySpotSample,
  chromatographyAddSolvent,
  chromatographyTick,
  resetSeparationTechniques,
  type SeparationTechnique,
  type SeparationTechniquesState,
} from "@/lib/engine/separation-techniques-engine";
import { saveSession, loadSession } from "@/lib/persistence";
import type { ExperimentMode } from "@/lib/engine/types";

const KEY = "separation-techniques";

export interface SeparationTechniquesStore extends SeparationTechniquesState {
  // Technique selection
  selectTechniqueAction: (t: SeparationTechnique) => void;

  // Filtration
  filtrationSetupFilterAction: () => void;
  filtrationAddMixtureAction:  () => void;
  filtrationTickAction:        () => void;
  filtrationDryResidueAction:  () => void;

  // Evaporation
  evaporationAddSolutionAction: () => void;
  evaporationApplyHeatAction:   () => void;
  evaporationTickAction:        () => void;

  // Distillation
  distillationSetUpAction:    () => void;
  distillationStartHeatAction: () => void;
  distillationTickAction:     () => void;

  // Chromatography
  chromatographyPreparePaperAction: () => void;
  chromatographySpotSampleAction:   () => void;
  chromatographyAddSolventAction:   () => void;
  chromatographyTickAction:         () => void;

  // Common
  setMode:     (mode: ExperimentMode) => void;
  resetAction: () => void;
  hydrate:     () => void;
}

export const useSeparationTechniquesStore = create<SeparationTechniquesStore>((set, get) => {
  const save = (next: SeparationTechniquesState) => {
    saveSession(KEY, next);
    return next;
  };

  const apply = (fn: (s: SeparationTechniquesState) => SeparationTechniquesState) => {
    set(save(fn(get())));
  };

  return {
    ...initialSeparationTechniquesState(),

    selectTechniqueAction: (t) => apply((s) => selectTechnique(s, t)),

    filtrationSetupFilterAction: () => apply(filtrationSetupFilter),
    filtrationAddMixtureAction:  () => apply(filtrationAddMixture),
    filtrationTickAction:        () => apply(filtrationTick),
    filtrationDryResidueAction:  () => apply(filtrationDryResidue),

    evaporationAddSolutionAction: () => apply(evaporationAddSolution),
    evaporationApplyHeatAction:   () => apply(evaporationApplyHeat),
    evaporationTickAction:        () => apply(evaporationTick),

    distillationSetUpAction:     () => apply(distillationSetUp),
    distillationStartHeatAction: () => apply(distillationStartHeat),
    distillationTickAction:      () => apply(distillationTick),

    chromatographyPreparePaperAction: () => apply(chromatographyPreparePaper),
    chromatographySpotSampleAction:   () => apply(chromatographySpotSample),
    chromatographyAddSolventAction:   () => apply(chromatographyAddSolvent),
    chromatographyTickAction:         () => apply(chromatographyTick),

    setMode: (mode) => {
      set((s) => save({ ...s, mode }));
    },

    resetAction: () => {
      set(save(resetSeparationTechniques(get())));
    },

    hydrate: () => {
      const saved = loadSession<SeparationTechniquesState>(KEY);
      if (saved) set(saved);
    },
  };
});
