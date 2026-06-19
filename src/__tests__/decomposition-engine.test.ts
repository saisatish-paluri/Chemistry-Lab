import { describe, it, expect } from "vitest";
import {
  initialDecompositionState,
  selectReactant,
  addMnO2CatalystAction,
  setDecompHeatingPower,
  toggleDecompHeatingAction,
  tickDecomposition,
} from "../lib/engine/decomposition-engine";

describe("Decomposition Reactions Engine", () => {
  it("initializes state", () => {
    const s = initialDecompositionState("guided");
    expect(s.status).toBe("setup");
    expect(s.gasVolumeEvolved).toBe(0);
  });

  it("calculates decomposition kinetics", () => {
    let s = initialDecompositionState("guided");
    s = selectReactant(s, "kclo3");
    s = setDecompHeatingPower(s, 400);
    s = toggleDecompHeatingAction(s, true); // start heating

    expect(s.status).toBe("running");

    // Tick forward so temperature rises
    s = tickDecomposition(s, 20.0);
    expect(s.temperature).toBeGreaterThan(300);
    expect(s.gasVolumeEvolved).toBeGreaterThan(0); // gas evolved
  });

  it("applies MnO2 catalyst factor to lower activation energy", () => {
    let s = initialDecompositionState("guided");
    s = selectReactant(s, "h2o2");
    s = addMnO2CatalystAction(s);
    // H2O2 with catalyst decomposes at room temp!
    expect(s.hasCatalyst).toBe(true);

    s = tickDecomposition(s, 5.0);
    expect(s.gasVolumeEvolved).toBeGreaterThan(0);
  });
});
