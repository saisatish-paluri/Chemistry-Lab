import type {
  LabNotebook,
  ObservationTable,
  TrialSet,
  SessionUnknowns,
  LabSession,
} from "./types";
import { saveSession, loadSession, clearSession } from "@/lib/persistence";

// ─── IndexedDB setup ──────────────────────────────────────────────────────────

const DB_NAME    = "chemlab_lab_data";
const DB_VERSION = 1;

const STORE = {
  NOTEBOOKS: "notebooks",
  TABLES:    "observation_tables",
  TRIALS:    "trials",
  UNKNOWNS:  "session_unknowns",
  SESSIONS:  "lab_sessions",
} as const;

// Singleton IDB connection promise — reset on error so the next call retries.
let _db: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (_db) return _db;
  _db = new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE.NOTEBOOKS)) {
        db.createObjectStore(STORE.NOTEBOOKS, { keyPath: "experimentId" });
      }
      if (!db.objectStoreNames.contains(STORE.TABLES)) {
        const s = db.createObjectStore(STORE.TABLES, { keyPath: "id" });
        s.createIndex("by_experiment", "experimentId");
      }
      if (!db.objectStoreNames.contains(STORE.TRIALS)) {
        db.createObjectStore(STORE.TRIALS, { keyPath: "experimentId" });
      }
      if (!db.objectStoreNames.contains(STORE.UNKNOWNS)) {
        db.createObjectStore(STORE.UNKNOWNS, { keyPath: "sessionId" });
      }
      if (!db.objectStoreNames.contains(STORE.SESSIONS)) {
        db.createObjectStore(STORE.SESSIONS, { keyPath: "id" });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => { _db = null; reject(req.error); };
  });
  return _db;
}

// ─── IDB primitives ───────────────────────────────────────────────────────────

function idbGet<T>(storeName: string, key: string): Promise<T | null> {
  return getDB().then(
    db => new Promise<T | null>((resolve, reject) => {
      const req = db.transaction(storeName, "readonly").objectStore(storeName).get(key);
      req.onsuccess = () => resolve((req.result as T | undefined) ?? null);
      req.onerror   = () => reject(req.error);
    }),
  );
}

function idbPut<T>(storeName: string, value: T): Promise<void> {
  return getDB().then(
    db => new Promise<void>((resolve, reject) => {
      const req = db.transaction(storeName, "readwrite").objectStore(storeName).put(value);
      req.onsuccess = () => resolve();
      req.onerror   = () => reject(req.error);
    }),
  );
}

function idbDelete(storeName: string, key: string): Promise<void> {
  return getDB().then(
    db => new Promise<void>((resolve, reject) => {
      const req = db.transaction(storeName, "readwrite").objectStore(storeName).delete(key);
      req.onsuccess = () => resolve();
      req.onerror   = () => reject(req.error);
    }),
  );
}

function idbGetByIndex<T>(storeName: string, indexName: string, key: string): Promise<T[]> {
  return getDB().then(
    db => new Promise<T[]>((resolve, reject) => {
      const req = db
        .transaction(storeName, "readonly")
        .objectStore(storeName)
        .index(indexName)
        .getAll(key);
      req.onsuccess = () => resolve(req.result as T[]);
      req.onerror   = () => reject(req.error);
    }),
  );
}

// ─── localStorage fallback ────────────────────────────────────────────────────

// All fallback keys are prefixed "labdata_" before being handed to saveSession,
// which further prepends "chemlab_" — avoiding collisions with experiment stores.
const LS_NS = "labdata_";

function lsGet<T>(key: string): T | null {
  return loadSession<T>(LS_NS + key);
}

function lsSet<T>(key: string, value: T): void {
  saveSession(LS_NS + key, value);
}

function lsDel(key: string): void {
  clearSession(LS_NS + key);
}

// ─── Feature detection ────────────────────────────────────────────────────────

const IDB_AVAILABLE =
  typeof window !== "undefined" &&
  typeof window.indexedDB !== "undefined";

// ─── Public persistence API ───────────────────────────────────────────────────

export const labDataPersistence = {
  // ── Notebooks ──────────────────────────────────────────────────────────────

  async saveNotebook(notebook: LabNotebook): Promise<void> {
    if (IDB_AVAILABLE) {
      await idbPut(STORE.NOTEBOOKS, notebook);
    } else {
      lsSet(`notebook_${notebook.experimentId}`, notebook);
    }
  },

  async loadNotebook(experimentId: string): Promise<LabNotebook | null> {
    if (IDB_AVAILABLE) {
      return idbGet<LabNotebook>(STORE.NOTEBOOKS, experimentId);
    }
    return lsGet<LabNotebook>(`notebook_${experimentId}`);
  },

  // ── Observation Tables ─────────────────────────────────────────────────────

  async saveTable(table: ObservationTable): Promise<void> {
    if (IDB_AVAILABLE) {
      await idbPut(STORE.TABLES, table);
    } else {
      lsSet(`table_${table.id}`, table);
    }
  },

  async loadTable(tableId: string): Promise<ObservationTable | null> {
    if (IDB_AVAILABLE) {
      return idbGet<ObservationTable>(STORE.TABLES, tableId);
    }
    return lsGet<ObservationTable>(`table_${tableId}`);
  },

  async loadTablesForExperiment(experimentId: string): Promise<ObservationTable[]> {
    if (IDB_AVAILABLE) {
      return idbGetByIndex<ObservationTable>(STORE.TABLES, "by_experiment", experimentId);
    }
    // localStorage has no index — caller falls back gracefully to empty array
    return [];
  },

  async deleteTable(tableId: string): Promise<void> {
    if (IDB_AVAILABLE) {
      await idbDelete(STORE.TABLES, tableId);
    } else {
      lsDel(`table_${tableId}`);
    }
  },

  // ── Trial Sets ─────────────────────────────────────────────────────────────

  async saveTrialSet(trialSet: TrialSet): Promise<void> {
    if (IDB_AVAILABLE) {
      await idbPut(STORE.TRIALS, trialSet);
    } else {
      lsSet(`trials_${trialSet.experimentId}`, trialSet);
    }
  },

  async loadTrialSet(experimentId: string): Promise<TrialSet | null> {
    if (IDB_AVAILABLE) {
      return idbGet<TrialSet>(STORE.TRIALS, experimentId);
    }
    return lsGet<TrialSet>(`trials_${experimentId}`);
  },

  // ── Session Unknowns ───────────────────────────────────────────────────────

  async saveSessionUnknowns(su: SessionUnknowns): Promise<void> {
    if (IDB_AVAILABLE) {
      await idbPut(STORE.UNKNOWNS, su);
    } else {
      lsSet(`unknowns_${su.sessionId}`, su);
    }
  },

  async loadSessionUnknowns(sessionId: string): Promise<SessionUnknowns | null> {
    if (IDB_AVAILABLE) {
      return idbGet<SessionUnknowns>(STORE.UNKNOWNS, sessionId);
    }
    return lsGet<SessionUnknowns>(`unknowns_${sessionId}`);
  },

  // ── Lab Sessions ───────────────────────────────────────────────────────────

  async saveLabSession(session: LabSession): Promise<void> {
    if (IDB_AVAILABLE) {
      await idbPut(STORE.SESSIONS, session);
    } else {
      lsSet(`session_${session.id}`, session);
    }
  },

  async loadLabSession(sessionId: string): Promise<LabSession | null> {
    if (IDB_AVAILABLE) {
      return idbGet<LabSession>(STORE.SESSIONS, sessionId);
    }
    return lsGet<LabSession>(`session_${sessionId}`);
  },
};
