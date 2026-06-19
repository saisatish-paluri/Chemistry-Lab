import { describe, it, expect } from "vitest";
import {
  initialGasLawsState,
  selectLaw,
  startExploration,
  setVolume,
  setTemperature,
  recordDataPoint,
  completeGasLaws,
  resetGasLaws,
  boylePressure,
  charlesVolume,
  GAS_R,
  GAS_N_MOLES,
  GAS_REF_TEMP,
  GAS_REF_PRES,
  BOYLE_V_MIN,
  BOYLE_V_MAX,
  BOYLE_V_INIT,
  CHARLES_T_MIN,
  CHARLES_T_MAX,
  CHARLES_T_INIT,
} from "@/lib/engine/gas-laws-engine";
import {
  validateSelectLaw,
  validateRecordDataPoint,
  validateCompleteGasLaws,
} from "@/lib/engine/validation";
import type { GasLawsState } from "@/lib/engine/types";

describe("boylePressure", () => {
  it("satisfies PV = nRT", () => {
    const V = 5.0;
    const P = boylePressure(V);
    // van der Waals deviates ~0.5% from ideal gas; precision 1 (±0.05) is appropriate
    expect(P * V).toBeCloseTo(GAS_N_MOLES * GAS_R * GAS_REF_TEMP, 1);
  });

  it("pressure increases as volume decreases", () => {
    expect(boylePressure(2)).toBeGreaterThan(boylePressure(5));
  });

  it("doubles when volume halves", () => {
    const P5 = boylePressure(5);
    const P2_5 = boylePressure(2.5);
    // van der Waals: not exactly double, but within 1%
    expect(P2_5).toBeCloseTo(P5 * 2, 1);
  });
});

describe("charlesVolume", () => {
  it("satisfies V = nRT/P", () => {
    const T = 300;
    const V = charlesVolume(T);
    // van der Waals: slight deviation from ideal nRT/P
    expect(V).toBeCloseTo((GAS_N_MOLES * GAS_R * T) / GAS_REF_PRES, 1);
  });

  it("volume is directly proportional to temperature", () => {
    const V300 = charlesVolume(300);
    const V600 = charlesVolume(600);
    // van der Waals is nearly linear in T; within 1%
    expect(V600).toBeCloseTo(V300 * 2, 1);
  });

  it("V/T is constant", () => {
    const ratio1 = charlesVolume(300) / 300;
    const ratio2 = charlesVolume(450) / 450;
    // van der Waals: V/T is nearly constant at these pressures
    expect(ratio1).toBeCloseTo(ratio2, 1);
  });
});

describe("initialGasLawsState", () => {
  it("starts with correct defaults", () => {
    const s = initialGasLawsState("guided");
    expect(s.status).toBe("idle");
    expect(s.law).toBeNull();
    expect(s.nMoles).toBe(GAS_N_MOLES);
    expect(s.temperature).toBe(GAS_REF_TEMP);
    expect(s.volume).toBeCloseTo(BOYLE_V_INIT, 0);
    expect(s.dataPoints).toHaveLength(0);
    expect(s.result).toBeNull();
    expect(s.observations).toHaveLength(0);
  });

  it("sets mode correctly", () => {
    const s = initialGasLawsState("free");
    expect(s.mode).toBe("free");
  });

  it("initial state satisfies PV = nRT", () => {
    const s = initialGasLawsState("guided");
    expect(s.pressure * s.volume).toBeCloseTo(GAS_N_MOLES * GAS_R * GAS_REF_TEMP, 1);
  });
});

