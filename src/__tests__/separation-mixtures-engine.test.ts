import { describe, it, expect } from "vitest";
import {
  initialSeparationMixturesState,
  sweepMagnetAction,
  addWaterAndDissolveAction,
  startFiltrationAction,
  startEvaporationAction,
  tickSeparationMixtures,
} from "../lib/engine/separation-mixtures-engine";

describe("Separation of Mixtures Engine", () => {
  it("initializes state with proper mixture masses", () => {
    const s = initialSeparationMixturesState("guided");
    expect(s.status).toBe("setup");
    expect(s.ironMass).toBe(5.0);
    expect(s.sandMass).toBe(6.0);
    expect(s.saltMass).toBe(4.0);
    expect(s.separatedIron).toBe(0);
  });

  it("extracts iron filings with magnet sweeps", () => {
    let s = initialSeparationMixturesState("guided");
    s = sweepMagnetAction(s, 2.0);
    expect(s.separatedIron).toBeGreaterThan(0);

    // After enough sweeps, all iron is collected
    s = sweepMagnetAction(s, 20.0);
    expect(s.separatedIron).toBe(5.0);
    expect(s.separationStep).toBe("magnetic");
  });

  it("dissolves salt but leaves sand solid", () => {
    let s = initialSeparationMixturesState("guided");
    s = sweepMagnetAction(s, 20.0); // complete step 1
    s = addWaterAndDissolveAction(s);

    expect(s.isWet).toBe(true);
    expect(s.waterVolume).toBe(50);
    expect(s.dissolvedSalt).toBe(4.0);
    expect(s.separationStep).toBe("dissolving");
  });

  it("performs filtration to capture sand", () => {
    let s = initialSeparationMixturesState("guided");
    s = sweepMagnetAction(s, 20.0);
    s = addWaterAndDissolveAction(s);
    s = startFiltrationAction(s);

    expect(s.status).toBe("running");
    expect(s.separationStep).toBe("filtration");

    s = tickSeparationMixtures(s, 5.0);
    expect(s.separatedSand).toBeGreaterThan(0);
  });
});
