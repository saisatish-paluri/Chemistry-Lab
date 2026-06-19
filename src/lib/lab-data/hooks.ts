"use client";

import {
  useEffect,
  useRef,
  useCallback,
  useState,
  useMemo,
} from "react";
import { useNotebookStore } from "./notebook-store";
import { useTrialStore }    from "./trial-store";
import { labDataPersistence } from "./idb-persistence";
import { createUnknownGenerator, generateSessionId } from "./unknown-generator";
import {
  createTable,
  updateCell,
  addRow,
  removeRow,
  getColumnAverages,
  formatCell,
} from "./observation-table";
import type {
  NotebookSectionKey,
  TrialNumber,
  ObservationTable,
  ObservationTableTemplate,
  UnknownValueConfig,
  SessionUnknowns,
  WorkflowStage,
  LabNotebook,
  TrialSet,
} from "./types";

// ─── Internal: stable session ID per experiment ───────────────────────────────

// Module-level cache ensures the same session ID survives unmount/remount
// for the lifetime of the browser tab.
const sessionIdCache = new Map<string, string>();

function useSessionId(experimentId: string): string {
  return useMemo(() => {
    if (!experimentId) return "";
    if (!sessionIdCache.has(experimentId)) {
      sessionIdCache.set(experimentId, generateSessionId(experimentId));
    }
    return sessionIdCache.get(experimentId)!;
  }, [experimentId]);
}

// ─── useLabNotebook ────────────────────────────────────────────────────────────

export interface UseLabNotebookResult {
  notebook: LabNotebook | undefined;
  loading:  boolean;
  update:   (key: NotebookSectionKey, content: string) => void;
  save:     () => Promise<void>;
}

/**
 * Load, update, and auto-save the lab notebook for one experiment.
 * Call once per experiment page component.
 */
export function useLabNotebook(experimentId: string): UseLabNotebookResult {
  const sessionId   = useSessionId(experimentId);
  const loadNotebook  = useNotebookStore(s => s.loadNotebook);
  const updateSection = useNotebookStore(s => s.updateSection);
  const saveNotebook  = useNotebookStore(s => s.saveNotebook);
  const notebook      = useNotebookStore(s => s.notebooks.get(experimentId));
  const loading       = useNotebookStore(s => s.loading.has(experimentId));

  useEffect(() => {
    if (experimentId && sessionId) {
      void loadNotebook(experimentId, sessionId);
    }
  }, [experimentId, sessionId, loadNotebook]);

  const update = useCallback(
    (key: NotebookSectionKey, content: string) =>
      updateSection(experimentId, key, content),
    [experimentId, updateSection],
  );

  const save = useCallback(
    () => saveNotebook(experimentId),
    [experimentId, saveNotebook],
  );

  return { notebook, loading, update, save };
}

// ─── useTrials ────────────────────────────────────────────────────────────────

export interface UseTrialsResult {
  trialSet:   TrialSet | undefined;
  setValue:   (trialNum: TrialNumber, key: string, value: number | string | null) => void;
  complete:   (trialNum: TrialNumber) => void;
  setNotes:   (trialNum: TrialNumber, notes: string) => void;
  reset:      () => void;
}

/**
 * Manage three-trial data collection for one experiment.
 * Averages across completed trials are computed automatically.
 */
export function useTrials(experimentId: string): UseTrialsResult {
  const sessionId   = useSessionId(experimentId);
  const loadTrialSet  = useTrialStore(s => s.loadTrialSet);
  const setTrialValue = useTrialStore(s => s.setTrialValue);
  const completeTrial = useTrialStore(s => s.completeTrial);
  const setTrialNotes = useTrialStore(s => s.setTrialNotes);
  const resetTrials   = useTrialStore(s => s.resetTrials);
  const trialSet      = useTrialStore(s => s.trialSets.get(experimentId));

  useEffect(() => {
    if (experimentId && sessionId) {
      void loadTrialSet(experimentId, sessionId);
    }
  }, [experimentId, sessionId, loadTrialSet]);

  const setValue = useCallback(
    (trialNum: TrialNumber, key: string, value: number | string | null) =>
      setTrialValue(experimentId, trialNum, key, value),
    [experimentId, setTrialValue],
  );

  const complete = useCallback(
    (trialNum: TrialNumber) => completeTrial(experimentId, trialNum),
    [experimentId, completeTrial],
  );

  const setNotes = useCallback(
    (trialNum: TrialNumber, notes: string) =>
      setTrialNotes(experimentId, trialNum, notes),
    [experimentId, setTrialNotes],
  );

  const reset = useCallback(
    () => { if (sessionId) resetTrials(experimentId, sessionId); },
    [experimentId, sessionId, resetTrials],
  );

  return { trialSet, setValue, complete, setNotes, reset };
}

// ─── useObservationTable ──────────────────────────────────────────────────────

export interface UseObservationTableResult {
  table:           ObservationTable | null;
  setCellValue:    (rowId: string, colId: string, value: string | number | null) => Promise<void>;
  addRowToTable:   () => Promise<void>;
  removeRowFromTable: (rowId: string) => Promise<void>;
  averages:        Record<string, number | null>;
  format:          typeof formatCell;
}