describe("selectLaw", () => {
  it("selects boyle and transitions to setup", () => {
    const s = selectLaw(initialGasLawsState("guided"), "boyle");
    expect(s.law).toBe("boyle");
    expect(s.status).toBe("setup");
  });

  it("selects charles and transitions to setup", () => {
    const s = selectLaw(initialGasLawsState("guided"), "charles");
    expect(s.law).toBe("charles");
    expect(s.status).toBe("setup");
  });

  it("resets dataPoints when law changes", () => {
    let s = selectLaw(initialGasLawsState("guided"), "boyle");
    s = startExploration(s);
    s = recordDataPoint(s);
    expect(s.dataPoints.length).toBeGreaterThan(0);
    const switched = selectLaw(s, "charles");
    expect(switched.dataPoints).toHaveLength(0);
  });

  it("initializes boyle's law at correct volume and pressure", () => {
    const s = selectLaw(initialGasLawsState("guided"), "boyle");
    expect(s.volume).toBeCloseTo(BOYLE_V_INIT, 0);
    expect(s.pressure * s.volume).toBeCloseTo(GAS_N_MOLES * GAS_R * GAS_REF_TEMP, 1);
  });

  it("initializes charles's law at correct temperature and volume", () => {
    const s = selectLaw(initialGasLawsState("guided"), "charles");
    expect(s.temperature).toBe(CHARLES_T_INIT);
    expect(s.volume).toBeCloseTo(charlesVolume(CHARLES_T_INIT), 5);
    expect(s.pressure).toBe(GAS_REF_PRES);
  });

  it("adds an observation", () => {
    const s = selectLaw(initialGasLawsState("guided"), "boyle");
    expect(s.observations.length).toBeGreaterThan(0);
  });

  it("does not change a completed state", () => {
    let s = selectLaw(initialGasLawsState("guided"), "boyle");
    s = startExploration(s);
    s = recordDataPoint(s);
    s = completeGasLaws(s);
    const unchanged = selectLaw(s, "charles");
    expect(unchanged.law).toBe("boyle");
    expect(unchanged.status).toBe("completed");
  });
});

describe("validateSelectLaw", () => {
  it("returns null when in idle/setup state", () => {
    expect(validateSelectLaw(initialGasLawsState("guided"))).toBeNull();
  });

  it("returns error if already completed", () => {
    let s = selectLaw(initialGasLawsState("guided"), "boyle");
    s = startExploration(s);
    s = recordDataPoint(s);
    s = completeGasLaws(s);
    const err = validateSelectLaw(s);
    expect(err?.code).toBe("EXPERIMENT_DONE");
  });
});

describe("startExploration", () => {
  it("transitions to running", () => {
    let s = selectLaw(initialGasLawsState("guided"), "boyle");
    s = startExploration(s);
    expect(s.status).toBe("running");
  });

  it("does not start if no law selected", () => {
    const s = startExploration(initialGasLawsState("guided"));
    expect(s.status).toBe("idle");
  });

  it("marks start objective complete", () => {
    let s = selectLaw(initialGasLawsState("guided"), "boyle");
    s = startExploration(s);
    const obj = s.objectives.find((o) => o.id === "start");
    expect(obj?.completed).toBe(true);
  });

  it("marks start-exp step complete", () => {
    let s = selectLaw(initialGasLawsState("guided"), "boyle");
    s = startExploration(s);
    const step = s.steps.find((st) => st.id === "start-exp");
    expect(step?.completed).toBe(true);
  });
});

describe("setVolume (Boyle's)", () => {
  function boyleRunning(): GasLawsState {
    return startExploration(selectLaw(initialGasLawsState("guided"), "boyle"));
  }

  it("updates volume and recalculates pressure", () => {
    const s = setVolume(boyleRunning(), 3.0);
    expect(s.volume).toBe(3.0);
    expect(s.pressure).toBeCloseTo(boylePressure(3.0), 5);
  });

  it("clamps to BOYLE_V_MIN", () => {
    const s = setVolume(boyleRunning(), 0.0);
    expect(s.volume).toBe(BOYLE_V_MIN);
  });

  it("clamps to BOYLE_V_MAX", () => {
    const s = setVolume(boyleRunning(), 100);
    expect(s.volume).toBe(BOYLE_V_MAX);
  });

  it("does nothing for Charles's law state", () => {
    const s = startExploration(selectLaw(initialGasLawsState("guided"), "charles"));
    const prev = s.volume;
    const next = setVolume(s, 5.0);
    expect(next.volume).toBe(prev);
  });

  it("PV product stays constant after volume change", () => {
    const s = setVolume(boyleRunning(), 4.0);
    expect(s.pressure * s.volume).toBeCloseTo(GAS_N_MOLES * GAS_R * GAS_REF_TEMP, 1);
  });
});

