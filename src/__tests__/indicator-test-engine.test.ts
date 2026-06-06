import { describe, it, expect } from "vitest";
import {
  initialIndicatorState,
  selectIndicator,
  selectSubstance,
  runTest,
  finishTest,
  completeIndicatorTest,
  resetIndicatorTest,
  getIndicatorColor,
  INDICATORS,
  SUBSTANCES,
} from "@/lib/engine/indicator-test-engine";

describe("INDICATORS", () => {
  it("has exactly 4 indicators", () => {
    expect(Object.keys(INDICATORS)).toHaveLength(4);
  });

  it("turmeric turns red/brick-red in base", () => {
    const ind = INDICATORS.turmeric;
    expect(ind.basicColor).toBe("#dc2626");
    expect(ind.basicLabel).toMatch(/red/i);
  });

  it("red-litmus stays red in acid", () => {
    const ind = INDICATORS["red-litmus"];
    expect(ind.acidColor).toBe("#ef4444");
    expect(ind.acidLabel).toMatch(/red/i);
  });

  it("blue-litmus turns red in acid", () => {
    const ind = INDICATORS["blue-litmus"];
    expect(ind.acidColor).toBe("#ef4444");
    expect(ind.acidLabel).toMatch(/red/i);
  });
});

describe("SUBSTANCES", () => {
  it("has exactly 8 substances", () => {
    expect(Object.keys(SUBSTANCES)).toHaveLength(8);
  });

  it("distilled-water has pH 7 and is neutral", () => {
    expect(SUBSTANCES["distilled-water"].pH).toBe(7.0);
    expect(SUBSTANCES["distilled-water"].classification).toBe("neutral");
  });

  it("vinegar is acidic with pH < 7", () => {
    expect(SUBSTANCES.vinegar.classification).toBe("acidic");
    expect(SUBSTANCES.vinegar.pH).toBeLessThan(7);
  });

  it("ammonia is basic with pH > 7", () => {
    expect(SUBSTANCES.ammonia.classification).toBe("basic");
    expect(SUBSTANCES.ammonia.pH).toBeGreaterThan(7);
  });
});

describe("getIndicatorColor", () => {
  it("turmeric + vinegar (acid) = yellow unchanged", () => {
    const { color, label } = getIndicatorColor("turmeric", "vinegar");
    expect(color).toBe(INDICATORS.turmeric.acidColor);
    expect(label).toBe(INDICATORS.turmeric.acidLabel);
  });

  it("turmeric + baking-soda (base) = red", () => {
    const { color, label } = getIndicatorColor("turmeric", "baking-soda");
    expect(color).toBe(INDICATORS.turmeric.basicColor);
    expect(label).toBe(INDICATORS.turmeric.basicLabel);
  });

  it("cabbage-juice + distilled-water = purple (neutral)", () => {
    const { color } = getIndicatorColor("cabbage-juice", "distilled-water");
    expect(color).toBe(INDICATORS["cabbage-juice"].neutralColor);
  });
});

describe("initialIndicatorState", () => {
  it("starts with null selections and idle status", () => {
    const state = initialIndicatorState("guided");
    expect(state.status).toBe("idle");
    expect(state.selectedIndicator).toBeNull();
    expect(state.selectedSubstance).toBeNull();
    expect(state.testHistory).toHaveLength(0);
    expect(state.result).toBeNull();
  });
});

describe("selectIndicator", () => {
  it("sets selectedIndicator and advances status to setup", () => {
    const state = initialIndicatorState("free");
    const next  = selectIndicator(state, "turmeric");
    expect(next.selectedIndicator).toBe("turmeric");
    expect(next.status).toBe("setup");
    const s1 = next.steps.find((s) => s.id === "s1");
    expect(s1?.completed).toBe(true);
  });
});

describe("selectSubstance", () => {
  it("sets selectedSubstance", () => {
    let state = initialIndicatorState("free");
    state     = selectIndicator(state, "turmeric");
    state     = selectSubstance(state, "vinegar");
    expect(state.selectedSubstance).toBe("vinegar");
    const s2 = state.steps.find((s) => s.id === "s2");
    expect(s2?.completed).toBe(true);
  });
});

