import { describe, it, expect } from "vitest";
import {
  initialDensityState,
  selectMaterial,
  dropMaterial,
  settleAnimation,
  completeDensity,
  resetDensity,
  DENSITY_MATERIALS,
  ORDERED_MATERIALS,
} from "@/lib/engine/density-floats-sinks-engine";

describe("initialDensityState", () => {
  it("starts with correct defaults", () => {
    const state = initialDensityState("guided");
    expect(state.status).toBe("idle");
    expect(state.selectedMaterial).toBeNull();
    expect(state.testedMaterials).toHaveLength(0);
    expect(state.observations).toHaveLength(0);
    expect(state.result).toBeNull();
  });
});

describe("DENSITY_MATERIALS", () => {
  it("has 8 materials", () => {
    expect(ORDERED_MATERIALS).toHaveLength(8);
  });

  it("wood has density < 1", () => {
    expect(DENSITY_MATERIALS.wood.density).toBeLessThan(1.0);
  });

  it("steel has density > 1", () => {
    expect(DENSITY_MATERIALS.steel.density).toBeGreaterThan(1.0);
  });

  it("ice density is 0.92", () => {
    expect(DENSITY_MATERIALS.ice.density).toBeCloseTo(0.92);
  });
});

describe("selectMaterial", () => {
  it("sets selectedMaterial and changes status to ready", () => {
    const state = initialDensityState("free");
    const next  = selectMaterial(state, "wood");
    expect(next.selectedMaterial).toBe("wood");
    expect(next.status).toBe("ready");
    expect(next.isDropping).toBe(false);
  });
});

describe("dropMaterial", () => {
  it("records a floating observation for wood", () => {
    let state = initialDensityState("guided");
    state     = selectMaterial(state, "wood");
    state     = dropMaterial(state);

    expect(state.testedMaterials).toContain("wood");
    expect(state.observations).toHaveLength(1);
    expect(state.observations[0].message).toMatch(/floats/i);
    expect(state.isDropping).toBe(true);
    expect(state.status).toBe("running");
  });

  it("records a sinking observation for steel", () => {
    let state = initialDensityState("guided");
    state     = selectMaterial(state, "steel");
    state     = dropMaterial(state);

    expect(state.observations[0].message).toMatch(/sinks/i);
    expect(state.observations[0].severity).toBe("info");
  });

  it("does not double-count already-tested material", () => {
    let state = initialDensityState("free");
    state     = selectMaterial(state, "wood");
    state     = dropMaterial(state);
    const countAfterFirst = state.testedMaterials.length;

    state = selectMaterial(state, "wood");
    state = dropMaterial(state);
    expect(state.testedMaterials.length).toBe(countAfterFirst);
  });

  it("returns unchanged state when no material selected", () => {
    const state = initialDensityState("free");
    const next  = dropMaterial(state);
    expect(next).toBe(state);
  });

  it("completes objective o1 after 4 tests", () => {
    let state = initialDensityState("guided");
    const four: (typeof ORDERED_MATERIALS)[number][] = ["wood", "ice", "plastic", "steel"];
    for (const m of four) {
      state = selectMaterial(state, m);
      state = dropMaterial(state);
    }
    const o1 = state.objectives.find((o) => o.id === "o1");
    expect(o1?.completed).toBe(true);
  });

  it("completes objective o2 when ≥2 floating materials tested", () => {
    let state = initialDensityState("guided");
    state = selectMaterial(state, "wood"); state = dropMaterial(state);
    state = selectMaterial(state, "ice");  state = dropMaterial(state);
    const o2 = state.objectives.find((o) => o.id === "o2");
    expect(o2?.completed).toBe(true);
  });
});

describe("settleAnimation", () => {
  it("marks settling complete", () => {
    let state = initialDensityState("free");
    state     = selectMaterial(state, "stone");
    state     = dropMaterial(state);
    state     = settleAnimation(state);
    expect(state.isDropping).toBe(false);
    expect(state.isSettled).toBe(true);
  });
});

describe("completeDensity", () => {
  it("marks status completed", () => {
    let state = initialDensityState("guided");
    state     = completeDensity(state);
    expect(state.status).toBe("completed");
    expect(state.result).not.toBeNull();
  });

  it("success requires at least 4 tested materials", () => {
    let state = initialDensityState("guided");
    state     = completeDensity(state);
    expect(state.result?.success).toBe(false);

    let state2 = initialDensityState("guided");
    for (const m of ["wood", "ice", "plastic", "steel"] as const) {
      state2 = selectMaterial(state2, m);
      state2 = dropMaterial(state2);
    }
    state2 = completeDensity(state2);
    expect(state2.result?.success).toBe(true);
  });

  it("score is proportional to number of tested materials", () => {
    let state = initialDensityState("guided");
    for (const m of ORDERED_MATERIALS) {
      state = selectMaterial(state, m);
      state = dropMaterial(state);
    }
    state = completeDensity(state);
    expect(state.result?.score).toBe(100);
  });
});

describe("resetDensity", () => {
  it("returns to initial state", () => {
    let state = initialDensityState("guided");
    state     = selectMaterial(state, "wood");
    state     = dropMaterial(state);
    state     = resetDensity(state);
    expect(state.testedMaterials).toHaveLength(0);
    expect(state.status).toBe("idle");
  });
});
