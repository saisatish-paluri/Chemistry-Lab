import { describe, it, expect } from "vitest";
import {
  initialDissolvingState,
  calcDissolveTime,
  conditionLabel,
  setTemperature,
  setGranularity,
  setStirring,
  startDissolving,
  tickDissolveProgress,
  completeDissolvingRate,
  resetDissolving,
} from "@/lib/engine/dissolving-rate-engine";

describe("calcDissolveTime", () => {
  it("baseline: cold/coarse/unstirred = 120 s", () => {
    expect(calcDissolveTime("cold", "coarse", false)).toBe(120);
  });

  it("hot reduces time significantly vs cold", () => {
    const cold = calcDissolveTime("cold", "coarse", false);
    const hot  = calcDissolveTime("hot",  "coarse", false);
    expect(hot).toBeLessThan(cold);
  });

  it("powder reduces time vs coarse at same temp", () => {
    const coarse = calcDissolveTime("warm", "coarse", false);
    const powder = calcDissolveTime("warm", "powder", false);
    expect(powder).toBeLessThan(coarse);
  });

  it("stirring roughly halves the time (within 1 s of rounding)", () => {
    const unstirred = calcDissolveTime("warm", "fine", false);
    const stirred   = calcDissolveTime("warm", "fine", true);
    // The engine rounds independently at each call, so ±1 is acceptable
    expect(stirred).toBeGreaterThanOrEqual(Math.floor(unstirred * 0.5) - 1);
    expect(stirred).toBeLessThanOrEqual(Math.ceil(unstirred * 0.5) + 1);
    expect(stirred).toBeLessThan(unstirred);
  });

  it("fastest condition: hot/powder/stirred", () => {
    const fastest = calcDissolveTime("hot", "powder", true);
    expect(fastest).toBeLessThan(15);
  });

  it("returns a positive integer", () => {
    const t = calcDissolveTime("cold", "fine", true);
    expect(t).toBeGreaterThan(0);
    expect(Number.isInteger(t)).toBe(true);
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
  });
});

describe("setTemperature / setGranularity / setStirring", () => {
  it("updates temperature", () => {
    const state = initialDissolvingState("free");
    const next  = setTemperature(state, "hot");
    expect(next.temperature).toBe("hot");
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
  it("increments progress proportionally to delta", () => {
    let state = initialDissolvingState("free");
    state     = setTemperature(state, "cold");
    state     = startDissolving(state);

    const totalTime = calcDissolveTime("cold", "coarse", false);
    const delta     = totalTime * 0.1;
    const next      = tickDissolveProgress(state, delta);
    expect(next.dissolveProgress).toBeGreaterThan(0);
    expect(next.dissolveProgress).toBeLessThanOrEqual(100);
  });

  it("reaches 100 % and adds a data point", () => {
    let state = initialDissolvingState("free");
    state     = setTemperature(state, "hot");
    state     = setGranularity(state, "powder");
    state     = setStirring(state, true);
    state     = startDissolving(state);

    const totalTime = calcDissolveTime("hot", "powder", true);
    let prev = state;
    for (let i = 0; i < 200; i++) {
      state = tickDissolveProgress(state, totalTime / 10);
      if (state.dataPoints.length > 0) break;
      if (state === prev) break;
      prev = state;
    }

    expect(state.dataPoints.length).toBeGreaterThan(0);
    expect(state.dissolveProgress).toBe(100);
  });

  it("does nothing when isDissolving is false", () => {
    const state = initialDissolvingState("free");
    const next  = tickDissolveProgress(state, 10);
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
