import { describe, it, expect } from "vitest";
import {
  initialGasCollectionState,
  addMarbleChips,
  addHCl,
  tickGasCollection,
  theoreticalCO2Moles,
  calculateDynamicGasProps,
  CACO3_MOLAR_MASS,
} from "../lib/engine/gas-collection-engine";

describe("theoreticalCO2Moles", () => {
  it("is limited by CaCO₃ when HCl is excess", () => {
    // 1 g CaCO₃ = 0.009991 mol; needs 0.01998 mol HCl; 0.05 mol HCl is excess
    const moles = theoreticalCO2Moles(1, 0.05);
    expect(moles).toBeCloseTo(1 / CACO3_MOLAR_MASS, 4);
  });

  it("is limited by HCl when CaCO₃ is excess", () => {
    // 5 g CaCO₃ = 0.04996 mol; 0.02 mol HCl → 0.01 mol CO₂ (HCl limiting)
    const moles = theoreticalCO2Moles(5, 0.02);
    expect(moles).toBeCloseTo(0.01, 4);
  });

  it("returns 0 when either reactant is 0", () => {
    expect(theoreticalCO2Moles(0, 0.05)).toBe(0);
    expect(theoreticalCO2Moles(2, 0)).toBe(0);
  });
});

describe("calculateDynamicGasProps", () => {
  it("calculates dry volume and purity at standard conditions", () => {
    const props = calculateDynamicGasProps(0.01, 25, 1.0);
    expect(props.volumeMl).toBeGreaterThan(240);
    expect(props.purityPct).toBeCloseTo(96.9, 1);
    expect(props.pWater).toBeCloseTo(0.031, 2);
  });
});

describe("initialGasCollectionState", () => {
  it("starts idle with zero amounts", () => {
    const s = initialGasCollectionState("guided");
    expect(s.status).toBe("idle");
    expect(s.caco3Grams).toBe(0);
    expect(s.hclVolumeMl).toBe(0);
    expect(s.co2CollectedMl).toBe(0);
  });
  it("has no observations initially", () => {
    expect(initialGasCollectionState("guided").observations).toHaveLength(0);
  });
  it("has no result initially", () => {
    expect(initialGasCollectionState("guided").result).toBeNull();
  });
});

describe("addMarbleChips", () => {
  it("increases caco3Grams", () => {
    const s    = initialGasCollectionState("guided");
    const next = addMarbleChips(s, 2);
    expect(next.caco3Grams).toBeCloseTo(2, 1);
  });
  it("clamps minimum to 0.5 g", () => {
    const s    = initialGasCollectionState("guided");
    const next = addMarbleChips(s, 0.1);
    expect(next.caco3Grams).toBeCloseTo(0.5, 1);
  });
  it("clamps maximum to 10 g", () => {
    const s    = initialGasCollectionState("guided");
    const next = addMarbleChips(s, 20);
    expect(next.caco3Grams).toBeLessThanOrEqual(10.1);
  });
  it("marks add-chips step completed", () => {
    const s    = initialGasCollectionState("guided");
    const next = addMarbleChips(s, 2);
    expect(next.steps.find((st) => st.id === "add-chips")?.completed).toBe(true);
  });
  it("updates theoreticalCo2Ml when HCl already added", () => {
    let s = initialGasCollectionState("guided");
    s = addHCl(s, 50);        // add HCl first (no reaction — no chips yet)
    s = addMarbleChips(s, 2); // now add chips
    expect(s.theoreticalCo2Ml).toBeGreaterThan(0);
  });
});

describe("addHCl", () => {
  it("increases hclVolumeMl", () => {
    const s    = initialGasCollectionState("guided");
    const next = addHCl(s, 50);
    expect(next.hclVolumeMl).toBe(50);
  });
  it("sets status to running when CaCO₃ is present", () => {
    let s = initialGasCollectionState("guided");
    s = addMarbleChips(s, 2);
    s = addHCl(s, 50);
    expect(s.status).toBe("running");
  });
  it("keeps status idle when no CaCO₃ present", () => {
    const s    = initialGasCollectionState("guided");
    const next = addHCl(s, 50);
    expect(next.status).toBe("idle");
  });
  it("clamps minimum to 10 mL", () => {
    const s    = initialGasCollectionState("guided");
    const next = addHCl(s, 2);
    expect(next.hclVolumeMl).toBe(10);
  });
  it("marks add-reactants objective complete when both added", () => {
    let s = initialGasCollectionState("guided");
    s = addMarbleChips(s, 2);
    s = addHCl(s, 50);
    expect(s.objectives.find((o) => o.id === "add-reactants")?.completed).toBe(true);
  });
});

describe("tickGasCollection", () => {
  function runningState() {
    let s = initialGasCollectionState("guided");
    s = addMarbleChips(s, 2);
    s = addHCl(s, 50);
    return s;
  }

  it("increases co2CollectedMl on each tick", () => {
    const s    = runningState();
    const next = tickGasCollection(s, 15);
    expect(next.co2CollectedMl).toBeGreaterThan(0);
  });

  it("does nothing when status is not running", () => {
    const s    = initialGasCollectionState("guided");
    const next = tickGasCollection(s, 1);
    expect(next.co2CollectedMl).toBe(0);
  });

  it("reaches completion eventually", () => {
    let s = runningState();
    // tick many seconds until complete
    for (let i = 0; i < 2000; i++) {
      if (s.status === "completed") break;
      s = tickGasCollection(s, 1);
    }
    expect(s.status).toBe("completed");
    expect(s.reactionComplete).toBe(true);
  });

  it("collected CO₂ does not exceed theoretical by more than 1%", () => {
    let s = runningState();
    for (let i = 0; i < 2000; i++) {
      if (s.status === "completed") break;
      s = tickGasCollection(s, 1);
    }
    expect(s.co2CollectedMl).toBeLessThanOrEqual(s.theoreticalCo2Ml * 1.01 + 1);
  });
});
