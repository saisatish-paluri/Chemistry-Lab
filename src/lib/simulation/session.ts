/**
 * Simulation Session Model + Zustand Store
 *
 * A SimulationSession bundles all rolled simulation state for one experiment
 * run: environment, reagents, apparatus conditions, unknown sample, and the
 * student action log. One session per experiment is held in the store and
 * persisted to sessionStorage so it survives in-session navigation.
 *
 * Design: The store is a map of experimentId → SimulationSession. Each
 * experiment engine can call getSession(id) to retrieve its session without
 * coupling to other experiments.
 */

import { create } from "zustand";
import type {
  SimulationSession,
  SimulationSessionConfig,
  StudentAction,
  StudentActionType,
  ExperimentDomain,
  ReagentId,
} from "./types";
import { createEnvironment }     from "./environment";
import { createReagentSet }      from "./reagents";
import { rollApparatusSet }      from "./apparatus";
import { generateUnknownSample } from "./samples";
import { buildActionSummary }    from "./actions";

// ─── Default Reagent Maps ─────────────────────────────────────────────────────

const DOMAIN_REAGENTS: Partial<Record<ExperimentDomain, ReagentId[]>> = {
  "titration":      ["hcl-0.1", "naoh-0.1", "phenolphthalein"],
  "calorimetry":    ["hcl-1.0", "naoh-1.0"],
  "gas-laws":       [],
  "gas-collection": ["hcl-1.0"],
  "equilibrium":    [],
  "electrolysis":   ["cuso4-0.5"],
  "precipitation":  ["agno3-0.1", "nacl-sat"],
  "redox":          ["cuso4-0.5"],
  "neutralization": ["hcl-0.1", "naoh-0.1"],
  "water-hardness": ["edta-0.01", "eriochrome-t"],
  "salt-analysis":  ["naoh-0.1", "hcl-1.0"],
};

const DOMAIN_APPARATUS: Partial<Record<ExperimentDomain, string[]>> = {
  "titration":      ["burette", "conical-flask", "pipette"],
  "calorimetry":    ["thermometer", "calorimeter", "measuring-cylinder"],
  "gas-laws":       ["thermometer", "gas-syringe", "manometer"],
  "gas-collection": ["flask", "gas-collection-tube"],
  "water-hardness": ["burette", "conical-flask"],
  "salt-analysis":  ["test-tubes", "bunsen-burner"],
};

// ─── Session Factory ──────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function createSimulationSession(
  config: SimulationSessionConfig,
): SimulationSession {
  const {
    domain,
    experimentId   = domain,
    difficulty     = "intermediate",
    enableNoise    = true,
    enableVariance = true,
    reagentIds     = DOMAIN_REAGENTS[domain] ?? [],
    apparatusIds   = DOMAIN_APPARATUS[domain] ?? [],
    includeUnknown = false,
    unknownType    = "salt",
  } = config;

  const environment  = createEnvironment();
  const reagents     = createReagentSet(reagentIds, {});
  const apparatus    = rollApparatusSet(apparatusIds, { difficulty });
  const unknownSample = includeUnknown
    ? generateUnknownSample(unknownType)
    : null;

  return {
    sessionId:      uid(),
    experimentId,
    domain,
    difficulty,
    createdAt:      Date.now(),
    environment,
    reagents,
    apparatus,
    unknownSample,
    actions:        [],
    actionSummary:  buildActionSummary([], 0),
    enableNoise,
    enableVariance,
    metadata:       {},
  };
}

// ─── Immutable updaters ───────────────────────────────────────────────────────

/** Append a student action to the session and rebuild the summary. */
export function sessionWithAction(
  session: SimulationSession,
  type:    StudentActionType,
  value?:  number,
  unit?:   string,
): SimulationSession {
  const action: StudentAction = { type, timestamp: Date.now(), value, unit };
  const actions = [...session.actions, action];
  const elapsed = Date.now() - session.createdAt;
  return {
    ...session,
    actions,
    actionSummary: buildActionSummary(actions, elapsed),
  };
}

/** Merge arbitrary metadata into the session (non-destructive). */
export function sessionWithMeta(
  session:  SimulationSession,
  metadata: Record<string, unknown>,
): SimulationSession {
  return { ...session, metadata: { ...session.metadata, ...metadata } };
}

// ─── Persistence ─────────────────────────────────────────────────────────────

const STORAGE_PREFIX = "sim-session:";

function saveSession(session: SimulationSession): void {
  try {
    sessionStorage.setItem(
      STORAGE_PREFIX + session.experimentId,
      JSON.stringify(session),
    );
  } catch {
    // sessionStorage may be unavailable (SSR, private mode, quota exceeded)
  }
}

function loadSession(experimentId: string): SimulationSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + experimentId);
    return raw ? (JSON.parse(raw) as SimulationSession) : null;
  } catch {
    return null;
  }
}

// ─── Zustand Store ────────────────────────────────────────────────────────────

interface SimulationStore {
  /** All active sessions, keyed by experimentId. */
  sessions: Record<string, SimulationSession>;

  /** Get (or lazily create) the session for an experiment. */
  getOrCreate: (config: SimulationSessionConfig) => SimulationSession;

  /** Force-reset a session (start fresh regardless of saved state). */
  reset: (config: SimulationSessionConfig) => SimulationSession;

  /** Record a student action in the given session. */
  recordAction: (
    experimentId: string,
    type:         StudentActionType,
    value?:       number,
    unit?:        string,
  ) => void;

  /** Merge metadata into a session. */
  setMeta: (experimentId: string, meta: Record<string, unknown>) => void;

  /** Hydrate from sessionStorage (call once on mount). */
  hydrate: (experimentId: string) => void;
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  sessions: {},

  getOrCreate(config) {
    const { sessions } = get();
    const id = config.experimentId ?? config.domain;
    if (sessions[id]) return sessions[id];

    // Try sessionStorage first
    const saved = loadSession(id);
    if (saved) {
      set((s) => ({ sessions: { ...s.sessions, [id]: saved } }));
      return saved;
    }

    // Create fresh session
    const fresh = createSimulationSession({ ...config, experimentId: id });
    set((s) => ({ sessions: { ...s.sessions, [id]: fresh } }));
    saveSession(fresh);
    return fresh;
  },

  reset(config) {
    const id    = config.experimentId ?? config.domain;
    const fresh = createSimulationSession({ ...config, experimentId: id });
    set((s) => ({ sessions: { ...s.sessions, [id]: fresh } }));
    saveSession(fresh);
    return fresh;
  },

  recordAction(experimentId, type, value, unit) {
    const { sessions } = get();
    const session = sessions[experimentId];
    if (!session) return;

    const updated = sessionWithAction(session, type, value, unit);
    set((s) => ({ sessions: { ...s.sessions, [experimentId]: updated } }));
    saveSession(updated);
  },

  setMeta(experimentId, meta) {
    const { sessions } = get();
    const session = sessions[experimentId];
    if (!session) return;

    const updated = sessionWithMeta(session, meta);
    set((s) => ({ sessions: { ...s.sessions, [experimentId]: updated } }));
    saveSession(updated);
  },

  hydrate(experimentId) {
    const saved = loadSession(experimentId);
    if (saved) {
      set((s) => ({ sessions: { ...s.sessions, [experimentId]: saved } }));
    }
  },
}));
