import { describe, it, expect } from "vitest";
import {
  initialDoubleDisplacementState,
  selectSystem,
  configureReactants,
  mixReactantsAction,
  tickDoubleDisplacement,
  getSolubilityProductKsp,
} from "../lib/engine/double-displacement-engine";

describe("Double Displacement Engine", () => {
  it("initializes state", () => {
    const s = initialDoubleDisplacementState("guided");
    expect(s.status).toBe("setup");
    expect(s.precipitateMass).toBe(0);
  });

  it("calculates temperature-dependent Ksp correctly", () => {
    const kspRoom = getSolubilityProductKsp("pbno3-ki", 25);
    const kspHot = getSolubilityProductKsp("pbno3-ki", 85);
    // solubility should be higher at high temperatures
    expect(kspHot).toBeGreaterThan(kspRoom);
  });

  it("precipitates when solutions are mixed", () => {
    let s = initialDoubleDisplacementState("guided");
    s = selectSystem(s, "agno3-nacl");
    s = configureReactants(s, 20, 20, 0.1, 0.1, 25);
    s = mixReactantsAction(s);

    expect(s.status).toBe("running");
    s = tickDoubleDisplacement(s, 3.0); // complete mixing

    expect(s.status).toBe("completed");
    expect(s.precipitateMass).toBeGreaterThan(0.05); // AgCl precipitate formed
  });

  it("redissolves precipitate on heating (Golden Rain)", () => {
    let s = initialDoubleDisplacementState("guided");
    s = selectSystem(s, "pbno3-ki");
    // dilute solutions to make redissolution visible
    s = configureReactants(s, 20, 20, 0.01, 0.01, 25);
    s = mixReactantsAction(s);
    s = tickDoubleDisplacement(s, 3.0);

    const initialPrecip = s.precipitateMass;
    expect(initialPrecip).toBeGreaterThan(0);

    // Heat it up to 90C
    s = configureReactants(s, 20, 20, 0.01, 0.01, 90);
    s = tickDoubleDisplacement(s, 1.0);

    expect(s.precipitateMass).toBeLessThan(initialPrecip); // precipitate dissolved
  });
});