describe("runTest", () => {
  it("returns unchanged state if no indicator or substance selected", () => {
    const state = initialIndicatorState("free");
    const next  = runTest(state);
    expect(next).toBe(state);
  });

  it("adds a record to testHistory on valid test", () => {
    let state = initialIndicatorState("free");
    state     = selectIndicator(state, "turmeric");
    state     = selectSubstance(state, "vinegar");
    state     = runTest(state);

    expect(state.testHistory).toHaveLength(1);
    expect(state.testHistory[0].indicator).toBe("turmeric");
    expect(state.testHistory[0].substance).toBe("vinegar");
    expect(state.testHistory[0].classification).toBe("acidic");
    expect(state.status).toBe("running");
  });

  it("sets objective o1 completed on first acidic test", () => {
    let state = initialIndicatorState("guided");
    state     = selectIndicator(state, "red-litmus");
    state     = selectSubstance(state, "lemon-juice");
    state     = runTest(state);
    const o1  = state.objectives.find((o) => o.id === "o1");
    expect(o1?.completed).toBe(true);
  });

  it("sets objective o2 completed on first basic test", () => {
    let state = initialIndicatorState("guided");
    state     = selectIndicator(state, "turmeric");
    state     = selectSubstance(state, "ammonia");
    state     = runTest(state);
    const o2  = state.objectives.find((o) => o.id === "o2");
    expect(o2?.completed).toBe(true);
  });

  it("sets objective o3 when distilled-water tested", () => {
    let state = initialIndicatorState("guided");
    state     = selectIndicator(state, "cabbage-juice");
    state     = selectSubstance(state, "distilled-water");
    state     = runTest(state);
    const o3  = state.objectives.find((o) => o.id === "o3");
    expect(o3?.completed).toBe(true);
  });

  it("adds observation with colour change message", () => {
    let state = initialIndicatorState("free");
    state     = selectIndicator(state, "turmeric");
    state     = selectSubstance(state, "baking-soda");
    state     = runTest(state);
    expect(state.observations[0].message).toMatch(/turmeric/i);
    expect(state.observations[0].type).toBe("color-change");
  });

  it("currentResult reflects the test result", () => {
    let state = initialIndicatorState("free");
    state     = selectIndicator(state, "blue-litmus");
    state     = selectSubstance(state, "vinegar");
    state     = runTest(state);
    expect(state.currentResult).not.toBeNull();
    expect(state.currentResult?.classification).toBe("acidic");
  });
});

describe("finishTest", () => {
  it("clears isTesting flag", () => {
    let state = initialIndicatorState("free");
    state     = selectIndicator(state, "turmeric");
    state     = selectSubstance(state, "vinegar");
    state     = runTest(state);
    state     = finishTest(state);
    expect(state.isTesting).toBe(false);
  });
});

describe("completeIndicatorTest", () => {
  it("sets status to completed", () => {
    const state = completeIndicatorTest(initialIndicatorState("guided"));
    expect(state.status).toBe("completed");
    expect(state.result).not.toBeNull();
  });

  it("success requires at least 3 tests", () => {
    let state = initialIndicatorState("guided");
    state     = completeIndicatorTest(state);
    expect(state.result?.success).toBe(false);

    let state2 = initialIndicatorState("guided");
    for (const substance of ["vinegar", "baking-soda", "distilled-water"] as const) {
      state2 = selectIndicator(state2, "turmeric");
      state2 = selectSubstance(state2, substance);
      state2 = runTest(state2);
    }
    state2 = completeIndicatorTest(state2);
    expect(state2.result?.success).toBe(true);
  });
});

describe("resetIndicatorTest", () => {
  it("returns to initial state", () => {
    let state = initialIndicatorState("guided");
    state     = selectIndicator(state, "turmeric");
    state     = resetIndicatorTest(state);
    expect(state.selectedIndicator).toBeNull();
    expect(state.testHistory).toHaveLength(0);
    expect(state.status).toBe("idle");
  });
});
