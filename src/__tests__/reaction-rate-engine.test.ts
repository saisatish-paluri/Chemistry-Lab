import { describe, it, expect, beforeEach } from "vitest";
import {
  initialReactionRateState,
  setTemperature,
  setConcentration,
  setSurfaceArea,
  startReaction,
  stopReaction,
  tickReaction,
  resetReaction,
  resetReactionFull,
  temperatureFactor,
  concentrationFactor,
  calcRateMultiplier,
  calcProgressDelta,
  BASE_RATE_PCT_PER_SEC,
  SURFACE_AREA_FACTORS,
} from "@/lib/engine/reaction-rate-engine";
import {
  validateStartReaction,
  validateStopReaction,
} from "@/lib/engine/validation";
import type { ReactionRateState } from "@/lib/engine/types";

describe("temperatureFactor", () => {
  it("returns 1.0 at reference temperature (25°C)", () => {
    expect(temperatureFactor(25)).toBeCloseTo(1.0, 5);
  });

  it("doubles every 10°C rise", () => {
    expect(temperatureFactor(35)).toBeCloseTo(2.0, 5);
    expect(temperatureFactor(45)).toBeCloseTo(4.0, 5);
    expect(temperatureFactor(55)).toBeCloseTo(8.0, 4);
  });

  it("halves every 10°C drop", () => {
    expect(temperatureFactor(15)).toBeCloseTo(0.5, 5);
  });
});

describe("concentrationFactor", () => {
  it("returns 1.0 at reference concentration (0.5 M)", () => {
    expect(concentrationFactor(0.5)).toBeCloseTo(1.0, 5);
  });

  it("is proportional to concentration", () => {
    expect(concentrationFactor(1.0)).toBeCloseTo(2.0, 5);
    expect(concentrationFactor(2.0)).toBeCloseTo(4.0, 5);
    expect(concentrationFactor(0.1)).toBeCloseTo(0.2, 5);
  });
});

describe("calcRateMultiplier", () => {
  it("returns product of all factors at reference conditions", () => {
    // 25°C, 0.5M, chips (1.8)
    const rate = calcRateMultiplier(25, 0.5, "chips");
    expect(rate).toBeCloseTo(1.0 * 1.0 * SURFACE_AREA_FACTORS.chips, 5);
  });

  it("powder gives highest rate for same T and C", () => {
    const powder = calcRateMultiplier(25, 0.5, "powder");
    const solid  = calcRateMultiplier(25, 0.5, "solid");
    expect(powder).toBeGreaterThan(solid);
  });

  it("higher temperature gives higher rate (all else equal)", () => {
    const hot  = calcRateMultiplier(65, 0.5, "chips");
    const cold = calcRateMultiplier(25, 0.5, "chips");
    expect(hot).toBeGreaterThan(cold);
  });
});

describe("calcProgressDelta", () => {
  it("calculates correct progress increment", () => {
    const delta = calcProgressDelta(1.0, 1);
    expect(delta).toBeCloseTo(BASE_RATE_PCT_PER_SEC * 1.0 * 1, 5);
  });

  it("scales with rate multiplier", () => {
    const d1 = calcProgressDelta(1.0, 1);
    const d2 = calcProgressDelta(2.0, 1);
    expect(d2).toBeCloseTo(d1 * 2, 5);
  });
});

describe("initialReactionRateState", () => {
  it("sets correct defaults", () => {
    const s = initialReactionRateState("guided");
    expect(s.status).toBe("idle");
    expect(s.temperature).toBe(25);
    expect(s.concentration).toBe(0.5);
    expect(s.surfaceArea).toBe("chips");
    expect(s.progress).toBe(0);
    expect(s.timeElapsed).toBe(0);
    expect(s.result).toBeNull();
  });

  it("pre-computes rate multiplier", () => {
    const s = initialReactionRateState("guided");
    const expected = calcRateMultiplier(25, 0.5, "chips");
    expect(s.rateMultiplier).toBeCloseTo(expected, 5);
  });
});

describe("setTemperature", () => {
  let state: ReactionRateState;
  beforeEach(() => { state = initialReactionRateState("guided"); });

  it("updates temperature and recalculates rate", () => {
    const next = setTemperature(state, 45);
    expect(next.temperature).toBe(45);
    expect(next.rateMultiplier).toBeCloseTo(calcRateMultiplier(45, 0.5, "chips"), 5);
  });

  it("clamps to 15–80°C range", () => {
    expect(setTemperature(state, 5).temperature).toBe(15);
    expect(setTemperature(state, 100).temperature).toBe(80);
  });

  it("adds observation when running", () => {
    const running = { ...state, status: "running" as const };
    const next = setTemperature(running, 50);
    expect(next.observations.length).toBeGreaterThan(0);
    expect(next.observations[0].type).toBe("rate-change");
  });
});

