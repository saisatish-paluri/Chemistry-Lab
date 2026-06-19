import { describe, it, expect } from "vitest";
import {
  initialDissolvingState,
  calculateSolubilityLimit,
  conditionLabel,
  setTemperature,
  setGranularity,
  setStirring,
  startDissolving,
  tickDissolveProgress,
  completeDissolvingRate,
  resetDissolving,
} from "@/lib/engine/dissolving-rate-engine";

describe("calculateSolubilityLimit", () => {
  it("sucrose solubility increases with temperature", () => {
    const solubilityAt5 = calculateSolubilityLimit(5);
    const solubilityAt80 = calculateSolubilityLimit(80);
    expect(solubilityAt80).toBeGreaterThan(solubilityAt5);
  });
});

describe("conditionLabel", () => {
  it("formats the label correctly", () => {
    expect(conditionLabel("cold", "coarse", false)).toBe("Cold / Coarse / Unstirred");
    expect(conditionLabel("hot",  "powder", true )).toBe("Hot / Powder / Stirred");
  });
});

describe("initialDissolvingState", () => {
  it("starts with correct defaults", () => {
    const state = initialDissolvingState("guided");
    expect(state.status).toBe("idle");
    expect(state.temperature).toBe("warm");
    expect(state.granularity).toBe("coarse");
    expect(state.stirring).toBe(false);
    expect(state.isDissolving).toBe(false);
    expect(state.dissolveProgress).toBe(0);
    expect(state.dataPoints).toHaveLength(0);
    expect(state.massAdded).toBe(10);
    expect(state.dissolvedMass).toBe(0);
  });
});

describe("setTemperature / setGranularity / setStirring", () => {
  it("updates temperature and solubility limit", () => {
    const state = initialDissolvingState("free");
    const next  = setTemperature(state, "hot");
    expect(next.temperature).toBe("hot");
    expect(next.celsius).toBe(80);
    expect(next.solubilityLimit).toBe(calculateSolubilityLimit(80));
    expect(next.dissolveProgress).toBe(0);
  });

  it("updates granularity", () => {
    const state = initialDissolvingState("free");
    const next  = setGranularity(state, "powder");
    expect(next.granularity).toBe("powder");
  });

  it("updates stirring", () => {
    const state = initialDissolvingState("free");
    const next  = setStirring(state, true);
    expect(next.stirring).toBe(true);
  });
});

describe("startDissolving", () => {
  it("sets isDissolving = true and status to running", () => {
    const state = initialDissolvingState("free");
    const next  = startDissolving(state);
    expect(next.isDissolving).toBe(true);
    expect(next.status).toBe("running");
    expect(next.observations).toHaveLength(1);
  });

  it("marks objective o1 completed", () => {
    const state = initialDissolvingState("free");
    const next  = startDissolving(state);
    const o1    = next.objectives.find((o) => o.id === "o1");
    expect(o1?.completed).toBe(true);
  });
});

describe("tickDissolveProgress", () => {
  it("increments dissolved mass when ticks are processed", () => {
    let state = initialDissolvingState("free");
    state     = setTemperature(state, "hot");
    state     = startDissolving(state);

    const next = tickDissolveProgress(state, 1.0);
    expect(next.dissolvedMass).toBeGreaterThan(0);
    expect(next.dissolveProgress).toBeGreaterThan(0);
  });

  it("does nothing when isDissolving is false", () => {
    const state = initialDissolvingState("free");
    const next  = tickDissolveProgress(state, 1.0);
    expect(next).toBe(state);
  });
});

describe("completeDissolvingRate", () => {
  it("sets status to completed", () => {
    let state = initialDissolvingState("guided");
    state     = completeDissolvingRate(state);
    expect(state.status).toBe("completed");
    expect(state.result).not.toBeNull();
  });

  it("success requires at least 2 data points", () => {
    let state = initialDissolvingState("guided");
    state     = completeDissolvingRate(state);
    expect(state.result?.success).toBe(false);
  });
});

describe("resetDissolving", () => {
  it("returns to initial state", () => {
    let state = initialDissolvingState("guided");
    state     = startDissolving(state);
    state     = resetDissolving(state);
    expect(state.isDissolving).toBe(false);
    expect(state.status).toBe("idle");
    expect(state.dataPoints).toHaveLength(0);
  });
});
