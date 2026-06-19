/**
 * Simulation Hooks
 *
 * React hooks that wrap the SimulationStore for clean consumption inside
 * experiment pages and workspace components. All hooks are memoised and
 * follow Vercel/React best-practice patterns (subscribe to derived booleans,
 * not raw objects where possible).
 */

"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useSimulationStore }              from "./session";
import type {
  SimulationSession,
  SimulationSessionConfig,
  EnvironmentState,
  ReagentState,
  ApparatusCondition,
  UnknownSample,
  StudentActionType,
  ReagentId,
} from "./types";

// ─── Primary hook ─────────────────────────────────────────────────────────────

/**
 * Primary hook for consuming a simulation session inside an experiment page.
 *
 * Lazily initialises the session on first render, hydrates from sessionStorage,
 * and exposes stable action callbacks.
 *
 * @param config  Session configuration (domain is required; other fields optional).
 */
export function useSimulationSession(config: SimulationSessionConfig): {
  session:       SimulationSession | null;
  isReady:       boolean;
  recordAction:  (type: StudentActionType, value?: number, unit?: string) => void;
  resetSession:  () => void;
  setMeta:       (meta: Record<string, unknown>) => void;
} {
  const store    = useSimulationStore();
  const expId    = config.experimentId ?? config.domain;

  // Hydrate once on mount
  useEffect(() => {
    store.hydrate(expId);
  }, [expId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Lazily create or retrieve session
  const session  = store.sessions[expId] ?? store.getOrCreate(config);
  const isReady  = session != null;

  const recordAction = useCallback(
    (type: StudentActionType, value?: number, unit?: string) =>
      store.recordAction(expId, type, value, unit),
    [expId, store],
  );

  const resetSession = useCallback(
    () => store.reset(config),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [expId],
  );

  const setMeta = useCallback(
    (meta: Record<string, unknown>) => store.setMeta(expId, meta),
    [expId, store],
  );

  return { session, isReady, recordAction, resetSession, setMeta };
}

// ─── Environment hook ─────────────────────────────────────────────────────────

/**
 * Subscribe to the environment state for a specific experiment session.
 * Returns null if the session has not yet been initialised.
 */
export function useEnvironment(experimentId: string): EnvironmentState | null {
  return useSimulationStore(
    useCallback(
      (s) => s.sessions[experimentId]?.environment ?? null,
      [experimentId],
    ),
  );
}

// ─── Reagent hook ─────────────────────────────────────────────────────────────

/**
 * Subscribe to one or more reagents for a specific experiment session.
 */
export function useReagents(
  experimentId: string,
  ids: ReagentId[],
): Record<ReagentId, ReagentState | undefined> {
  const allReagents = useSimulationStore(
    useCallback(
      (s) => s.sessions[experimentId]?.reagents ?? {},
      [experimentId],
    ),
  );

  // Stable string key to represent the ids array for memo comparison
  const idsKey = ids.slice().sort().join(",");

  return useMemo(
    () => Object.fromEntries(ids.map((id) => [id, allReagents[id]])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allReagents, idsKey],
  );
}

// ─── Apparatus hook ───────────────────────────────────────────────────────────

/**
 * Subscribe to the apparatus conditions for a specific experiment session.
 */
export function useApparatus(
  experimentId: string,
  apparatusId?: string,
): ApparatusCondition | Record<string, ApparatusCondition> | null {
  const apparatus = useSimulationStore(
    useCallback(
      (s) => s.sessions[experimentId]?.apparatus ?? null,
      [experimentId],
    ),
  );

  if (!apparatus) return null;
  if (apparatusId) return apparatus[apparatusId] ?? null;
  return apparatus;
}

// ─── Unknown Sample hook ──────────────────────────────────────────────────────

/**
 * Subscribe to the unknown sample for a specific experiment session.
 */
export function useUnknownSample(experimentId: string): UnknownSample | null {
  return useSimulationStore(
    useCallback(
      (s) => s.sessions[experimentId]?.unknownSample ?? null,
      [experimentId],
    ),
  );
}

// ─── Environment effects hook ──────────────────────────────────────────────────

/**
 * Return only the effects object from the environment — avoids re-renders
 * when unrelated environment fields change.
 */
export function useEnvironmentEffects(experimentId: string) {
  return useSimulationStore(
    useCallback(
      (s) => s.sessions[experimentId]?.environment.effects ?? null,
      [experimentId],
    ),
  );
}

// ─── Session metadata ─────────────────────────────────────────────────────────

/**
 * Read a single metadata key from a session.
 * Useful for experiment-specific derived state (e.g. recorded endpoint volume).
 */
export function useSessionMeta<T = unknown>(
  experimentId: string,
  key:          string,
): T | undefined {
  return useSimulationStore(
    useCallback(
      (s) => s.sessions[experimentId]?.metadata[key] as T | undefined,
      [experimentId, key],
    ),
  );
}
