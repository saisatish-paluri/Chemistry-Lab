import { describe, it, expect } from "vitest";
import {
  initialPhysicalChemicalState,
  selectProcess,
  triggerProcessAction,
  checkReversibilityAction,
  tickPhysicalChemical,
} from "../lib/engine/physical-chemical-engine";

describe("Physical vs Chemical Changes Engine", () => {
  it("initializes state", () => {
    const s = initialPhysicalChemicalState("guided");
    expect(s.status).toBe("setup");
    expect(s.reactionProgress).toBe(0);
  });

  it("identifies physical vs chemical process types correctly", () => {
    let s = initialPhysicalChemicalState("guided");
    
    s = selectProcess(s, "melting-wax");
    expect(s.processType).toBe("physical");

    s = selectProcess(s, "burning-paper");
    expect(s.processType).toBe("chemical");
  });

  it("ticks temperature and progress dynamically", () => {
    let s = initialPhysicalChemicalState("guided");
    s = selectProcess(s, "melting-wax");
    s = triggerProcessAction(s);

    s = tickPhysicalChemical(s, 2.0);
    expect(s.reactionProgress).toBeGreaterThan(0);
    expect(s.temperature).toBeGreaterThan(22);
  });

  it("checks reversibility outcomes", () => {
    let s = initialPhysicalChemicalState("guided");
    s = selectProcess(s, "melting-wax");
    s = triggerProcessAction(s);
    s = tickPhysicalChemical(s, 10.0); // complete melting

    s = checkReversibilityAction(s);
    expect(s.reversibilityChecked).toBe(true);
    expect(s.objectives[0].completed).toBe(true); // physical reversibility success
  });
});
