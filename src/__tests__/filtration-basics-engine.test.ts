import { describe, it, expect } from "vitest";
import {
  initialFiltrationState,
  addWater,
  tickMixProgress,
  setupFilter,
  startPouring,
  tickFilterProgress,
  completeFiltration,
  resetFiltration,
  DEFAULT_SAND_G,
  DEFAULT_SALT_G,
  DEFAULT_WATER_ML,
} from "@/lib/engine/filtration-basics-engine";

describe("initialFiltrationState", () => {
  it("starts at setup stage with correct amounts", () => {
    const state = initialFiltrationState("guided");
    expect(state.stage).toBe("setup");
    expect(state.status).toBe("setup");
    expect(state.sandGrams).toBe(DEFAULT_SAND_G);
    expect(state.saltGrams).toBe(DEFAULT_SALT_G);
    expect(state.waterMl).toBe(DEFAULT_WATER_ML);
    expect(state.mixProgress).toBe(0);
    expect(state.filterProgress).toBe(0);
    expect(state.filtrateVolume).toBe(0);
    expect(state.result).toBeNull();
  });
});

describe("addWater", () => {
  it("advances stage to mixing", () => {
    const state = initialFiltrationState("free");
    const next  = addWater(state);
    expect(next.stage).toBe("mixing");
    expect(next.status).toBe("running");
    expect(next.observations).toHaveLength(1);
    expect(next.observations[0].message).toMatch(/water/i);
  });

  it("does nothing if stage is not setup", () => {
    let state = initialFiltrationState("free");
    state     = addWater(state);
    const again = addWater(state);
    expect(again.stage).toBe("mixing");
  });
});

describe("tickMixProgress", () => {
  it("advances mix progress", () => {
    let state = initialFiltrationState("free");
    state     = addWater(state);
    const next = tickMixProgress(state, 2);
    expect(next.mixProgress).toBeGreaterThan(0);
    expect(next.mixProgress).toBeLessThanOrEqual(1);
  });

  it("transitions to mixed stage at 100%", () => {
    let state = initialFiltrationState("guided");
    state     = addWater(state);
    state     = tickMixProgress(state, 10);
    expect(state.stage).toBe("mixed");
    expect(state.mixProgress).toBe(1);
    const o1 = state.objectives.find((o) => o.id === "o1");
    expect(o1?.completed).toBe(true);
  });

  it("does nothing when not in mixing stage", () => {
    const state = initialFiltrationState("free");
    const next  = tickMixProgress(state, 2);
    expect(next.mixProgress).toBe(0);
  });
});

describe("setupFilter", () => {
  it("advances to pouring stage", () => {
    let state = initialFiltrationState("free");
    state     = addWater(state);
    state     = tickMixProgress(state, 10);
    state     = setupFilter(state);
    expect(state.stage).toBe("pouring");
    expect(state.observations[0].message).toMatch(/funnel|filter/i);
  });

  it("does nothing if not in mixed stage", () => {
    const state = initialFiltrationState("free");
    const next  = setupFilter(state);
    expect(next.stage).toBe("setup");
  });
});

describe("startPouring", () => {
  it("transitions pouring to filtering", () => {
    let state = initialFiltrationState("free");
    state     = addWater(state);
    state     = tickMixProgress(state, 10);
    state     = setupFilter(state);
    state     = startPouring(state);
    expect(state.stage).toBe("filtering");
  });
});

describe("tickFilterProgress", () => {
  it("advances filter progress and collects filtrate", () => {
    let state = initialFiltrationState("free");
    state     = addWater(state);
    state     = tickMixProgress(state, 10);
    state     = setupFilter(state);
    state     = startPouring(state);
    const next = tickFilterProgress(state, 4);
    expect(next.filterProgress).toBeGreaterThan(0);
    expect(next.filtrateVolume).toBeGreaterThan(0);
  });

  it("reaches complete stage at 100%", () => {
    let state = initialFiltrationState("guided");
    state     = addWater(state);
    state     = tickMixProgress(state, 10);
    state     = setupFilter(state);
    state     = startPouring(state);
    state     = tickFilterProgress(state, 100);
    expect(state.stage).toBe("complete");
    expect(state.filterProgress).toBe(1);
    expect(state.filtrateVolume).toBeGreaterThan(0);
    expect(state.filtrateVolume).toBeLessThanOrEqual(DEFAULT_WATER_ML);
  });

  it("filtrate is close to waterMl (95% passes through)", () => {
    let state = initialFiltrationState("guided");
    state     = addWater(state);
    state     = tickMixProgress(state, 10);
    state     = setupFilter(state);
    state     = startPouring(state);
    state     = tickFilterProgress(state, 100);
    expect(state.filtrateVolume).toBeCloseTo(DEFAULT_WATER_ML * 0.95, 0);
  });
});

describe("completeFiltration", () => {
  it("sets status to completed", () => {
    const state = completeFiltration(initialFiltrationState("guided"));
    expect(state.status).toBe("completed");
    expect(state.result).not.toBeNull();
  });

  it("score is 100 when filtration is complete", () => {
    let state = initialFiltrationState("guided");
    state     = addWater(state);
    state     = tickMixProgress(state, 10);
    state     = setupFilter(state);
    state     = startPouring(state);
    state     = tickFilterProgress(state, 100);
    state     = completeFiltration(state);
    expect(state.result?.score).toBe(100);
    expect(state.result?.success).toBe(true);
  });
});

describe("resetFiltration", () => {
  it("resets all state back to initial", () => {
    let state = initialFiltrationState("guided");
    state     = addWater(state);
    state     = resetFiltration(state);
    expect(state.stage).toBe("setup");
    expect(state.status).toBe("setup");
    expect(state.mixProgress).toBe(0);
    expect(state.observations).toHaveLength(0);
  });
});
