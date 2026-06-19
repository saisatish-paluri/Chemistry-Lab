import { describe, it, expect } from "vitest";
import {
  initialSaltAnalysisState,
  selectSalt,
  recordPreliminary,
  runCationTest,
  finishCationTest,
  runAnionTest,
  finishAnionTest,
  completeSaltAnalysis,
  resetSaltAnalysis,
  recalculateSaltAnalysis,
} from "@/lib/engine/salt-analysis-engine";

describe("initialSaltAnalysisState", () => {
  it("starts with correct defaults", () => {
    const state = initialSaltAnalysisState("guided");
    expect(state.status).toBe("idle");
    expect(state.phase).toBe("select");
    expect(state.reagentDrops).toBe(5);
    expect(state.temperature).toBe(25);
    expect(state.contamination).toBe(0);
    expect(state.cationPptMass).toBe(0);
  });
});

describe("Cation Tests (NaOH and Flame)", () => {
  it("copper forms a blue precipitate in NaOH", () => {
    let state = initialSaltAnalysisState("guided");
    state = selectSalt(state, "copper-sulfate");
    state = recordPreliminary(state);
    state = { ...state, reagentDrops: 10, reagentConc: 2.0 };
    state = runCationTest(state);
    state = finishCationTest(state);
    expect(state.cationPptMass).toBeGreaterThan(0.5);
    expect(state.cationPptColor).toBe("#2563eb");
    expect(state.identifiedCation).toBe("copper");
  });

  it("zinc precipitate Zn(OH)2 dissolves in excess NaOH", () => {
    let state = initialSaltAnalysisState("guided");
    state = selectSalt(state, "zinc-carbonate");
    state = recordPreliminary(state);
    
    // Low drops: white precipitate forms
    state = { ...state, reagentDrops: 5, reagentConc: 1.0 };
    state = runCationTest(state);
    state = finishCationTest(state);
    expect(state.cationPptMass).toBeGreaterThan(0.1);
    expect(state.cationPptColor).toBe("#f1f5f9");

    // Excess NaOH: precipitate dissolves
    state = { ...state, phase: "cation", reagentDrops: 30, reagentConc: 4.0 };
    state = runCationTest(state);
    state = finishCationTest(state);
    expect(state.cationPptMass).toBe(0);
    expect(state.cationPptColor).toBeNull();
  });

  it("calcium flame test changes color with sodium contamination", () => {
    let state = initialSaltAnalysisState("guided");
    state = selectSalt(state, "calcium-nitrate");
    state = recordPreliminary(state);

    // No contamination: brick red
    state = { ...state, contamination: 0 };
    state = runCationTest(state);
    state = finishCationTest(state);
    expect(state.flameColor).toBe("#ea580c");

    // Heavily contaminated: shifts toward yellow
    state = { ...state, phase: "cation", contamination: 10 };
    state = runCationTest(state);
    state = finishCationTest(state);
    expect(state.flameColor).toBe("#fbbf24");
  });

  it("ammonium evolves NH3 gas when warmed with NaOH", () => {
    let state = initialSaltAnalysisState("guided");
    state = selectSalt(state, "ammonium-chloride");
    state = recordPreliminary(state);

    // Cold temperature: no bubbles
    state = { ...state, reagentDrops: 10, temperature: 15 };
    state = runCationTest(state);
    state = finishCationTest(state);
    expect(state.cationBubbles).toBe(false);

    // Hot temperature: NH3 effervescence
    state = { ...state, phase: "cation", reagentDrops: 15, temperature: 75 };
    state = runCationTest(state);
    state = finishCationTest(state);
    expect(state.cationBubbles).toBe(true);
    expect(state.cationGasLabel).toBe("NH₃");
  });
});

describe("Anion Tests (AgNO3, BaCl2, HCl, Brown Ring)", () => {
  it("chloride forms a white precipitate with silver nitrate", () => {
    let state = initialSaltAnalysisState("guided");
    state = selectSalt(state, "iron-chloride");
    state = recordPreliminary(state);
    state = runCationTest(state);
    state = finishCationTest(state); // Move to anion phase
    
    state = { ...state, reagentDrops: 10, reagentConc: 1.0 };
    state = runAnionTest(state);
    state = finishAnionTest(state);
    expect(state.anionPptMass).toBeGreaterThan(0.5);
    expect(state.anionPptColor).toBe("#f8fafc");
    expect(state.identifiedAnion).toBe("chloride");
  });

  it("carbonate effervesces with acid", () => {
    let state = initialSaltAnalysisState("guided");
    state = selectSalt(state, "zinc-carbonate");
    state = recordPreliminary(state);
    state = runCationTest(state);
    state = finishCationTest(state);

    state = { ...state, reagentDrops: 10, reagentConc: 2.0, temperature: 25 };
    state = runAnionTest(state);
    state = finishAnionTest(state);
    expect(state.anionBubbles).toBe(true);
    expect(state.anionGasLabel).toBe("CO₂");
  });

  it("nitrate brown ring is heat sensitive", () => {
    let state = initialSaltAnalysisState("guided");
    state = selectSalt(state, "calcium-nitrate");
    state = recordPreliminary(state);
    state = runCationTest(state);
    state = finishCationTest(state);

    // Cold: ring forms
    state = { ...state, reagentDrops: 15, reagentConc: 2.0, temperature: 20 };
    state = runAnionTest(state);
    state = finishAnionTest(state);
    expect(state.anionPptMass).toBeGreaterThan(0.1);
    expect(state.anionPptColor).toBe("#92400e");

    // Hot: ring decomposes
    state = { ...state, phase: "anion", reagentDrops: 15, reagentConc: 2.0, temperature: 75 };
    state = runAnionTest(state);
    state = finishAnionTest(state);
    expect(state.anionPptMass).toBe(0);
  });
});
