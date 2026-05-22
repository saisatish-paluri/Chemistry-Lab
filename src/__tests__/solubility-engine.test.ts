import { describe, it, expect, beforeEach } from "vitest";
import {
  initialSolubilityState,
  selectSolutionA,
  selectSolutionB,
  combineSolutions,
  tickMixing,
  resetSolubilityMix,
  completeSolubility,
  resetSolubility,
  lookupPrecipitate,
  SOLUTIONS,
} from "@/lib/engine/solubility-engine";
import {
  validateCombineSolutions,
  validateCompleteSolubility,
} from "@/lib/engine/validation";
import type { SolubilityState } from "@/lib/engine/types";

describe("initialSolubilityState", () => {
  it("starts with correct defaults", () => {
    const s = initialSolubilityState("guided");
    expect(s.status).toBe("idle");
    expect(s.solutionA).toBeNull();
    expect(s.solutionB).toBeNull();
    expect(s.mixProgress).toBe(0);
    expect(s.hasPrecipitate).toBe(false);
    expect(s.testHistory).toHaveLength(0);
    expect(s.result).toBeNull();
  });
});

describe("selectSolutionA / B", () => {
  let state: SolubilityState;
  beforeEach(() => { state = initialSolubilityState("guided"); });

  it("selects solution A", () => {
    const next = selectSolutionA(state, "silver-nitrate");
    expect(next.solutionA).toBe("silver-nitrate");
    expect(next.status).toBe("setup");
  });

  it("selects solution B", () => {
    const next = selectSolutionB(state, "sodium-chloride-sol");
    expect(next.solutionB).toBe("sodium-chloride-sol");
  });

  it("transitions to ready when both selected", () => {
    let s = selectSolutionA(state, "silver-nitrate");
    s = selectSolutionB(s, "sodium-chloride-sol");
    expect(s.status).toBe("ready");
  });

  it("blocks selecting same solution for A and B", () => {
    let s = selectSolutionA(state, "silver-nitrate");
    s = selectSolutionB(s, "silver-nitrate");
    expect(s.solutionB).toBeNull(); // should be rejected with warning
    expect(s.observations.length).toBeGreaterThan(0);
  });
});

describe("lookupPrecipitate", () => {
  it("finds AgCl precipitate for AgNO3 + NaCl", () => {
    const p = lookupPrecipitate("silver-nitrate", "sodium-chloride-sol");
    expect(p).not.toBeNull();
    expect(p?.formula).toBe("AgCl");
  });

  it("is commutative — order doesn't matter", () => {
    const p1 = lookupPrecipitate("silver-nitrate", "sodium-chloride-sol");
    const p2 = lookupPrecipitate("sodium-chloride-sol", "silver-nitrate");
    expect(p1?.formula).toBe(p2?.formula);
  });

  it("returns null for non-precipitating pairs", () => {
    const p = lookupPrecipitate("sodium-chloride-sol", "potassium-iodide");
    expect(p).toBeNull();
  });

  it("finds PbI2 for Pb(NO3)2 + KI (golden rain)", () => {
    const p = lookupPrecipitate("lead-nitrate", "potassium-iodide");
    expect(p?.formula).toBe("PbI₂");
    expect(p?.colorName).toMatch(/[Yy]ellow/);
  });

  it("finds BaSO4 for BaCl2 + Na2SO4", () => {
    const p = lookupPrecipitate("barium-chloride-sol", "sodium-sulfate");
    expect(p?.formula).toBe("BaSO₄");
  });

  it("finds Fe(OH)3 for Fe(NO3)3 + NaOH", () => {
    const p = lookupPrecipitate("iron-nitrate", "sodium-hydroxide-sol");
    expect(p?.formula).toBe("Fe(OH)₃");
    expect(p?.colorName).toMatch(/[Bb]rown/);
  });
});

describe("combineSolutions", () => {
  function prepReady(): SolubilityState {
    let s = initialSolubilityState("guided");
    s = selectSolutionA(s, "silver-nitrate");
    s = selectSolutionB(s, "sodium-chloride-sol");
    return s;
  }

  it("transitions to running and sets precipitate data", () => {
    const next = combineSolutions(prepReady());
    expect(next.status).toBe("running");
    expect(next.precipitate?.formula).toBe("AgCl");
    expect(next.hasPrecipitate).toBe(true);
  });

  it("sets hasPrecipitate=false for non-precipitating pair", () => {
    let s = initialSolubilityState("guided");
    s = selectSolutionA(s, "sodium-chloride-sol");
    s = selectSolutionB(s, "potassium-iodide");
    const next = combineSolutions(s);
    expect(next.hasPrecipitate).toBe(false);
    expect(next.precipitate).toBeNull();
  });

  it("does not combine if A or B is missing", () => {
    let s = initialSolubilityState("guided");
    s = selectSolutionA(s, "silver-nitrate");
    // B not set
    expect(validateCombineSolutions(s)?.code).toBe("NO_SOLUTION_B");
  });

  it("rejects same solution for A and B", () => {
    const s: SolubilityState = {
      ...initialSolubilityState("guided"),
      solutionA: "silver-nitrate",
      solutionB: "silver-nitrate",
      status: "ready",
    };
    const err = validateCombineSolutions(s);
    expect(err?.code).toBe("SAME_SOLUTION");
  });
});

