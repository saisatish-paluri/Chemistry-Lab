import { describe, it, expect, beforeEach } from "vitest";
import {
  initialTitrationState,
  addIndicator,
  addTitrant,
  setFlowRate,
  resetTitration,
  buildTitrationResult,
} from "@/lib/engine/titration-engine";
import { calcpH, EQUIVALENCE_VOL } from "@/lib/engine/chemistry";
import type { TitrationState } from "@/lib/engine/types";

describe("calcpH", () => {
  it("returns 7 at equivalence point", () => {
    const pH = calcpH(0.0025, 0.0025, 0.05);
    expect(pH).toBe(7.0);
  });

  it("returns low pH for excess acid", () => {
    const pH = calcpH(0.0025, 0, 0.025);
    expect(pH).toBeCloseTo(1.0, 1);
  });

  it("returns high pH for excess base", () => {
    const pH = calcpH(0.0025, 0.005, 0.075);
    expect(pH).toBeGreaterThan(12);
    expect(pH).toBeLessThanOrEqual(14);
  });

  it("clamps pH to [0, 14]", () => {
    expect(calcpH(0, 0.1, 0.001)).toBeLessThanOrEqual(14);
    expect(calcpH(0.1, 0, 0.001)).toBeGreaterThanOrEqual(0);
  });
});

describe("initialTitrationState", () => {
  it("starts with correct defaults", () => {
    const state = initialTitrationState("guided");
    expect(state.status).toBe("idle");
    expect(state.flask.indicatorAdded).toBe(false);
    expect(state.flask.indicator).toBeNull();
    expect(state.volumeAdded).toBe(0);
    expect(state.burette.volumeRemaining).toBe(50);
    expect(state.burette.stopcockOpen).toBe(false);
    expect(state.endpointReached).toBe(false);
    expect(state.overshot).toBe(false);
    expect(state.equivalenceVolume).toBe(EQUIVALENCE_VOL);
  });

  it("initial pH is ~1 (0.1M HCl 25mL)", () => {
    const state = initialTitrationState("guided");
    expect(state.flask.pH).toBeCloseTo(1.0, 0);
  });
});

describe("addIndicator", () => {
  let state: TitrationState;
  beforeEach(() => { state = initialTitrationState("guided"); });

  it("adds indicator and changes flask color", () => {
    const next = addIndicator(state, "phenolphthalein");
    expect(next.flask.indicatorAdded).toBe(true);
    expect(next.flask.indicator).toBe("phenolphthalein");
    expect(next.flask.color).not.toBe(state.flask.color);
  });

  it("marks add-indicator step completed", () => {
    const next = addIndicator(state, "litmus");
    const step = next.steps.find((s) => s.id === "add-indicator");
    expect(step?.completed).toBe(true);
  });

  it("does not double-add indicator", () => {
    const after1 = addIndicator(state, "phenolphthalein");
    const after2 = addIndicator(after1, "litmus");
    expect(after2.flask.indicator).toBe("phenolphthalein");
  });

  it("creates an observation event", () => {
    const next = addIndicator(state, "phenolphthalein");
    expect(next.observations.length).toBeGreaterThan(0);
    expect(next.observations[0].type).toBe("color-change");
  });

  it("sets status to ready after adding indicator", () => {
    const next = addIndicator(state, "phenolphthalein");
    expect(next.status).toBe("ready");
  });
});

describe("addTitrant", () => {
  let state: TitrationState;
  beforeEach(() => {
    state = addIndicator(initialTitrationState("guided"), "phenolphthalein");
  });

  it("increases volumeAdded and decreases burette", () => {
    const next = addTitrant({ ...state, burette: { ...state.burette, flowRate: 1 as const } });
    expect(next.volumeAdded).toBeCloseTo(1, 5);
    expect(next.burette.volumeRemaining).toBeCloseTo(49, 5);
  });

  it("opens the stopcock on the first addition", () => {
    expect(state.burette.stopcockOpen).toBe(false);
    const next = addTitrant(state);
    expect(next.burette.stopcockOpen).toBe(true);
  });

  it("keeps stopcock open on subsequent additions", () => {
    const s1 = addTitrant(state);
    const s2 = addTitrant(s1);
    expect(s2.burette.stopcockOpen).toBe(true);
  });

  it("pH increases monotonically as NaOH is added", () => {
    let s = state;
    let prevpH = s.flask.pH;
    for (let i = 0; i < 20; i++) {
      s = addTitrant({ ...s, burette: { ...s.burette, flowRate: 1 as const } });
      expect(s.flask.pH).toBeGreaterThanOrEqual(prevpH - 0.01);
      prevpH = s.flask.pH;
    }
  });

  it("updates titration curve on each addition", () => {
    const next = addTitrant({ ...state, burette: { ...state.burette, flowRate: 0.5 as const } });
    expect(next.titrationCurve.length).toBe(2);
    expect(next.titrationCurve[1].v).toBeCloseTo(0.5, 5);
  });

  it("does not add titrant without indicator", () => {
    const bare = initialTitrationState("guided");
    const next = addTitrant(bare);
    expect(next.volumeAdded).toBe(0);
  });

  it("reaches endpoint for phenolphthalein around 25 mL", () => {
    let s: TitrationState = { ...state, burette: { ...state.burette, flowRate: 0.1 as const } };
    let iterations = 0;
    while (s.status !== "completed" && s.status !== "failed" && iterations < 400) {
      s = addTitrant(s);
      iterations++;
    }
    expect(s.endpointReached).toBe(true);
    expect(s.volumeAdded).toBeGreaterThan(24);
    expect(s.volumeAdded).toBeLessThan(32);
  });

  it("closes stopcock when endpoint reached", () => {
    let s: TitrationState = { ...state, burette: { ...state.burette, flowRate: 0.1 as const } };
    while (s.status !== "completed" && s.status !== "failed") {
      s = addTitrant(s);
    }
    expect(s.burette.stopcockOpen).toBe(false);
  });

  it("flags overshot when far past equivalence", () => {
    const nearOvershot: TitrationState = {
      ...state,
      status: "running",
      volumeAdded: 46,
      endpointReached: false,
      flask: { ...state.flask, pH: 13.5, volume: 71, indicatorAdded: true },
      burette: { flowRate: 5 as const, volumeRemaining: 5, stopcockOpen: true },
      titrationCurve: [{ v: 0, pH: 1.0 }, { v: 46, pH: 13.5 }],
      startedAt: Date.now(),
    };
    const after = addTitrant(nearOvershot);
    expect(after.volumeAdded).toBeGreaterThan(50);
    expect(after.overshot).toBe(true);
    expect(after.status).toBe("failed");
  });
});