describe("setTemperature (Charles's)", () => {
  function charlesRunning(): GasLawsState {
    return startExploration(selectLaw(initialGasLawsState("guided"), "charles"));
  }

  it("updates temperature and recalculates volume", () => {
    const s = setTemperature(charlesRunning(), 400);
    expect(s.temperature).toBe(400);
    expect(s.volume).toBeCloseTo(charlesVolume(400), 5);
  });

  it("clamps to CHARLES_T_MIN", () => {
    const s = setTemperature(charlesRunning(), 50);
    expect(s.temperature).toBe(CHARLES_T_MIN);
  });

  it("clamps to CHARLES_T_MAX", () => {
    const s = setTemperature(charlesRunning(), 1000);
    expect(s.temperature).toBe(CHARLES_T_MAX);
  });

  it("does nothing for Boyle's law state", () => {
    const s = startExploration(selectLaw(initialGasLawsState("guided"), "boyle"));
    const prev = s.temperature;
    const next = setTemperature(s, 500);
    expect(next.temperature).toBe(prev);
  });
});

describe("recordDataPoint", () => {
  function boyleAtVolume(v: number): GasLawsState {
    return setVolume(startExploration(selectLaw(initialGasLawsState("guided"), "boyle")), v);
  }

  it("records a data point", () => {
    const s = recordDataPoint(boyleAtVolume(3.0));
    expect(s.dataPoints).toHaveLength(1);
    expect(s.dataPoints[0].x).toBeCloseTo(3.0, 5);
    expect(s.dataPoints[0].y).toBeCloseTo(boylePressure(3.0), 5);
  });

  it("deduplicates nearby points (within 2%)", () => {
    let s = boyleAtVolume(3.0);
    s = recordDataPoint(s);
    s = setVolume(s, 3.01); // within 2% of 3.0
    s = recordDataPoint(s);
    expect(s.dataPoints).toHaveLength(1);
  });

  it("keeps distinct points far apart", () => {
    let s = boyleAtVolume(2.0);
    s = recordDataPoint(s);
    s = setVolume(s, 8.0);
    s = recordDataPoint(s);
    expect(s.dataPoints).toHaveLength(2);
  });

  it("sorts data points by x value", () => {
    let s = boyleAtVolume(8.0);
    s = recordDataPoint(s);
    s = setVolume(s, 2.0);
    s = recordDataPoint(s);
    expect(s.dataPoints[0].x).toBeLessThan(s.dataPoints[1].x);
  });

  it("marks objectives complete after 3 points", () => {
    let s = boyleAtVolume(2.0);
    s = recordDataPoint(s);
    s = setVolume(s, 5.0);
    s = recordDataPoint(s);
    s = setVolume(s, 9.0);
    s = recordDataPoint(s);
    const obj = s.objectives.find((o) => o.id === "record-data");
    expect(obj?.completed).toBe(true);
  });

  it("does nothing if not running", () => {
    const s = selectLaw(initialGasLawsState("guided"), "boyle");
    // status is "setup", not "running"
    const next = recordDataPoint(s);
    expect(next.dataPoints).toHaveLength(0);
  });

  it("stores Charles's data as (temperature, volume) pairs", () => {
    let s = startExploration(selectLaw(initialGasLawsState("guided"), "charles"));
    s = setTemperature(s, 400);
    s = recordDataPoint(s);
    expect(s.dataPoints[0].x).toBe(400);
    expect(s.dataPoints[0].y).toBeCloseTo(charlesVolume(400), 5);
  });
});

