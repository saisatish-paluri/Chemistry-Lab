import { describe, it, expect, beforeEach } from "vitest";
import {
  initialFlameTestState,
  lightBurner,
  selectSample,
  dipLoop,
  performTest,
  completeTest,
  cleanLoop,
  completeFlameTest,
  resetFlameTest,
  FLAME_SAMPLES,
} from "@/lib/engine/flame-test-engine";
import {
  validateLightBurner,
  validateDipLoop,
  validatePerformTest,
  validateCompleteFlameTest,
} from "@/lib/engine/validation";
import type { FlameTestState } from "@/lib/engine/types";

describe("initialFlameTestState", () => {
  it("starts with correct defaults", () => {
    const state = initialFlameTestState("guided");
    expect(state.status).toBe("idle");
    expect(state.flameLit).toBe(false);
    expect(state.selectedSample).toBeNull();
    expect(state.loopDipped).toBe(false);
    expect(state.loopClean).toBe(true);
    expect(state.contaminated).toBe(false);
    expect(state.testHistory).toHaveLength(0);
    expect(state.result).toBeNull();
  });

  it("sets mode correctly", () => {
    const s = initialFlameTestState("free");
    expect(s.mode).toBe("free");
  });
});

describe("lightBurner", () => {
  let state: FlameTestState;
  beforeEach(() => { state = initialFlameTestState("guided"); });

  it("lights the burner and transitions to setup", () => {
    const next = lightBurner(state);
    expect(next.flameLit).toBe(true);
    expect(next.status).toBe("setup");
  });

  it("adds an observation when lit", () => {
    const next = lightBurner(state);
    expect(next.observations.length).toBeGreaterThan(0);
    expect(next.observations[0].type).toBe("reaction-start");
  });

  it("marks the light-burner step completed", () => {
    const next = lightBurner(state);
    const step = next.steps.find((s) => s.id === "light-burner");
    expect(step?.completed).toBe(true);
  });

  it("does not re-light if already lit", () => {
    const after1 = lightBurner(state);
    const obsCount = after1.observations.length;
    const after2 = lightBurner(after1);
    expect(after2.observations.length).toBe(obsCount); // no new obs
  });
});

describe("validateLightBurner", () => {
  it("returns null when burner is not lit", () => {
    const state = initialFlameTestState("guided");
    expect(validateLightBurner(state)).toBeNull();
  });

  it("returns error if already lit", () => {
    const state = lightBurner(initialFlameTestState("guided"));
    const err = validateLightBurner(state);
    expect(err).not.toBeNull();
    expect(err?.code).toBe("BURNER_LIT");
  });
});

describe("selectSample", () => {
  let litState: FlameTestState;
  beforeEach(() => { litState = lightBurner(initialFlameTestState("guided")); });

  it("selects a sample", () => {
    const next = selectSample(litState, "lithium-chloride");
    expect(next.selectedSample).toBe("lithium-chloride");
  });

  it("does not select if burner is not lit", () => {
    const dark = initialFlameTestState("guided");
    const next = selectSample(dark, "lithium-chloride");
    expect(next.selectedSample).toBeNull();
  });

  it("resets loopDipped when sample changes", () => {
    const s1 = selectSample(litState, "lithium-chloride");
    const s2 = dipLoop(s1);
    expect(s2.loopDipped).toBe(true);
    const s3 = selectSample(s2, "sodium-chloride");
    expect(s3.loopDipped).toBe(false);
  });
});

describe("dipLoop", () => {
  let readyState: FlameTestState;
  beforeEach(() => {
    readyState = selectSample(lightBurner(initialFlameTestState("guided")), "lithium-chloride");
  });

  it("dips loop and marks loopDipped = true", () => {
    const next = dipLoop(readyState);
    expect(next.loopDipped).toBe(true);
    expect(next.status).toBe("ready");
  });

  it("adds observation on dip", () => {
    const prev = readyState.observations.length;
    const next = dipLoop(readyState);
    expect(next.observations.length).toBeGreaterThan(prev);
  });

  it("flags contamination if loop not clean between tests", () => {
    // Simulate: dip, test, then re-dip without cleaning
    let s = dipLoop(readyState);
    s = performTest(s);
    s = completeTest(s); // now loopClean = false
    s = selectSample(s, "sodium-chloride");
    // don't clean loop
    const next = dipLoop(s);
    expect(next.contaminated).toBe(true);
  });
});

describe("validateDipLoop", () => {
  it("returns null when conditions are met", () => {
    const s = selectSample(lightBurner(initialFlameTestState("guided")), "lithium-chloride");
    expect(validateDipLoop(s)).toBeNull();
  });

  it("returns error if no sample selected", () => {
    const s = lightBurner(initialFlameTestState("guided"));
    const err = validateDipLoop(s);
    expect(err?.code).toBe("NO_SAMPLE");
  });

  it("returns error if burner not lit", () => {
    const s = initialFlameTestState("guided");
    const err = validateDipLoop({ ...s, selectedSample: "lithium-chloride" });
    expect(err?.code).toBe("NO_BURNER");
  });

  it("returns error if already dipped", () => {
    const s0 = selectSample(lightBurner(initialFlameTestState("guided")), "lithium-chloride");
    const s1 = dipLoop(s0);
    const err = validateDipLoop(s1);
    expect(err?.code).toBe("ALREADY_DIPPED");
  });
});