/**
 * Load or create an observation table from a column template.
 * The `template` argument is captured on first render via ref — callers
 * should wrap it in `useMemo` if the object would otherwise be recreated
 * every render.
 */
export function useObservationTable(
  experimentId:  string,
  template:      ObservationTableTemplate,
  initialRows    = 3,
): UseObservationTableResult {
  const sessionId  = useSessionId(experimentId);
  const [table, setTable] = useState<ObservationTable | null>(null);

  // Capture template at mount; prevents spurious effect re-runs if the
  // caller passes an inline object literal.
  const templateRef = useRef(template);

  useEffect(() => {
    if (!sessionId) return;
    let active = true;
    const tpl  = templateRef.current;

    const load = async () => {
      const tables   = await labDataPersistence.loadTablesForExperiment(experimentId).catch(() => []);
      if (!active) return;

      const existing = tables.find(t => t.title === tpl.title);
      if (existing) {
        setTable(existing);
      } else {
        const fresh = createTable(experimentId, sessionId, tpl, initialRows);
        setTable(fresh);
        await labDataPersistence.saveTable(fresh).catch(() => undefined);
      }
    };

    void load();
    return () => { active = false; };
  }, [experimentId, sessionId, initialRows]);

  const setCellValue = useCallback(
    async (rowId: string, colId: string, value: string | number | null) => {
      if (!table) return;
      const updated = updateCell(table, rowId, colId, value);
      setTable(updated);
      await labDataPersistence.saveTable(updated).catch(() => undefined);
    },
    [table],
  );

  const addRowToTable = useCallback(async () => {
    if (!table) return;
    const updated = addRow(table);
    setTable(updated);
    await labDataPersistence.saveTable(updated).catch(() => undefined);
  }, [table]);

  const removeRowFromTable = useCallback(async (rowId: string) => {
    if (!table) return;
    const updated = removeRow(table, rowId);
    setTable(updated);
    await labDataPersistence.saveTable(updated).catch(() => undefined);
  }, [table]);

  const averages = useMemo(
    () => (table ? getColumnAverages(table) : {}),
    [table],
  );

  return { table, setCellValue, addRowToTable, removeRowFromTable, averages, format: formatCell };
}

// ─── useUnknownValues ─────────────────────────────────────────────────────────

export interface UseUnknownValuesResult {
  unknowns:   SessionUnknowns | null;
  getUnknown: (configId: string) => SessionUnknowns["unknowns"][number] | null;
}

/**
 * Generate (or restore) deterministic unknown values for a session.
 * The same `sessionId` always produces the same values — reproducible across
 * page reloads. The `configs` array is captured on first render via ref.
 */
export function useUnknownValues(
  experimentId: string,
  configs:      UnknownValueConfig[],
): UseUnknownValuesResult {
  const sessionId   = useSessionId(experimentId);
  const [unknowns, setUnknowns] = useState<SessionUnknowns | null>(null);
  const configsRef  = useRef(configs);

  useEffect(() => {
    if (!sessionId) return;
    let active = true;
    const cfgs = configsRef.current;

    const load = async () => {
      const existing = await labDataPersistence
        .loadSessionUnknowns(sessionId)
        .catch(() => null);
      if (!active) return;

      if (existing) {
        setUnknowns(existing);
      } else {
        const gen   = createUnknownGenerator(sessionId);
        const fresh = gen.buildSessionUnknowns(cfgs);
        setUnknowns(fresh);
        await labDataPersistence.saveSessionUnknowns(fresh).catch(() => undefined);
      }
    };

    void load();
    return () => { active = false; };
  }, [sessionId]);

  const getUnknown = useCallback(
    (configId: string) =>
      unknowns?.unknowns.find(u => u.configId === configId) ?? null,
    [unknowns],
  );

  return { unknowns, getUnknown };
}

// ─── useWorkflowStage ─────────────────────────────────────────────────────────

export interface UseWorkflowStageResult {
  stage:    WorkflowStage;
  setStage: (next: WorkflowStage) => Promise<void>;
}

/**
 * Track and persist the student's current workflow stage for one experiment.
 * Stages: setup → observation → dataCollection → calculation → interpretation
 */
export function useWorkflowStage(experimentId: string): UseWorkflowStageResult {
  const sessionId = useSessionId(experimentId);
  const [stage, setStageState] = useState<WorkflowStage>("setup");

  useEffect(() => {
    if (!sessionId) return;
    void labDataPersistence
      .loadLabSession(sessionId)
      .then(s => { if (s) setStageState(s.workflowStage); })
      .catch(() => undefined);
  }, [sessionId]);

  const setStage = useCallback(
    async (next: WorkflowStage) => {
      setStageState(next);
      if (!sessionId) return;
      await labDataPersistence.saveLabSession({
        id:            sessionId,
        experimentId,
        workflowStage: next,
        createdAt:     Date.now(),
        updatedAt:     Date.now(),
      }).catch(() => undefined);
    },
    [experimentId, sessionId],
  );

  return { stage, setStage };
}