describe("setConcentration", () => {
  let state: ReactionRateState;
  beforeEach(() => { state = initialReactionRateState("guided"); });

  it("updates concentration", () => {
    const next = setConcentration(state, 1.5);
    expect(next.concentration).toBe(1.5);
  });

  it("clamps to 0.1–2.0 M", () => {
    expect(setConcentration(state, 0.0).concentration).toBe(0.1);
    expect(setConcentration(state, 3.0).concentration).toBe(2.0);
  });

  it("recalculates rate multiplier", () => {
    const next = setConcentration(state, 1.0);
    expect(next.rateMultiplier).toBeCloseTo(calcRateMultiplier(25, 1.0, "chips"), 5);
  });
});

describe("setSurfaceArea", () => {
  it("updates surface area and rate", () => {
    const state = initialReactionRateState("guided");
    const next = setSurfaceArea(state, "powder");
    expect(next.surfaceArea).toBe("powder");
    expect(next.rateMultiplier).toBeCloseTo(calcRateMultiplier(25, 0.5, "powder"), 5);
  });

  it("blocks change while running", () => {
    const state = { ...initialReactionRateState("guided"), status: "running" as const };
    const next = setSurfaceArea(state, "powder");
    expect(next.surfaceArea).toBe("chips"); // unchanged
  });
});

describe("startReaction", () => {
  let state: ReactionRateState;
  beforeEach(() => { state = initialReactionRateState("guided"); });

  it("transitions to running", () => {
    const next = startReaction(state);
    expect(next.status).toBe("running");
  });

  it("resets progress to 0", () => {
    const next = startReaction({ ...state, progress: 50 });
    expect(next.progress).toBe(0);
  });

  it("adds initial observation", () => {
    const next = startReaction(state);
    expect(next.observations.length).toBeGreaterThan(0);
    expect(next.observations[0].type).toBe("reaction-start");
  });

  it("marks configure objective complete", () => {
    const next = startReaction(state);
    const obj = next.objectives.find((o) => o.id === "configure");
    expect(obj?.completed).toBe(true);
  });
});

describe("validateStartReaction", () => {
  it("returns null when ready to start", () => {
    expect(validateStartReaction(initialReactionRateState("guided"))).toBeNull();
  });

  it("returns error if already running", () => {
    const s = { ...initialReactionRateState("guided"), status: "running" as const };
    expect(validateStartReaction(s)?.code).toBe("ALREADY_RUNNING");
  });

  it("returns error if completed", () => {
    const s = { ...initialReactionRateState("guided"), status: "completed" as const };
    expect(validateStartReaction(s)?.code).toBe("EXPERIMENT_DONE");
  });
});

describe("tickReaction", () => {
  it("increases progress", () => {
    const s = startReaction(initialReactionRateState("guided"));
    const next = tickReaction(s, 1);
    expect(next.progress).toBeGreaterThan(0);
    expect(next.timeElapsed).toBe(1);
  });

  it("completes at 100% progress", () => {
    let s = startReaction(initialReactionRateState("guided"));
    // Force high rate to complete quickly
    s = { ...s, rateMultiplier: 1000 };
    s = tickReaction(s, 1);
    expect(s.status).toBe("completed");
    expect(s.progress).toBe(100);
    expect(s.result).not.toBeNull();
  });

  it("adds milestone observations at 25/50/75%", () => {
    let s = startReaction(initialReactionRateState("guided"));
    // Artificially put at just below 25%
    s = { ...s, progress: 24 };
    s = { ...s, rateMultiplier: 2.0 }; // will jump past 25%
    const next = tickReaction(s, 1);
    const hasRateChange = next.observations.some((o) => o.type === "rate-change");
    expect(hasRateChange).toBe(true);
  });

  it("does nothing if not running", () => {
    const s = initialReactionRateState("guided");
    const next = tickReaction(s, 1);
    expect(next.progress).toBe(0);
    expect(next.timeElapsed).toBe(0);
  });
});

describe("stopReaction", () => {
  it("pauses a running reaction", () => {
    const s = startReaction(initialReactionRateState("guided"));
    const next = stopReaction(s);
    expect(next.status).toBe("setup");
  });

  it("validates not running returns error", () => {
    const s = initialReactionRateState("guided");
    expect(validateStopReaction(s)?.code).toBe("NOT_RUNNING");
  });
});

describe("resetReaction", () => {
  it("resets progress but preserves settings", () => {
    let s = setTemperature(initialReactionRateState("guided"), 60);
    s = startReaction(s);
    s = tickReaction(s, 10);
    const reset = resetReaction(s);
    expect(reset.progress).toBe(0);
    expect(reset.timeElapsed).toBe(0);
    expect(reset.temperature).toBe(60); // preserved
    expect(reset.status).toBe("setup");
  });
});

describe("resetReactionFull", () => {
  it("returns a completely fresh state", () => {
    const s = resetReactionFull("free");
    expect(s.temperature).toBe(25);
    expect(s.concentration).toBe(0.5);
    expect(s.surfaceArea).toBe("chips");
    expect(s.mode).toBe("free");
  });
});
