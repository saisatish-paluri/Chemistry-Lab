import { describe, it, expect } from "vitest";
import {
  initialNeutralizationState,
  measureHCl,
  measureNaOH,
  startMixing,
  updateMixProgress,
  recordNeutObservations,
  completeNeutralization,
  resetNeutralization,
  updateNeutralizationParameters,
} from "@/lib/engine/neutralization-engine";

describe("Neutralization Engine", () => {
  it("starts with correct defaults and overhaul parameters", () => {
    const state = initialNeutralizationState("guided");
    expect(state.status).toBe("idle");
    expect(state.currentStep).toBe("measure-hcl");
    expect(state.hclVolumeMl).toBe(0);
    expect(state.naohVolumeMl).toBe(0);
    expect(state.acidType).toBe("strong");
    expect(state.baseType).toBe("strong");
    expect(state.acidConc).toBe(0.1);
    expect(state.baseConc).toBe(0.1);
    expect(state.beakerInsulated).toBe(false);
    expect(state.currentPh).toBe(7.0);
    expect(state.heatEvolvedJ).toBe(0);
    expect(state.indicator).toBe("universal");
    expect(typeof state.experimentalError).toBe("number");
  });

  it("updates parameters correctly during setup", () => {
    let state = initialNeutralizationState("guided");
    state = updateNeutralizationParameters(state, {
      acidType: "weak",
      baseType: "strong",
      acidConc: 0.5,
      baseConc: 0.5,
      beakerInsulated: true,
      indicator: "phenolphthalein",
    });

    expect(state.acidType).toBe("weak");
    expect(state.baseType).toBe("strong");
    expect(state.acidConc).toBe(0.5);
    expect(state.baseConc).toBe(0.5);
    expect(state.beakerInsulated).toBe(true);
    expect(state.indicator).toBe("phenolphthalein");
  });

  it("calculates initial pH when measuring acid", () => {
    let state = initialNeutralizationState("guided");
    // Default strong acid 0.1 M -> pH = 1.0
    state = measureHCl(state, 25);
    expect(state.hclVolumeMl).toBe(25);
    expect(state.currentPh).toBeCloseTo(1.0, 1);
    expect(state.currentStep).toBe("measure-naoh");

    // Weak acid (pKa = 4.76) at 0.1 M -> pH = 0.5 * (4.76 - log10(0.1)) = 0.5 * (4.76 + 1) = 2.88
    let weakState = initialNeutralizationState("guided");
    weakState = updateNeutralizationParameters(weakState, { acidType: "weak" });
    weakState = measureHCl(weakState, 25);
    expect(weakState.currentPh).toBeCloseTo(2.88, 1);
  });

  it("advances through titration and mixing calculations", () => {
    let state = initialNeutralizationState("guided");
    state = updateNeutralizationParameters(state, {
      acidConc: 0.2,
      baseConc: 0.2,
    });
    state = measureHCl(state, 25);
    state = measureNaOH(state, 25);
    state = startMixing(state);

    expect(state.isMixing).toBe(true);
    expect(state.mixProgress).toBe(0);

    // Halfway mixed (12.5 mL NaOH added, 25 mL HCl)
    // Strong-strong system: n_acid = 0.005 mol, n_base = 0.0025 mol
    // Net n_h+ = 0.0025 mol, volume = 37.5 mL -> [H+] = 0.0025 / 0.0375 = 0.0667 M -> pH = 1.18
    state = updateMixProgress(state, 0.5);
    expect(state.mixProgress).toBe(0.5);
    expect(state.currentPh).toBeCloseTo(1.18, 1);
    expect(state.heatEvolvedJ).toBeGreaterThan(0);
    expect(state.currentTempC).toBeGreaterThan(state.initialTempC);

    // Fully mixed (25 mL NaOH added) -> equivalence point, pH should be 7
    state = updateMixProgress(state, 1.0);
    expect(state.mixProgress).toBe(1.0);
    expect(state.currentPh).toBeCloseTo(7.0, 1);
    expect(state.isMixing).toBe(false);
    expect(state.currentStep).toBe("observe");
  });

  it("finishes the experiment and handles resets", () => {
    let state = initialNeutralizationState("guided");
    state = measureHCl(state, 25);
    state = measureNaOH(state, 25);
    state = startMixing(state);
    state = updateMixProgress(state, 1.0);
    state = recordNeutObservations(state);

    expect(state.saltFormed).toBe(true);
    expect(state.currentStep).toBe("record");

    state = completeNeutralization(state);
    expect(state.status).toBe("completed");
    expect(state.result?.success).toBe(true);
    expect(state.result?.score).toBe(95);

    state = resetNeutralization(state);
    expect(state.status).toBe("idle");
    expect(state.hclVolumeMl).toBe(0);
  });
});
