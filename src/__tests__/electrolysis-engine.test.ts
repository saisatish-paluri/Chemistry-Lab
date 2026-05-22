import { describe, it, expect } from "vitest";
import {
  initialElectrolysisState,
  setElectrolyte,
  insertElectrodes,
  connectCircuit,
  disconnectCircuit,
  startElectrolysis,
  stopElectrolysis,
  tickElectrolysis,
  setCurrent,
  setVoltage,
  resetElectrolysis,
  GAS_TUBE_CAPACITY_ML,
} from "@/lib/engine/electrolysis-engine";
import { calcElectrolysisMoles, FARADAY } from "@/lib/engine/chemistry";
import type { ElectrolysisState } from "@/lib/engine/types";

describe("calcElectrolysisMoles", () => {
  it("produces correct moles via Faraday's law", () => {
    const moles = calcElectrolysisMoles(1, FARADAY, 1);
    expect(moles).toBeCloseTo(1.0, 4);
  });

  it("scales linearly with current", () => {
    const m1 = calcElectrolysisMoles(1, 100, 2);
    const m2 = calcElectrolysisMoles(2, 100, 2);
    expect(m2 / m1).toBeCloseTo(2, 4);
  });

  it("scales linearly with time", () => {
    const m1 = calcElectrolysisMoles(1, 100, 2);
    const m2 = calcElectrolysisMoles(1, 200, 2);
    expect(m2 / m1).toBeCloseTo(2, 4);
  });
});

describe("initialElectrolysisState", () => {
  it("starts correctly", () => {
    const s = initialElectrolysisState("guided");
    expect(s.status).toBe("idle");
    expect(s.electrolyte).toBeNull();
    expect(s.circuitComplete).toBe(false);
    expect(s.anode.connected).toBe(false);
    expect(s.cathode.connected).toBe(false);
    expect(s.runTimeSeconds).toBe(0);
    expect(s.voltage).toBe(6.0);
    expect(s.current).toBe(0); // no electrolyte → no current
  });
});

function setupConductive(): ElectrolysisState {
  let s = initialElectrolysisState("guided");
  s = setElectrolyte(s, "sodium-chloride");
  s = insertElectrodes(s);
  s = connectCircuit(s);
  return s;
}

describe("setElectrolyte", () => {
  it("records chosen electrolyte", () => {
    const s = setElectrolyte(initialElectrolysisState("guided"), "sulfuric-acid");
    expect(s.electrolyte).toBe("sulfuric-acid");
  });

  it("emits conductivity-change observation", () => {
    const s = setElectrolyte(initialElectrolysisState("guided"), "sodium-chloride");
    expect(s.observations[0].type).toBe("conductivity-change");
    expect(s.observations[0].severity).toBe("info");
  });

  it("warns for distilled water", () => {
    const s = setElectrolyte(initialElectrolysisState("guided"), "distilled-water");
    expect(s.observations[0].severity).toBe("warning");
  });

  it("derives current from current voltage when electrolyte is set", () => {
    const s = setElectrolyte(initialElectrolysisState("guided"), "sodium-chloride");
    // 6V default, conductivity 0.85 → (6/12)*3*0.85 = 1.275A
    expect(s.current).toBeGreaterThan(0);
    expect(s.current).toBeCloseTo(1.275, 2);
  });

  it("sets current to 0 for non-conductive electrolyte", () => {
    const s = setElectrolyte(initialElectrolysisState("guided"), "distilled-water");
    expect(s.current).toBe(0);
  });

  it("reflects higher voltage in derived current", () => {
    let s = initialElectrolysisState("guided");
    s = setVoltage(s, 12); // raise voltage first
    s = setElectrolyte(s, "sodium-chloride");
    // 12V, conductivity 0.85 → (12/12)*3*0.85 = 2.55A
    expect(s.current).toBeCloseTo(2.55, 2);
  });
});

describe("setVoltage", () => {
  it("updates voltage and derives current when electrolyte is set", () => {
    let s = initialElectrolysisState("guided");
    s = setElectrolyte(s, "sulfuric-acid"); // conductivity 0.92
    s = setVoltage(s, 12);
    // (12/12)*3*0.92 = 2.76A
    expect(s.voltage).toBe(12);
    expect(s.current).toBeCloseTo(2.76, 2);
  });

  it("clamps voltage to [0, 12]", () => {
    const s = setVoltage(initialElectrolysisState("guided"), 999);
    expect(s.voltage).toBe(12);
    const s2 = setVoltage(initialElectrolysisState("guided"), -5);
    expect(s2.voltage).toBe(0);
  });

  it("sets current to 0 when no electrolyte is selected", () => {
    const s = setVoltage(initialElectrolysisState("guided"), 10);
    expect(s.current).toBe(0);
  });

  it("does nothing when experiment is completed", () => {
    let s = setupConductive();
    s = startElectrolysis(s);
    s = tickElectrolysis(s, 200); // past 120-second safety cap
    expect(s.status).toBe("completed");
    const after = setVoltage(s, 3);
    expect(after.voltage).toBe(s.voltage); // unchanged
  });

  it("updates bubble rate proportionally when running", () => {
    let s = setupConductive();
    s = startElectrolysis(s);
    const rateBefore = s.anode.bubbleRate;
    s = setVoltage(s, 12); // double the voltage
    expect(s.anode.bubbleRate).toBeGreaterThan(rateBefore);
  });
});