describe("validateRecordDataPoint", () => {
  it("returns null when running", () => {
    const s = startExploration(selectLaw(initialGasLawsState("guided"), "boyle"));
    expect(validateRecordDataPoint(s)).toBeNull();
  });

  it("returns error when not running", () => {
    const s = selectLaw(initialGasLawsState("guided"), "boyle");
    const err = validateRecordDataPoint(s);
    expect(err?.code).toBe("NOT_RUNNING");
  });
});

describe("completeGasLaws", () => {
  it("requires at least one data point", () => {
    const s = startExploration(selectLaw(initialGasLawsState("guided"), "boyle"));
    const same = completeGasLaws(s);
    expect(same.status).toBe("running"); // unchanged
  });

  it("completes with result", () => {
    let s = startExploration(selectLaw(initialGasLawsState("guided"), "boyle"));
    s = recordDataPoint(s);
    const final = completeGasLaws(s);
    expect(final.status).toBe("completed");
    expect(final.result).not.toBeNull();
    expect(final.result?.success).toBe(true);
  });

  it("score = 55 for 1 data point", () => {
    let s = startExploration(selectLaw(initialGasLawsState("guided"), "boyle"));
    s = recordDataPoint(s);
    const final = completeGasLaws(s);
    expect(final.result?.score).toBe(55);
  });

  it("score = 88 for 3-4 data points", () => {
    let s = startExploration(selectLaw(initialGasLawsState("guided"), "boyle"));
    s = setVolume(s, 2.0); s = recordDataPoint(s);
    s = setVolume(s, 5.0); s = recordDataPoint(s);
    s = setVolume(s, 9.0); s = recordDataPoint(s);
    const final = completeGasLaws(s);
    expect(final.result?.score).toBe(88);
  });

  it("score = 100 for 5+ data points", () => {
    let s = startExploration(selectLaw(initialGasLawsState("guided"), "boyle"));
    const vols = [2.0, 4.0, 6.0, 8.0, 10.0];
    for (const v of vols) {
      s = setVolume(s, v);
      s = recordDataPoint(s);
    }
    const final = completeGasLaws(s);
    expect(final.result?.score).toBe(100);
  });

  it("Boyle's explanation mentions inverse relationship", () => {
    let s = startExploration(selectLaw(initialGasLawsState("guided"), "boyle"));
    s = recordDataPoint(s);
    const final = completeGasLaws(s);
    expect(final.result?.explanation).toContain("inversely");
  });

  it("Charles's explanation mentions temperature", () => {
    let s = startExploration(selectLaw(initialGasLawsState("guided"), "charles"));
    s = setTemperature(s, 400);
    s = recordDataPoint(s);
    const final = completeGasLaws(s);
    expect(final.result?.explanation).toContain("temperature");
  });
});

describe("validateCompleteGasLaws", () => {
  it("returns null when data points exist", () => {
    let s = startExploration(selectLaw(initialGasLawsState("guided"), "boyle"));
    s = recordDataPoint(s);
    expect(validateCompleteGasLaws(s)).toBeNull();
  });

  it("returns error when no data points", () => {
    const s = startExploration(selectLaw(initialGasLawsState("guided"), "boyle"));
    const err = validateCompleteGasLaws(s);
    expect(err?.code).toBe("NO_DATA");
  });

  it("returns NO_DATA error when no data points (initial state)", () => {
    const err = validateCompleteGasLaws(initialGasLawsState("guided"));
    expect(err?.code).toBe("NO_DATA");
  });
});

describe("resetGasLaws", () => {
  it("returns fresh state", () => {
    const fresh = resetGasLaws("free");
    expect(fresh.status).toBe("idle");
    expect(fresh.law).toBeNull();
    expect(fresh.dataPoints).toHaveLength(0);
    expect(fresh.mode).toBe("free");
  });
});
