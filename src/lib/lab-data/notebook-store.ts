import { create } from "zustand";
import type { LabNotebook, NotebookSectionKey } from "./types";
import { NOTEBOOK_SECTION_ORDER, NOTEBOOK_SECTION_TITLES } from "./types";
import { labDataPersistence } from "./idb-persistence";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function blankNotebook(experimentId: string, sessionId: string): LabNotebook {
  const now = Date.now();
  const sections = Object.fromEntries(
    NOTEBOOK_SECTION_ORDER.map(key => [
      key,
      { key, title: NOTEBOOK_SECTION_TITLES[key], content: "", updatedAt: now },
    ]),
  ) as LabNotebook["sections"];

  return { experimentId, sessionId, sections, createdAt: now, updatedAt: now };
}

// ─── Store interface ──────────────────────────────────────────────────────────

interface NotebookStore {
  notebooks: Map<string, LabNotebook>;
  loading:   Set<string>;

  /** Load from IndexedDB (or create blank) for an experiment. Idempotent. */
  loadNotebook:  (experimentId: string, sessionId: string) => Promise<void>;
  /** Update a single section's content and auto-save. */
  updateSection: (experimentId: string, key: NotebookSectionKey, content: string) => void;
  /** Explicitly flush the notebook to storage. */
  saveNotebook:  (experimentId: string) => Promise<void>;
  /** Remove from in-memory cache (does not delete from storage). */
  evictNotebook: (experimentId: string) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useNotebookStore = create<NotebookStore>((set, get) => ({
  notebooks: new Map(),
  loading:   new Set(),

  loadNotebook: async (experimentId, sessionId) => {
    const { notebooks, loading } = get();
    if (notebooks.has(experimentId) || loading.has(experimentId)) return;

    set(s => ({ loading: new Set(s.loading).add(experimentId) }));

    const saved   = await labDataPersistence.loadNotebook(experimentId).catch(() => null);
    const notebook = saved ?? blankNotebook(experimentId, sessionId);

    set(s => {
      const nextNbs     = new Map(s.notebooks);
      const nextLoading = new Set(s.loading);
      nextNbs.set(experimentId, notebook);
      nextLoading.delete(experimentId);
      return { notebooks: nextNbs, loading: nextLoading };
    });
  },

  updateSection: (experimentId, key, content) => {
    set(s => {
      const nb = s.notebooks.get(experimentId);
      if (!nb) return s;

      const now     = Date.now();
      const updated: LabNotebook = {
        ...nb,
        sections: {
          ...nb.sections,
          [key]: { ...nb.sections[key], content, updatedAt: now },
        },
        updatedAt: now,
      };

      const next = new Map(s.notebooks);
      next.set(experimentId, updated);
      return { notebooks: next };
    });

    // Fire-and-forget auto-save; errors are silently swallowed
    void get().saveNotebook(experimentId);
  },

  saveNotebook: async (experimentId) => {
    const nb = get().notebooks.get(experimentId);
    if (nb) {
      await labDataPersistence.saveNotebook(nb).catch(() => undefined);
    }
  },

  evictNotebook: (experimentId) => {
    set(s => {
      const next = new Map(s.notebooks);
      next.delete(experimentId);
      return { notebooks: next };
    });
  },
}));