describe("insertElectrodes", () => {
  it("marks electrodes connected", () => {
    let s = initialElectrolysisState("guided");
    s = setElectrolyte(s, "sodium-chloride");
    s = insertElectrodes(s);
    expect(s.anode.connected).toBe(true);
    expect(s.cathode.connected).toBe(true);
  });

  it("does nothing without electrolyte", () => {
    const s = insertElectrodes(initialElectrolysisState("guided"));
    expect(s.anode.connected).toBe(false);
  });
});

describe("connectCircuit", () => {
  it("completes circuit when electrodes are in", () => {
    const s = setupConductive();
    expect(s.circuitComplete).toBe(true);
  });

  it("sets status to ready when circuit connects", () => {
    const s = setupConductive();
    expect(s.status).toBe("ready");
  });

  it("does nothing when electrodes not inserted", () => {
    let s = initialElectrolysisState("guided");
    s = setElectrolyte(s, "sodium-chloride");
    s = connectCircuit(s);
    expect(s.circuitComplete).toBe(false);
  });
});

describe("startElectrolysis", () => {
  it("starts when circuit is complete", () => {
    const s = startElectrolysis(setupConductive());
    expect(s.status).toBe("running");
  });

  it("fails for non-conductive electrolyte", () => {
    let s = initialElectrolysisState("guided");
    s = setElectrolyte(s, "distilled-water");
    s = insertElectrodes(s);
    s = connectCircuit(s);
    s = startElectrolysis(s);
    expect(s.status).not.toBe("running");
  });

  it("sets gas formulas from electrolyte profile", () => {
    const s = startElectrolysis(setupConductive());
    expect(s.anode.gasFormula).toBe("Cl₂");
    expect(s.cathode.gasFormula).toBe("H₂");
  });

  it("sets bubble rate proportional to current", () => {
    let s = setupConductive();
    s = setVoltage(s, 12); // max current for NaCl ≈ 2.55A → rate ~1
    s = startElectrolysis(s);
    expect(s.anode.bubbleRate).toBeGreaterThan(0.5);
    expect(s.anode.bubbleRate).toBeLessThanOrEqual(1.0);
  });
});

describe("tickElectrolysis", () => {
  it("accumulates gas over time", () => {
    let s = startElectrolysis(setupConductive());
    s = tickElectrolysis(s, 10);
    expect(s.anodeGasMl).toBeGreaterThan(0);
    expect(s.cathodeGasMl).toBeGreaterThan(0);
  });

  it("completes after safety time cap (120 s)", () => {
    let s = startElectrolysis(setupConductive());
    s = tickElectrolysis(s, 121);
    expect(s.status).toBe("completed");
    expect(s.result).not.toBeNull();
    expect(s.result?.success).toBe(true);
  });

  it("completes when cathode tube reaches GAS_TUBE_CAPACITY_ML", () => {
    // Use max current (12V, highest-conductivity electrolyte) to fill tube fast.
    let s = initialElectrolysisState("guided");
    s = setVoltage(s, 12);
    s = setElectrolyte(s, "sulfuric-acid");
    s = insertElectrodes(s);
    s = connectCircuit(s);
    s = startElectrolysis(s);
    // Tick far enough to fill the tube (mL per second at max current)
    s = tickElectrolysis(s, 200);
    expect(s.status).toBe("completed");
    expect(s.cathodeGasMl).toBeGreaterThanOrEqual(GAS_TUBE_CAPACITY_ML * 0.99);
  });

  it("emits gas-evolution observation when gas becomes visible", () => {
    let s = initialElectrolysisState("guided");
    s = setVoltage(s, 12);
    s = setElectrolyte(s, "sulfuric-acid");
    s = insertElectrodes(s);
    s = connectCircuit(s);
    s = startElectrolysis(s);
    s = tickElectrolysis(s, 60);
    const hasGasObs = s.observations.some((o) => o.type === "gas-evolution");
    expect(hasGasObs).toBe(true);
  });

  it("does nothing when not running", () => {
    const s = setupConductive();
    const after = tickElectrolysis(s, 10);
    expect(after.runTimeSeconds).toBe(0);
  });
});

describe("stopElectrolysis", () => {
  it("pauses the experiment and zeroes bubble rates", () => {
    let s = startElectrolysis(setupConductive());
    s = stopElectrolysis(s);
    expect(s.status).toBe("paused");
    expect(s.anode.bubbleRate).toBe(0);
    expect(s.cathode.bubbleRate).toBe(0);
  });
});

describe("disconnectCircuit", () => {
  it("clears circuitComplete and pauses if running", () => {
    let s = startElectrolysis(setupConductive());
    s = disconnectCircuit(s);
    expect(s.circuitComplete).toBe(false);
    expect(s.status).toBe("paused");
  });

  it("reverts ready to setup when disconnected before starting", () => {
    const s = disconnectCircuit(setupConductive());
    expect(s.circuitComplete).toBe(false);
    expect(s.status).toBe("setup");
  });
});

describe("setCurrent (backward compatibility)", () => {
  it("clamps to [0.1, 5]", () => {
    const s = initialElectrolysisState("guided");
    expect(setCurrent(s, 0).current).toBe(0.1);
    expect(setCurrent(s, 100).current).toBe(5);
    expect(setCurrent(s, 2.5).current).toBe(2.5);
  });
});

describe("resetElectrolysis", () => {
  it("returns a fresh initial state", () => {
    const fresh = resetElectrolysis("guided");
    expect(fresh.status).toBe("idle");
    expect(fresh.electrolyte).toBeNull();
    expect(fresh.runTimeSeconds).toBe(0);
    expect(fresh.voltage).toBe(6.0);
    expect(fresh.current).toBe(0);
  });
});