describe("performTest", () => {
  let dippedState: FlameTestState;
  beforeEach(() => {
    dippedState = dipLoop(selectSample(lightBurner(initialFlameTestState("guided")), "lithium-chloride"));
  });

  it("transitions to running", () => {
    const next = performTest(dippedState);
    expect(next.status).toBe("running");
  });

  it("sets the correct flame color for Li+", () => {
    const next = performTest(dippedState);
    expect(next.currentFlameColor).toBe(FLAME_SAMPLES["lithium-chloride"].flameColor);
  });

  it("creates a color-change observation", () => {
    const next = performTest(dippedState);
    const obsTypes = next.observations.map((o) => o.type);
    expect(obsTypes).toContain("color-change");
  });

  it("requires loop to be dipped", () => {
    const s = selectSample(lightBurner(initialFlameTestState("guided")), "lithium-chloride");
    const next = performTest(s); // loopDipped = false
    expect(next.status).not.toBe("running");
  });
});

describe("validatePerformTest", () => {
  it("returns null when ready", () => {
    const s = dipLoop(selectSample(lightBurner(initialFlameTestState("guided")), "lithium-chloride"));
    expect(validatePerformTest(s)).toBeNull();
  });

  it("returns error if loop not dipped", () => {
    const s = selectSample(lightBurner(initialFlameTestState("guided")), "lithium-chloride");
    expect(validatePerformTest(s)?.code).toBe("NO_SAMPLE");
  });
});

describe("completeTest", () => {
  function runOneTest(sampleId: FlameTestState["selectedSample"]): FlameTestState {
    let s = lightBurner(initialFlameTestState("guided"));
    s = selectSample(s, sampleId!);
    s = dipLoop(s);
    s = performTest(s);
    return completeTest(s);
  }

  it("records test in history", () => {
    const s = runOneTest("lithium-chloride");
    expect(s.testHistory).toHaveLength(1);
    expect(s.testHistory[0].sampleId).toBe("lithium-chloride");
  });

  it("resets loopDipped and clears flame color", () => {
    const s = runOneTest("sodium-chloride");
    expect(s.loopDipped).toBe(false);
    expect(s.currentFlameColor).toBeNull();
  });

  it("sets loopClean to false after test (needs cleaning)", () => {
    const s = runOneTest("potassium-chloride");
    expect(s.loopClean).toBe(false);
  });

  it("transitions status back to setup", () => {
    const s = runOneTest("barium-chloride");
    expect(s.status).toBe("setup");
  });
});

describe("cleanLoop", () => {
  it("resets loopClean to true", () => {
    let s = lightBurner(initialFlameTestState("guided"));
    s = { ...s, loopClean: false };
    const next = cleanLoop(s);
    expect(next.loopClean).toBe(true);
    expect(next.contaminated).toBe(false);
  });

  it("does not clean if already clean", () => {
    const s = lightBurner(initialFlameTestState("guided"));
    const prev = s.observations.length;
    const next = cleanLoop(s); // already clean
    expect(next.observations.length).toBe(prev);
  });

  it("marks clean-between objective completed", () => {
    let s = lightBurner(initialFlameTestState("guided"));
    s = { ...s, loopClean: false };
    const next = cleanLoop(s);
    const obj = next.objectives.find((o) => o.id === "clean-between");
    expect(obj?.completed).toBe(true);
  });
});

describe("completeFlameTest", () => {
  it("requires at least one test", () => {
    const s = lightBurner(initialFlameTestState("guided"));
    const err = validateCompleteFlameTest(s);
    expect(err?.code).toBe("NO_TESTS");
  });

  it("scores higher with more unique samples", () => {
    function doTest(base: FlameTestState, id: FlameTestState["selectedSample"]): FlameTestState {
      let s = selectSample(base, id!);
      s = dipLoop(s);
      s = performTest(s);
      s = completeTest(s);
      s = cleanLoop(s);
      return s;
    }

    let s = lightBurner(initialFlameTestState("guided"));
    s = doTest(s, "lithium-chloride");
    s = doTest(s, "sodium-chloride");
    s = doTest(s, "potassium-chloride");
    s = doTest(s, "barium-chloride");

    const final = completeFlameTest(s);
    expect(final.result).not.toBeNull();
    expect(final.result?.success).toBe(true);
    expect(final.result?.score).toBe(100); // 4+ unique samples
  });

  it("sets status to completed", () => {
    let s = lightBurner(initialFlameTestState("guided"));
    s = selectSample(s, "lithium-chloride");
    s = dipLoop(s);
    s = performTest(s);
    s = completeTest(s);
    const final = completeFlameTest(s);
    expect(final.status).toBe("completed");
  });

  it("includes explanation in result", () => {
    let s = lightBurner(initialFlameTestState("guided"));
    s = selectSample(s, "sodium-chloride");
    s = dipLoop(s);
    s = performTest(s);
    s = completeTest(s);
    const final = completeFlameTest(s);
    expect(final.result?.explanation).toContain("electron");
  });
});

describe("resetFlameTest", () => {
  it("returns fresh state", () => {
    const s = resetFlameTest("free");
    expect(s.status).toBe("idle");
    expect(s.flameLit).toBe(false);
    expect(s.testHistory).toHaveLength(0);
    expect(s.mode).toBe("free");
  });
});

describe("FLAME_SAMPLES data", () => {
  it("has 7 samples", () => {
    expect(Object.keys(FLAME_SAMPLES)).toHaveLength(7);
  });

  it("each sample has a valid hex flame color", () => {
    Object.values(FLAME_SAMPLES).forEach((s) => {
      expect(s.flameColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  it("sodium is golden yellow (brightest)", () => {
    expect(FLAME_SAMPLES["sodium-chloride"].colorName).toMatch(/[Yy]ellow/);
  });
});
