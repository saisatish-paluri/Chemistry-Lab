import { describe, it, expect } from "vitest";
import {
  validateAddTitrant,
  validateAddIndicator,
  validateStartElectrolysis,
  validateConnectCircuit,
  validateInsertElectrodes,
} from "@/lib/engine/validation";
import { addIndicator, initialTitrationState } from "@/lib/engine/titration-engine";
import {
  initialElectrolysisState,
  setElectrolyte,
  insertElectrodes,
  connectCircuit,
} from "@/lib/engine/electrolysis-engine";

// ── Titration validation ─────────────────────────────────────────────────────

describe("validateAddIndicator", () => {
  it("allows adding when no indicator present", () => {
    const s = initialTitrationState("guided");
    expect(validateAddIndicator(s)).toBeNull();
  });

  it("blocks adding a second indicator", () => {
    const s = addIndicator(initialTitrationState("guided"), "phenolphthalein");
    const err = validateAddIndicator(s);
    expect(err?.code).toBe("INDICATOR_PRESENT");
  });

  it("blocks adding during a running titration", () => {
    const s = { ...initialTitrationState("guided"), status: "running" as const };
    const err = validateAddIndicator(s);
    expect(err?.code).toBe("TITRATION_RUNNING");
  });

  it("blocks adding after experiment is completed", () => {
    const s = { ...initialTitrationState("guided"), status: "completed" as const };
    const err = validateAddIndicator(s);
    expect(err?.code).toBe("EXPERIMENT_DONE");
  });

  it("blocks adding after experiment has failed", () => {
    const s = { ...initialTitrationState("guided"), status: "failed" as const };
    const err = validateAddIndicator(s);
    expect(err?.code).toBe("EXPERIMENT_DONE");
  });
});

describe("validateAddTitrant", () => {
  it("blocks when no indicator is present", () => {
    const s = initialTitrationState("guided");
    const err = validateAddTitrant(s);
    expect(err?.code).toBe("NO_INDICATOR");
  });

  it("blocks when burette is empty", () => {
    const s = {
      ...addIndicator(initialTitrationState("guided"), "litmus"),
      burette: { flowRate: 1 as const, volumeRemaining: 0, stopcockOpen: false },
    };
    const err = validateAddTitrant(s);
    expect(err?.code).toBe("BURETTE_EMPTY");
  });

  it("blocks when experiment is completed", () => {
    const s = {
      ...addIndicator(initialTitrationState("guided"), "litmus"),
      status: "completed" as const,
    };
    const err = validateAddTitrant(s);
    expect(err?.code).toBe("EXPERIMENT_DONE");
  });

  it("allows when indicator present and burette has liquid", () => {
    const s = addIndicator(initialTitrationState("guided"), "phenolphthalein");
    expect(validateAddTitrant(s)).toBeNull();
  });
});

// ── Electrolysis validation ───────────────────────────────────────────────────

describe("validateInsertElectrodes", () => {
  it("blocks without electrolyte", () => {
    const s = initialElectrolysisState("guided");
    const err = validateInsertElectrodes(s);
    expect(err?.code).toBe("NO_ELECTROLYTE");
  });

  it("blocks if already inserted", () => {
    let s = initialElectrolysisState("guided");
    s = setElectrolyte(s, "sodium-chloride");
    s = insertElectrodes(s);
    const err = validateInsertElectrodes(s);
    expect(err?.code).toBe("ALREADY_INSERTED");
  });

  it("blocks if experiment is done", () => {
    let s = initialElectrolysisState("guided");
    s = setElectrolyte(s, "sodium-chloride");
    const completed = { ...s, status: "completed" as const };
    const err = validateInsertElectrodes(completed);
    expect(err?.code).toBe("EXPERIMENT_DONE");
  });

  it("allows when electrolyte selected and electrodes not yet in", () => {
    let s = initialElectrolysisState("guided");
    s = setElectrolyte(s, "sodium-chloride");
    expect(validateInsertElectrodes(s)).toBeNull();
  });
});

describe("validateConnectCircuit", () => {
  it("blocks if electrodes not inserted", () => {
    const s = initialElectrolysisState("guided");
    const err = validateConnectCircuit(s);
    expect(err?.code).toBe("ELECTRODES_OUT");
  });

  it("blocks if already connected", () => {
    let s = initialElectrolysisState("guided");
    s = setElectrolyte(s, "sodium-chloride");
    s = insertElectrodes(s);
    s = connectCircuit(s);
    const err = validateConnectCircuit(s);
    expect(err?.code).toBe("ALREADY_CONNECTED");
  });

  it("allows when electrodes in but circuit not yet connected", () => {
    let s = initialElectrolysisState("guided");
    s = setElectrolyte(s, "sodium-chloride");
    s = insertElectrodes(s);
    expect(validateConnectCircuit(s)).toBeNull();
  });
});

describe("validateStartElectrolysis", () => {
  it("blocks when no electrolyte selected", () => {
    const err = validateStartElectrolysis(initialElectrolysisState("guided"));
    expect(err?.code).toBe("NO_ELECTROLYTE");
  });

  it("blocks when electrodes not inserted", () => {
    let s = initialElectrolysisState("guided");
    s = setElectrolyte(s, "sodium-chloride");
    const err = validateStartElectrolysis(s);
    expect(err?.code).toBe("ELECTRODES_OUT");
  });

  it("blocks when circuit not complete", () => {
    let s = initialElectrolysisState("guided");
    s = setElectrolyte(s, "sodium-chloride");
    s = insertElectrodes(s);
    const err = validateStartElectrolysis(s);
    expect(err?.code).toBe("OPEN_CIRCUIT");
  });

  it("blocks when experiment is completed", () => {
    let s = initialElectrolysisState("guided");
    s = setElectrolyte(s, "sodium-chloride");
    s = insertElectrodes(s);
    s = connectCircuit(s);
    const completed = { ...s, status: "completed" as const };
    const err = validateStartElectrolysis(completed);
    expect(err?.code).toBe("EXPERIMENT_DONE");
  });

  it("allows when fully set up", () => {
    let s = initialElectrolysisState("guided");
    s = setElectrolyte(s, "sodium-chloride");
    s = insertElectrodes(s);
    s = connectCircuit(s);
    expect(validateStartElectrolysis(s)).toBeNull();
  });
});
