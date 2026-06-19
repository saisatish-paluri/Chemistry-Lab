import { create } from "zustand";
import type { TrialSet, TrialData, TrialNumber } from "./types";
import { labDataPersistence } from "./idb-persistence";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emptyTrialSet(experimentId: string, sessionId: string): TrialSet {
  const trials: TrialData[] = ([1, 2, 3] as TrialNumber[]).map(n => ({
    trialNumber: n,
    values:      {},
    completedAt: null,
    notes:       "",
  }));
  return { experimentId, sessionId, trials, averages: {}, updatedAt: Date.now() };
}

function computeAverages(trials: TrialData[]): Record<string, number | null> {
  const completed = trials.filter(t => t.completedAt !== null);
  if (completed.length === 0) return {};

  const keys = new Set(completed.flatMap(t => Object.keys(t.values)));
  const result: Record<string, number | null> = {};

  for (const key of keys) {
    const nums = completed
      .map(t => t.values[key])
      .filter((v): v is number => typeof v === "number" && isFinite(v));
    result[key] = nums.length > 0
      ? nums.reduce((a, b) => a + b, 0) / nums.length
      : null;
  }
  return result;
}

// ─── Store interface ──────────────────────────────────────────────────────────

interface TrialStoreState {
  trialSets: Map<string, TrialSet>;

  /** Load from storage (or create blank). Idempotent. */
  loadTrialSet:  (experimentId: string, sessionId: string) => Promise<void>;
  /** Record or update a single keyed value for a trial. */
  setTrialValue: (experimentId: string, trialNum: TrialNumber, key: string, value: number | string | null) => void;
  /** Mark a trial as complete; re-computes averages across completed trials. */
  completeTrial: (experimentId: string, trialNum: TrialNumber) => void;
  /** Update the free-text notes for a trial. */
  setTrialNotes: (experimentId: string, trialNum: TrialNumber, notes: string) => void;
  /** Replace the trial set with a fresh blank copy. */
  resetTrials:   (experimentId: string, sessionId: string) => void;
  /** Flush to storage. */
  save:          (experimentId: string) => Promise<void>;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useTrialStore = create<TrialStoreState>((set, get) => ({
  trialSets: new Map(),

  loadTrialSet: async (experimentId, sessionId) => {
    if (get().trialSets.has(experimentId)) return;

    const saved    = await labDataPersistence.loadTrialSet(experimentId).catch(() => null);
    const trialSet = saved ?? emptyTrialSet(experimentId, sessionId);

    set(s => {
      const next = new Map(s.trialSets);
      next.set(experimentId, trialSet);
      return { trialSets: next };
    });
  },

  setTrialValue: (experimentId, trialNum, key, value) => {
    set(s => {
      const ts = s.trialSets.get(experimentId);
      if (!ts) return s;

      const trials = ts.trials.map(t =>
        t.trialNumber === trialNum
          ? { ...t, values: { ...t.values, [key]: value } }
          : t,
      );
      const averages = computeAverages(trials);
      const updated: TrialSet = { ...ts, trials, averages, updatedAt: Date.now() };
      const next = new Map(s.trialSets);
      next.set(experimentId, updated);
      return { trialSets: next };
    });
    void get().save(experimentId);
  },

  completeTrial: (experimentId, trialNum) => {
    set(s => {
      const ts = s.trialSets.get(experimentId);
      if (!ts) return s;

      const trials = ts.trials.map(t =>
        t.trialNumber === trialNum && t.completedAt === null
          ? { ...t, completedAt: Date.now() }
          : t,
      );
      const averages = computeAverages(trials);
      const updated: TrialSet = { ...ts, trials, averages, updatedAt: Date.now() };
      const next = new Map(s.trialSets);
      next.set(experimentId, updated);
      return { trialSets: next };
    });
    void get().save(experimentId);
  },

  setTrialNotes: (experimentId, trialNum, notes) => {
    set(s => {
      const ts = s.trialSets.get(experimentId);
      if (!ts) return s;

      const trials   = ts.trials.map(t =>
        t.trialNumber === trialNum ? { ...t, notes } : t,
      );
      const updated: TrialSet = { ...ts, trials, updatedAt: Date.now() };
      const next = new Map(s.trialSets);
      next.set(experimentId, updated);
      return { trialSets: next };
    });
    void get().save(experimentId);
  },

  resetTrials: (experimentId, sessionId) => {
    const fresh = emptyTrialSet(experimentId, sessionId);
    set(s => {
      const next = new Map(s.trialSets);
      next.set(experimentId, fresh);
      return { trialSets: next };
    });
    void labDataPersistence.saveTrialSet(fresh).catch(() => undefined);
  },

  save: async (experimentId) => {
    const ts = get().trialSets.get(experimentId);
    if (ts) await labDataPersistence.saveTrialSet(ts).catch(() => undefined);
  },
}));
