import { describe, it, expect } from "vitest";
import {
  initialFunctionalGroupsState,
  selectFGCompound,
  selectFGTest,
  runFGTest,
  finishFGTest,
  completeFunctionalGroups,
  resetFunctionalGroups,
} from "@/lib/engine/functional-groups-engine";

describe("initialFunctionalGroupsState", () => {
  it("starts with correct defaults", () => {
    const state = initialFunctionalGroupsState("guided");
    expect(state.status).toBe("idle");
    expect(state.temperature).toBe(25);
    expect(state.reagentConc).toBe(1.0);
    expect(state.turbidity).toBe(0);
  });
});

describe("Organic Reaction Kinetics", () => {
  it("Lucas test (Primary Alcohol) does not react at room temperature, reacts slowly upon heating", () => {
    let state = initialFunctionalGroupsState("guided");
    state = selectFGCompound(state, "compound-a"); // 1-Butanol (primary alcohol)
    state = selectFGTest(state, "lucas-test");

    // Room temperature: no reaction
    state = { ...state, temperature: 25, reagentConc: 2.0 };
    state = runFGTest(state);
    state = finishFGTest(state);
    const resultRoom = state.testResults[0];
    expect(resultRoom.positive).toBe(false);
    expect(state.turbidity).toBeLessThan(5.0);

    // Heated: reaction proceeds, turbidity formed
    state = { ...state, testResults: [], identified: null, temperature: 75, reagentConc: 4.0 };
    state = runFGTest(state);
    state = finishFGTest(state);
    const resultHeated = state.testResults[0];
    expect(resultHeated.positive).toBe(true);
    expect(state.turbidity).toBeGreaterThan(5.0);
  });

  it("2,4-DNP hydrazone crystallization is temperature sensitive (soluble at high temps)", () => {
    let state = initialFunctionalGroupsState("guided");
    state = selectFGCompound(state, "compound-c"); // Propanone (ketone)
    state = selectFGTest(state, "dnp-test");

    // Hot temperature: dissolves precipitate (Qsp < Ksp)
    state = { ...state, temperature: 85, reagentConc: 1.0 };
    state = runFGTest(state);
    state = finishFGTest(state);
    let result = state.testResults[0];
    expect(result.positive).toBe(false);

    // Room temperature: crystallizes precipitate (Qsp > Ksp)
    state = { ...state, testResults: [], identified: null, temperature: 25, reagentConc: 1.5 };
    state = runFGTest(state);
    state = finishFGTest(state);
    result = state.testResults[0];
    expect(result.positive).toBe(true);
    expect(result.observation).toMatch(/precipitate formed/i);
  });

  it("Hinsberg test requires excess KOH to confirm primary amine", () => {
    let state = initialFunctionalGroupsState("guided");
    state = selectFGCompound(state, "compound-e"); // Aniline (primary amine)
    state = selectFGTest(state, "hinsberg-test");

    // Insufficient KOH concentration: precipitate forms but does not dissolve
    state = { ...state, reagentConc: 1.0 };
    state = runFGTest(state);
    state = finishFGTest(state);
    let result = state.testResults[0];
    expect(result.positive).toBe(false);
    expect(result.observation).toMatch(/insoluble/i);

    // Excess KOH concentration: precipitate dissolves
    state = { ...state, testResults: [], identified: null, reagentConc: 3.0 };
    state = runFGTest(state);
    state = finishFGTest(state);
    result = state.testResults[0];
    expect(result.positive).toBe(true);
    expect(result.observation).toMatch(/dissolved completely/i);
  });
});