describe("setFlowRate", () => {
  it("updates the flow rate", () => {
    const state = initialTitrationState("guided");
    const next = setFlowRate(state, 0.5);
    expect(next.burette.flowRate).toBe(0.5);
  });
});

describe("addTitrant — edge cases", () => {
  it("caps volume transfer when flow rate exceeds remaining burette volume", () => {
    const state = addIndicator(initialTitrationState("guided"), "litmus");
    const nearEmpty: typeof state = {
      ...state,
      status: "running",
      volumeAdded: 10,
      burette: { flowRate: 5 as const, volumeRemaining: 2, stopcockOpen: true },
    };
    const next = addTitrant(nearEmpty);
    // Should only add 2 mL (the remaining amount), not 5 mL
    expect(next.volumeAdded).toBeCloseTo(12, 5);
    expect(next.burette.volumeRemaining).toBeCloseTo(0, 5);
  });

  it("does not proceed when experiment is completed", () => {
    const state = addIndicator(initialTitrationState("guided"), "phenolphthalein");
    const done: typeof state = { ...state, status: "completed" as const };
    const next = addTitrant(done);
    expect(next.volumeAdded).toBe(0);
  });

  it("completes near-endpoint step when within 3 mL of equivalence", () => {
    let s = addIndicator(
      { ...initialTitrationState("guided"), burette: { flowRate: 1 as const, volumeRemaining: 50, stopcockOpen: false } },
      "phenolphthalein",
    );
    // Add 23 mL to get within 2 mL of the 25 mL equivalence point
    for (let i = 0; i < 23; i++) {
      s = addTitrant({ ...s, burette: { ...s.burette, flowRate: 1 as const } });
    }
    const nearStep = s.steps.find((step) => step.id === "near-endpoint");
    expect(nearStep?.completed).toBe(true);
  });
});

describe("buildTitrationResult — overshot path", () => {
  it("marks result as failed and score 20 when overshot", () => {
    const base = addIndicator(initialTitrationState("guided"), "phenolphthalein");
    const overshot: typeof base = {
      ...base,
      status: "failed" as const,
      overshot: true,
      endpointReached: false,
      volumeAdded: 55,
    };
    const final = buildTitrationResult(overshot);
    expect(final.result).not.toBeNull();
    expect(final.result?.success).toBe(false);
    expect(final.result?.score).toBe(20);
  });

  it("marks result success=false when experiment failed without endpoint", () => {
    const base = addIndicator(initialTitrationState("guided"), "phenolphthalein");
    const failedNoEndpoint: typeof base = {
      ...base,
      status: "failed" as const,
      overshot: false,
      endpointReached: false,
      volumeAdded: 10,
    };
    const final = buildTitrationResult(failedNoEndpoint);
    expect(final.result?.success).toBe(false);
    expect(final.result?.score).toBe(15);
  });
});

describe("resetTitration", () => {
  it("returns fresh state with stopcock closed", () => {
    const fresh = resetTitration("guided");
    expect(fresh.volumeAdded).toBe(0);
    expect(fresh.flask.indicatorAdded).toBe(false);
    expect(fresh.status).toBe("idle");
    expect(fresh.burette.stopcockOpen).toBe(false);
  });
});

describe("buildTitrationResult", () => {
  it("builds a success result when endpoint reached", () => {
    let s = addIndicator(
      { ...initialTitrationState("guided"), burette: { flowRate: 0.1, volumeRemaining: 50, stopcockOpen: true } },
      "phenolphthalein",
    );
    while (s.status !== "completed" && s.status !== "failed") {
      s = addTitrant(s);
    }
    const final = buildTitrationResult(s);
    expect(final.result).not.toBeNull();
    expect(final.result?.success).toBe(true);
    expect(final.result?.score).toBe(100);
  });

  it("includes precision deviation in result", () => {
    let s = addIndicator(
      { ...initialTitrationState("guided"), burette: { flowRate: 0.1, volumeRemaining: 50, stopcockOpen: true } },
      "phenolphthalein",
    );
    while (s.status !== "completed" && s.status !== "failed") {
      s = addTitrant(s);
    }
    const final = buildTitrationResult(s);
    expect(final.result?.precision).toBeDefined();
    expect(final.result?.precision).toBeGreaterThanOrEqual(0);
  });
});