describe("tickMixing", () => {
  function afterCombine(a: SolubilityState["solutionA"], b: SolubilityState["solutionB"]): SolubilityState {
    let s = initialSolubilityState("guided");
    s = selectSolutionA(s, a!);
    s = selectSolutionB(s, b!);
    return combineSolutions(s);
  }

  it("advances mixProgress", () => {
    const s = afterCombine("silver-nitrate", "sodium-chloride-sol");
    const next = tickMixing(s, 0.1);
    expect(next.mixProgress).toBeCloseTo(0.1, 5);
  });

  it("records test and transitions to setup when progress reaches 1", () => {
    let s = afterCombine("silver-nitrate", "sodium-chloride-sol");
    // Advance to completion in one big tick
    s = tickMixing(s, 1.0);
    expect(s.status).toBe("setup");
    expect(s.testHistory).toHaveLength(1);
    expect(s.testHistory[0].hasPrecipitate).toBe(true);
  });

  it("deducts objective for finding precipitate", () => {
    let s = afterCombine("silver-nitrate", "sodium-chloride-sol");
    s = tickMixing(s, 1.0);
    const obj = s.objectives.find((o) => o.id === "find-precipitate");
    expect(obj?.completed).toBe(true);
  });

  it("does nothing if not running", () => {
    const s = initialSolubilityState("guided");
    const next = tickMixing(s, 0.5);
    expect(next.mixProgress).toBe(0);
  });
});

describe("resetSolubilityMix", () => {
  it("clears A and B selection but preserves history", () => {
    let s = initialSolubilityState("guided");
    s = selectSolutionA(s, "silver-nitrate");
    s = selectSolutionB(s, "sodium-chloride-sol");
    s = combineSolutions(s);
    s = tickMixing(s, 1.0); // complete one test
    const reset = resetSolubilityMix(s);
    expect(reset.solutionA).toBeNull();
    expect(reset.solutionB).toBeNull();
    expect(reset.testHistory).toHaveLength(1);
    expect(reset.mixProgress).toBe(0);
  });
});

describe("completeSolubility", () => {
  it("requires at least one test", () => {
    const s = initialSolubilityState("guided");
    const err = validateCompleteSolubility(s);
    expect(err?.code).toBe("NO_TESTS");
  });

  it("completes with success=true after 2+ unique pair tests", () => {
    let s = initialSolubilityState("guided");
    // First combination
    s = selectSolutionA(s, "silver-nitrate");
    s = selectSolutionB(s, "sodium-chloride-sol");
    s = combineSolutions(s);
    s = tickMixing(s, 1.0);
    // Second combination (different pair)
    s = selectSolutionA(s, "lead-nitrate");
    s = selectSolutionB(s, "potassium-iodide");
    s = combineSolutions(s);
    s = tickMixing(s, 1.0);
    const final = completeSolubility(s);
    expect(final.status).toBe("completed");
    expect(final.result?.success).toBe(true);
    expect(final.result?.score).toBeGreaterThan(0);
  });

  it("explanation mentions solubility rules", () => {
    let s = initialSolubilityState("guided");
    s = selectSolutionA(s, "silver-nitrate");
    s = selectSolutionB(s, "potassium-iodide");
    s = combineSolutions(s);
    s = tickMixing(s, 1.0);
    const final = completeSolubility(s);
    expect(final.result?.explanation).toContain("nitrat");
  });
});

describe("resetSolubility", () => {
  it("returns a fresh state", () => {
    const s = resetSolubility("free");
    expect(s.status).toBe("idle");
    expect(s.testHistory).toHaveLength(0);
    expect(s.mode).toBe("free");
  });
});

describe("SOLUTIONS data", () => {
  it("has 9 solutions", () => {
    expect(Object.keys(SOLUTIONS)).toHaveLength(9);
  });

  it("each solution has a formula and color", () => {
    Object.values(SOLUTIONS).forEach((sol) => {
      expect(sol.formula).toBeTruthy();
      expect(sol.color).toMatch(/^#/);
    });
  });
});
