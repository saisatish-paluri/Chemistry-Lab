import { describe, it, expect } from "vitest";
import {
  initialDiffusionLiquidsState,
  selectSolute,
  setTemperature,
  setStirringSpeed,
  addDroplet,
  tickDiffusionLiquids,
  getDiffusionCoefficient,
} from "../lib/engine/diffusion-liquids-engine";

describe("Diffusion in Liquids Engine", () => {
  it("initializes state correctly", () => {
    const state = initialDiffusionLiquidsState("guided");
    expect(state.status).toBe("setup");
    expect(state.temperature).toBe(20);
    expect(state.stirringSpeed).toBe(0);
    expect(state.diffusionProgress).toBe(0);
  });

  it("calculates correct solute diffusion coefficients", () => {
    // KMnO4 at 25C without stirring
    const d1 = getDiffusionCoefficient("kmno4", 25, 0);
    // KMnO4 at 75C without stirring (should be higher)
    const d2 = getDiffusionCoefficient("kmno4", 75, 0);
    expect(d2).toBeGreaterThan(d1);

    // Food dye is larger, should be slower than KMnO4
    const dDye = getDiffusionCoefficient("dye", 25, 0);
    expect(dDye).toBeLessThan(d1);
  });

  it("applies stirring speed factor", () => {
    const d1 = getDiffusionCoefficient("kmno4", 25, 0);
    const d2 = getDiffusionCoefficient("kmno4", 25, 300);
    expect(d2).toBeGreaterThan(d1);
  });

  it("advances progress on tick", () => {
    let state = initialDiffusionLiquidsState("guided");
    state = selectSolute(state, "kmno4");
    state = addDroplet(state);
    expect(state.status).toBe("running");

    const next = tickDiffusionLiquids(state, 1.0);
    expect(next.diffusionProgress).toBeGreaterThan(0);
    expect(next.elapsedTime).toBe(1.0);
  });
});
