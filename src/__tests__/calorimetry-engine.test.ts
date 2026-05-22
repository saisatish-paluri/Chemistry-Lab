import { describe, it, expect } from "vitest";
import {
  initialCalorimetryState,
  addNaOH,
  calcCalorimetryTemp,
  calcExperimentalDeltaH,
  DELTA_H_NEUTRALISATION,
} from "../lib/engine/calorimetry-engine";

describe("calcCalorimetryTemp", () => {
  it("returns 25 °C when no NaOH added", () => {
    expect(calcCalorimetryTemp(0)).toBeCloseTo(25, 1);
  });
  it("temperature rises as NaOH is added (before equivalence)", () => {
    expect(calcCalorimetryTemp(50)).toBeGreaterThan(calcCalorimetryTemp(0));
  });
  it("peaks near equivalence point (100 mL NaOH)", () => {
    const tAt100  = calcCalorimetryTemp(100);
    const tAt120  = calcCalorimetryTemp(120);
    // After equivalence, temp plateaus (no more reaction heat)
    expect(tAt100).toBeGreaterThanOrEqual(tAt120 - 0.1);
  });
  it("gives deterministic value at 100 mL", () => {
    // At equivalence: 0.1 mol reacted in 200 mL → deltaT ≈ 6.8 °C
    const t = calcCalorimetryTemp(100);
    expect(t).toBeGreaterThan(30);
    expect(t).toBeLessThan(40);
  });
});

describe("calcExperimentalDeltaH", () => {
  it("returns 0 when naohAddedMl is 0", () => {
    expect(calcExperimentalDeltaH(0, 5)).toBe(0);
  });
  it("returns negative value (exothermic) for positive deltaT", () => {
    const dh = calcExperimentalDeltaH(100, 6.8);
    expect(dh).toBeLessThan(0);
  });
  it("is close to literature value at equivalence", () => {
    const deltaT = calcCalorimetryTemp(100) - 25;
    const dh     = calcExperimentalDeltaH(100, deltaT);
    // Should match DELTA_H_NEUTRALISATION in kJ/mol (−57.1 kJ/mol)
    expect(dh).toBeCloseTo(DELTA_H_NEUTRALISATION / 1000, 0);
  });
});

describe("initialCalorimetryState", () => {
  it("starts ready with 0 mL NaOH", () => {
    const s = initialCalorimetryState("guided");
    expect(s.status).toBe("ready");
    expect(s.naohAddedMl).toBe(0);
  });
  it("starts at 25 °C", () => {
    expect(initialCalorimetryState("guided").currentTempC).toBe(25);
  });
  it("has one data point for initial temperature", () => {
    const s = initialCalorimetryState("guided");
    expect(s.dataPoints).toHaveLength(1);
    expect(s.dataPoints[0].tempC).toBe(25);
  });
  it("has no calculated ΔH yet", () => {
    expect(initialCalorimetryState("guided").calculatedDeltaH).toBeNull();
  });
});

describe("addNaOH", () => {
  it("increases naohAddedMl by the amount added", () => {
    const s    = initialCalorimetryState("guided");
    const next = addNaOH(s, 10);
    expect(next.naohAddedMl).toBe(10);
  });

  it("temperature rises after adding NaOH", () => {
    const s    = initialCalorimetryState("guided");
    const next = addNaOH(s, 10);
    expect(next.currentTempC).toBeGreaterThan(s.currentTempC);
  });

  it("adds a data point each call", () => {
    const s    = initialCalorimetryState("guided");
    const next = addNaOH(s, 10);
    expect(next.dataPoints.length).toBe(s.dataPoints.length + 1);
  });

  it("clamps volume to minimum 5 mL", () => {
    const s    = initialCalorimetryState("guided");
    const next = addNaOH(s, 1);
    expect(next.naohAddedMl).toBe(5);
  });

  it("clamps volume to maximum 20 mL per addition", () => {
    const s    = initialCalorimetryState("guided");
    const next = addNaOH(s, 50);
    expect(next.naohAddedMl).toBe(20);
  });

  it("completes add-50ml objective after enough additions", () => {
    let s = initialCalorimetryState("guided");
    s = addNaOH(s, 20);
    s = addNaOH(s, 20);
    s = addNaOH(s, 10);
    expect(s.objectives.find((o) => o.id === "add-50ml")?.completed).toBe(true);
  });

  it("completes reach-eq objective at equivalence point", () => {
    let s = initialCalorimetryState("guided");
    // Add 100 mL in 10 mL portions
    for (let i = 0; i < 10; i++) s = addNaOH(s, 10);
    expect(s.objectives.find((o) => o.id === "reach-eq")?.completed).toBe(true);
  });

  it("calculates ΔH after equivalence point", () => {
    let s = initialCalorimetryState("guided");
    for (let i = 0; i < 10; i++) s = addNaOH(s, 10);
    expect(s.calculatedDeltaH).not.toBeNull();
  });

  it("calculated ΔH is within ±5 kJ/mol of −57.1 kJ/mol", () => {
    let s = initialCalorimetryState("guided");
    for (let i = 0; i < 10; i++) s = addNaOH(s, 10);
    const dh = s.calculatedDeltaH!;
    expect(Math.abs(dh - (-57.1))).toBeLessThan(5);
  });

  it("does not modify state when already completed", () => {
    let s = initialCalorimetryState("guided");
    for (let i = 0; i < 10; i++) s = addNaOH(s, 10);
    const completed = s;
    const attempted = addNaOH(completed, 10);
    expect(attempted).toStrictEqual(completed);
  });
});

describe("objectives completion", () => {
  it("completes calc-dh objective after reaching equivalence", () => {
    let s = initialCalorimetryState("guided");
    for (let i = 0; i < 10; i++) s = addNaOH(s, 10);
    expect(s.objectives.find((o) => o.id === "calc-dh")?.completed).toBe(true);
  });

  it("status becomes completed when all objectives done", () => {
    let s = initialCalorimetryState("guided");
    for (let i = 0; i < 10; i++) s = addNaOH(s, 10);
    expect(s.status).toBe("completed");
  });

  it("result is set when completed", () => {
    let s = initialCalorimetryState("guided");
    for (let i = 0; i < 10; i++) s = addNaOH(s, 10);
    expect(s.result).not.toBeNull();
    expect(s.result?.success).toBe(true);
  });
});
