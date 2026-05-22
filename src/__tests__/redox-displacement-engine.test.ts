import { describe, it, expect } from "vitest";
import {
  initialRedoxState,
  selectMetal,
  addMetalToSolution,
  tickRedox,
  METALS,
  CUPRIC_INITIAL_CONC,
  cuSolutionColor,
} from "../lib/engine/redox-displacement-engine";

describe("METALS profiles", () => {
  it("Mg, Zn, Fe, Pb displace Cu", () => {
    expect(METALS.magnesium.displacesCu).toBe(true);
    expect(METALS.zinc.displacesCu).toBe(true);
    expect(METALS.iron.displacesCu).toBe(true);
    expect(METALS.lead.displacesCu).toBe(true);
  });
  it("Cu and Ag do NOT displace Cu", () => {
    expect(METALS.copper.displacesCu).toBe(false);
    expect(METALS.silver.displacesCu).toBe(false);
  });
  it("Mg has the most negative std potential", () => {
    const potentials = Object.values(METALS).map((m) => m.stdPotential);
    expect(METALS.magnesium.stdPotential).toBe(Math.min(...potentials));
  });
});

describe("cuSolutionColor", () => {
  it("returns blue-tinted at full concentration", () => {
    const col   = cuSolutionColor(CUPRIC_INITIAL_CONC);
    const match = col.match(/rgb\((\d+),(\d+),(\d+)\)/);
    expect(match).not.toBeNull();
    if (match) expect(Number(match[3])).toBe(255);
  });
  it("returns near-white at zero concentration", () => {
    const col   = cuSolutionColor(0);
    const match = col.match(/rgb\((\d+),(\d+),(\d+)\)/);
    expect(match).not.toBeNull();
    if (match) {
      // r, g, b all high → near-white
      expect(Number(match[1])).toBeGreaterThanOrEqual(200);
    }
  });
});

describe("initialRedoxState", () => {
  it("starts idle with no metal selected", () => {
    const s = initialRedoxState("guided");
    expect(s.status).toBe("idle");
    expect(s.selectedMetal).toBeNull();
  });
  it("starts with full cupric concentration", () => {
    expect(initialRedoxState("guided").cupricConc).toBe(CUPRIC_INITIAL_CONC);
  });
  it("has no copper deposited", () => {
    expect(initialRedoxState("guided").cuDepositedG).toBe(0);
  });
});

describe("selectMetal", () => {
  it("sets selectedMetal", () => {
    const s    = initialRedoxState("guided");
    const next = selectMetal(s, "zinc");
    expect(next.selectedMetal).toBe("zinc");
  });
  it("marks select-metal step completed", () => {
    const s    = initialRedoxState("guided");
    const next = selectMetal(s, "iron");
    expect(next.steps.find((st) => st.id === "select-metal")?.completed).toBe(true);
  });
  it("adds an observation", () => {
    const s    = initialRedoxState("guided");
    const next = selectMetal(s, "magnesium");
    expect(next.observations.length).toBeGreaterThan(0);
  });
});

describe("addMetalToSolution — active metal (Zn)", () => {
  it("sets status to running for a reactive metal", () => {
    let s = initialRedoxState("guided");
    s = selectMetal(s, "zinc");
    s = addMetalToSolution(s);
    expect(s.status).toBe("running");
  });
  it("sets reactionOccurs to true", () => {
    let s = initialRedoxState("guided");
    s = selectMetal(s, "zinc");
    s = addMetalToSolution(s);
    expect(s.reactionOccurs).toBe(true);
  });
  it("completes active-metal objective", () => {
    let s = initialRedoxState("guided");
    s = selectMetal(s, "zinc");
    s = addMetalToSolution(s);
    expect(s.objectives.find((o) => o.id === "active-metal")?.completed).toBe(true);
  });
});

describe("addMetalToSolution — inactive metal (Ag)", () => {
  it("sets status to completed immediately", () => {
    let s = initialRedoxState("guided");
    s = selectMetal(s, "silver");
    s = addMetalToSolution(s);
    expect(s.status).toBe("completed");
  });
  it("sets reactionOccurs to false", () => {
    let s = initialRedoxState("guided");
    s = selectMetal(s, "silver");
    s = addMetalToSolution(s);
    expect(s.reactionOccurs).toBe(false);
  });
  it("completes inactive-metal objective", () => {
    let s = initialRedoxState("guided");
    s = selectMetal(s, "copper");
    s = addMetalToSolution(s);
    expect(s.objectives.find((o) => o.id === "inactive-metal")?.completed).toBe(true);
  });
  it("creates a result with no-reaction summary", () => {
    let s = initialRedoxState("guided");
    s = selectMetal(s, "silver");
    s = addMetalToSolution(s);
    expect(s.result).not.toBeNull();
    expect(s.result?.success).toBe(true);
  });
});

describe("tickRedox", () => {
  function activeState() {
    let s = initialRedoxState("guided");
    s = selectMetal(s, "zinc");
    s = addMetalToSolution(s);
    return s;
  }

  it("decreases cupricConc on each tick", () => {
    const s    = activeState();
    const next = tickRedox(s, 1);
    expect(next.cupricConc).toBeLessThan(s.cupricConc);
  });

  it("increases cuDepositedG on each tick", () => {
    const s    = activeState();
    const next = tickRedox(s, 1);
    expect(next.cuDepositedG).toBeGreaterThan(0);
  });

  it("does nothing for inactive metal state", () => {
    let s = initialRedoxState("guided");
    s = selectMetal(s, "silver");
    s = addMetalToSolution(s);
    const next = tickRedox(s, 1);
    expect(next.cuDepositedG).toBe(0);
  });

  it("reaches completion and sets result", () => {
    let s = activeState();
    for (let i = 0; i < 5000; i++) {
      if (s.status === "completed") break;
      s = tickRedox(s, 1);
    }
    expect(s.status).toBe("completed");
    expect(s.result).not.toBeNull();
  });

  it("completed result has positive E°cell for Zn", () => {
    let s = activeState();
    for (let i = 0; i < 5000; i++) {
      if (s.status === "completed") break;
      s = tickRedox(s, 1);
    }
    // E°cell for Zn = 0.34 - (-0.76) = 1.10 V
    expect(s.result?.summary).toMatch(/E°_cell = 1\.10/);
  });

  it("full-reaction objective completes after run", () => {
    let s = activeState();
    for (let i = 0; i < 5000; i++) {
      if (s.status === "completed") break;
      s = tickRedox(s, 1);
    }
    expect(s.objectives.find((o) => o.id === "full-reaction")?.completed).toBe(true);
  });
});
