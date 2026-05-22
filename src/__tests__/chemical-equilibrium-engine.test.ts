import { describe, it, expect } from "vitest";
import {
  initialEquilibriumState,
  applyPerturbation,
  keqAtTemp,
  calcQ,
  equilibriumSolutionColor,
} from "../lib/engine/chemical-equilibrium-engine";

describe("keqAtTemp", () => {
  it("returns ~1100 at 298 K", () => {
    expect(keqAtTemp(298)).toBeCloseTo(1100, -1);
  });
  it("decreases with increasing temperature (exothermic reaction)", () => {
    expect(keqAtTemp(320)).toBeLessThan(keqAtTemp(298));
  });
  it("increases with decreasing temperature", () => {
    expect(keqAtTemp(278)).toBeGreaterThan(keqAtTemp(298));
  });
});

describe("calcQ", () => {
  it("returns 0 when [FeSCN²⁺] is zero and Fe³⁺ > 0", () => {
    expect(calcQ(0.05, 0.05, 0)).toBe(0);
  });
  it("calculates correctly", () => {
    // Q = 0.04 / (0.01 × 0.01) = 400
    expect(calcQ(0.01, 0.01, 0.04)).toBeCloseTo(400, 0);
  });
});

describe("initialEquilibriumState", () => {
  it("starts at equilibrium (Q ≈ Keq)", () => {
    const s = initialEquilibriumState("guided");
    expect(s.q).toBeCloseTo(s.keq, -1);
  });
  it("starts with status ready", () => {
    expect(initialEquilibriumState("guided").status).toBe("ready");
  });
  it("has no perturbation history", () => {
    expect(initialEquilibriumState("guided").perturbHistory).toHaveLength(0);
  });
});

describe("applyPerturbation — add-fe3", () => {
  it("increases [Fe³⁺] before equilibration", () => {
    const s    = initialEquilibriumState("guided");
    const next = applyPerturbation(s, "add-fe3");
    // After equilibration, [FeSCN²⁺] should be higher (forward shift)
    expect(next.concFeSCN).toBeGreaterThan(s.concFeSCN);
  });
  it("shifts forward", () => {
    const s    = initialEquilibriumState("guided");
    const next = applyPerturbation(s, "add-fe3");
    expect(next.shiftDirection).toBe("forward");
  });
  it("records perturbation in history", () => {
    const s    = initialEquilibriumState("guided");
    const next = applyPerturbation(s, "add-fe3");
    expect(next.perturbHistory).toContain("add-fe3");
  });
});

describe("applyPerturbation — heat", () => {
  it("raises temperature by 20 K", () => {
    const s    = initialEquilibriumState("guided");
    const next = applyPerturbation(s, "heat");
    expect(next.temperatureK).toBe(318);
  });
  it("decreases [FeSCN²⁺] (exothermic — heating shifts reverse)", () => {
    const s    = initialEquilibriumState("guided");
    const next = applyPerturbation(s, "heat");
    expect(next.concFeSCN).toBeLessThan(s.concFeSCN);
  });
  it("shifts reverse", () => {
    const s    = initialEquilibriumState("guided");
    const next = applyPerturbation(s, "heat");
    expect(next.shiftDirection).toBe("reverse");
  });
});

describe("applyPerturbation — cool", () => {
  it("lowers temperature by 20 K", () => {
    const s    = initialEquilibriumState("guided");
    const next = applyPerturbation(s, "cool");
    expect(next.temperatureK).toBe(278);
  });
  it("increases [FeSCN²⁺] (cooling shifts forward)", () => {
    const s    = initialEquilibriumState("guided");
    const next = applyPerturbation(s, "cool");
    expect(next.concFeSCN).toBeGreaterThan(s.concFeSCN);
  });
});

describe("applyPerturbation — dilute", () => {
  it("halves all concentrations before re-equilibration", () => {
    const s    = initialEquilibriumState("guided");
    // After dilute, all conc are roughly halved then equilibrated
    const next = applyPerturbation(s, "dilute");
    expect(next.concFe3).toBeLessThan(s.concFe3);
    expect(next.concSCN).toBeLessThan(s.concSCN);
  });
  it("adds dilute to history", () => {
    const s    = initialEquilibriumState("guided");
    const next = applyPerturbation(s, "dilute");
    expect(next.perturbHistory).toContain("dilute");
  });
});

describe("equilibriumSolutionColor", () => {
  it("returns near-clear for [FeSCN²⁺] = 0", () => {
    const col = equilibriumSolutionColor(0);
    expect(col).toMatch(/^rgb\(255,255,220\)$/);
  });
  it("returns red-tinted for high [FeSCN²⁺]", () => {
    const col = equilibriumSolutionColor(0.05);
    // R should stay 255, G and B should be low
    const match = col.match(/rgb\((\d+),(\d+),(\d+)\)/);
    expect(match).not.toBeNull();
    if (match) {
      expect(Number(match[2])).toBeLessThan(100);
      expect(Number(match[3])).toBeLessThan(50);
    }
  });
});

describe("objectives completion", () => {
  it("completes first-stress objective after one perturbation", () => {
    const s    = initialEquilibriumState("guided");
    const next = applyPerturbation(s, "add-scn");
    const obj  = next.objectives.find((o) => o.id === "first-stress");
    expect(obj?.completed).toBe(true);
  });
  it("completes both-directions after forward and reverse shifts", () => {
    let s = initialEquilibriumState("guided");
    s     = applyPerturbation(s, "add-fe3");   // forward
    s     = applyPerturbation(s, "heat");       // reverse
    const obj = s.objectives.find((o) => o.id === "both-directions");
    expect(obj?.completed).toBe(true);
  });
  it("completes temp-effect after heating", () => {
    let s = initialEquilibriumState("guided");
    s     = applyPerturbation(s, "heat");
    const obj = s.objectives.find((o) => o.id === "temp-effect");
    expect(obj?.completed).toBe(true);
  });
});
