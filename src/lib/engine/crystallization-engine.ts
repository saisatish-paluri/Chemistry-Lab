import type {
  CrystallizationState, ObservationEvent, StepDef, ExperimentObjective, ExperimentMode,
} from "./types";

function uid(): string { return Math.random().toString(36).slice(2, 10); }

function mkObs(
  type: ObservationEvent["type"],
  message: string,
  severity: ObservationEvent["severity"],
): ObservationEvent {
  return { id: uid(), timestamp: Date.now(), type, message, severity };
}

// Solubility of CuSO4 in water (g / 100 mL) as a function of temperature (°C)
export function getCuSO4Solubility(tempC: number): number {
  return 32 * Math.exp(0.0158 * (tempC - 20));
}

export function initialCrystallizationState(mode: ExperimentMode): CrystallizationState {
  const steps: StepDef[] = [
    { id: "s1", instruction: "Add impure copper(II) sulfate salt to the beaker (10 to 50 g).", hint: "Choose a suitable mass; too much will exceed even hot water solubility.", completed: false },
    { id: "s2", instruction: "Add water (50 to 100 mL) to dissolve the salt.", hint: "Vary water volume to shift concentration thresholds.", completed: false },
    { id: "s3", instruction: "Heat and stir the solution to dissolve the impure salt completely.", hint: "Solubility increases rapidly with temperature.", completed: false },
    { id: "s4", instruction: "Turn off heating, transfer to crystallization dish, and select a cooling rate.", hint: "Cooling rate affects crystal size and purity.", completed: false },
    { id: "s5", instruction: "Allow the solution to cool and observe crystal nucleation and growth.", hint: "Keep watch as temperature falls below the saturation threshold.", completed: false },
    { id: "s6", instruction: "Filter the mixture to separate pure crystals from the filtrate, and collect the final product.", hint: "Rinse with minimum ice-cold water to avoid redissolution.", completed: false },
  ];

  const objectives: ExperimentObjective[] = [
    { id: "o1", description: "Prepare a fully saturated hot solution of CuSO4.", completed: false },
    { id: "o2", description: "Crystallize the solute using slow cooling for high-quality crystals.", completed: false },
    { id: "o3", description: "Collect the product with at least 92% purity.", completed: false },
  ];

  return {
    mode,
    status: "setup",
    impureSaltMass: 0,
    waterVolume: 0,
    temperature: 22, // ambient
    dissolvedMass: 0,
    undissolvedMass: 0,
    crystalsFormedMass: 0,
    crystalSize: 0,
    impurityLevel: 10, // 10% base impurity
    coolingRate: "slow",
    isHeating: false,
    isCooling: false,
    filtrateVolume: 0,
    pureProductCollected: 0,
    productPurity: 100,
    dissolvedImpurityMass: 0,
    solidImpurityMass: 0,
    crystalColor: "#38bdf8", // Sky blue CuSO4
    isFiltered: false,
    isCollected: false,
    stepProgress: 0,
    steps,
    objectives,
    observations: [mkObs("info", "Welcome to the Crystallization Lab. Start by adding impure copper sulfate salt.", "info")],
    result: null,
    startedAt: Date.now(),
  };
}

export function addImpureSalt(state: CrystallizationState, mass: number): CrystallizationState {
  if (state.status !== "setup" || state.impureSaltMass > 0) return state;
  const solidImpurity = mass * (state.impurityLevel / 100);
  const pureMass = mass - solidImpurity;

  const next = { ...state };
  next.impureSaltMass = mass;
  next.undissolvedMass = pureMass;
  next.solidImpurityMass = solidImpurity;
  next.steps[0].completed = true;
  next.observations.unshift(mkObs("chemical_added", `Added ${mass.toFixed(1)}g of impure CuSO4 salt (${(mass - solidImpurity).toFixed(1)}g pure + ${solidImpurity.toFixed(1)}g impurities).`, "info"));
  return next;
}

export function addWater(state: CrystallizationState, volume: number): CrystallizationState {
  if (state.impureSaltMass === 0 || state.waterVolume > 0) return state;
  const next = { ...state };
  next.waterVolume = volume;
  next.steps[1].completed = true;
  next.observations.unshift(mkObs("chemical_added", `Added ${volume}mL of distilled water. Prepare to heat and stir.`, "info"));
  next.status = "heating";
  return next;
}

export function toggleHeating(state: CrystallizationState, active: boolean): CrystallizationState {
  const next = { ...state };
  next.isHeating = active;
  if (active) next.isCooling = false;
  return next;
}

export function setCoolingRate(state: CrystallizationState, rate: "slow" | "medium" | "fast"): CrystallizationState {
  return { ...state, coolingRate: rate };
}

export function transferToDish(state: CrystallizationState): CrystallizationState {
  if (state.status !== "heating" || state.isHeating) return state;
  const next = { ...state };
  next.status = "cooling";
  next.isCooling = true;
  next.steps[3].completed = true;
  next.observations.unshift(mkObs("state_change", `Transferred solution to crystallizing dish. Cooling initiated (${state.coolingRate} cooling).`, "info"));
  return next;
}

export function filterCrystals(state: CrystallizationState): CrystallizationState {
  if (state.status !== "cooling" || state.crystalsFormedMass === 0) return state;
  const next = { ...state };
  next.isFiltered = true;
  next.isCooling = false;
  next.filtrateVolume = state.waterVolume * 0.85; // some water retained in crystal bed
  next.steps[5].completed = true;
  next.observations.unshift(mkObs("state_change", "Solution filtered. Crystals separated from filtrate.", "info"));
  return next;
}

export function collectProduct(state: CrystallizationState): CrystallizationState {
  if (!state.isFiltered || state.isCollected) return state;
  const next = { ...state };
  next.isCollected = true;
  next.status = "completed";

  // Calculate product purity based on cooling rate
  // Fast cooling traps more impurities in the crystal lattice
  let purity = 100;
  if (state.coolingRate === "fast") {
    purity = 82 + Math.random() * 4; // ~84% purity
  } else if (state.coolingRate === "medium") {
    purity = 91 + Math.random() * 3; // ~92% purity
  } else {
    purity = 98 + Math.random() * 1.5; // ~99% purity (excellent crystals)
  }

  // Yield collected
  const recoveryRate = 0.92; // some product lost in filtrate
  next.pureProductCollected = state.crystalsFormedMass * recoveryRate * (purity / 100);
  next.productPurity = purity;

  // Check objectives
  next.objectives[2].completed = purity >= 92;
  const allObjectivesCompleted = next.objectives.every(obj => obj.completed);

  next.result = {
    completedAt: Date.now(),
    success: allObjectivesCompleted,
    score: allObjectivesCompleted ? 100 : next.objectives.filter(o => o.completed).length * 33,
    summary: `Purified CuSO4 crystals successfully. Collected ${next.pureProductCollected.toFixed(1)}g of product with ${purity.toFixed(1)}% purity. Average crystal size is ${state.crystalSize.toFixed(1)} mm.`,
    explanation: `Crystallization separates a soluble solid from a liquid solvent based on temperature-dependent solubility. Slow cooling rates minimize lattice impurities and grow large, highly structured pure crystals.`,
  };

  next.observations.unshift(mkObs("info", `Product collected! Recovery: ${next.pureProductCollected.toFixed(1)}g CuSO4. Purity: ${purity.toFixed(1)}%.`, "success"));
  return next;
}

export function tickCrystallization(state: CrystallizationState, deltaSec: number): CrystallizationState {
  const next = { ...state };

  // ── 1. Heating & Dissolution Phase ──
  if (state.status === "heating") {
    const targetTemp = state.isHeating ? 92 : 22;
    const tempDiff = targetTemp - state.temperature;
    // Temperature change (rate dependent on heating)
    next.temperature += tempDiff * (state.isHeating ? 0.08 : 0.03) * deltaSec * 10;

    // Dissolve solid CuSO4 and impurities
    const solubilityLimit = getCuSO4Solubility(next.temperature) * (state.waterVolume / 100);
    
    // Dissolving kinetics (Noyes-Whitney model)
    if (next.undissolvedMass > 0 && next.dissolvedMass < solubilityLimit) {
      const rate = Math.min(next.undissolvedMass, (solubilityLimit - next.dissolvedMass) * 0.12 * deltaSec * 10);
      next.undissolvedMass -= rate;
      next.dissolvedMass += rate;
    }

    // Dissolve impurities
    if (next.solidImpurityMass > 0) {
      const impRate = Math.min(next.solidImpurityMass, 0.5 * deltaSec * 10);
      next.solidImpurityMass -= impRate;
      next.dissolvedImpurityMass += impRate;
    }

    // Mark hot saturation objective
    if (next.temperature >= 75 && next.dissolvedMass >= solubilityLimit * 0.95) {
      next.objectives[0].completed = true;
    }

    if (next.undissolvedMass <= 0.1 && next.solidImpurityMass <= 0.1) {
      next.steps[2].completed = true;
    }
  }

  // ── 2. Cooling & Crystallization Phase ──
  if (state.status === "cooling" && state.isCooling) {
    const coolingRateCPerSec = state.coolingRate === "fast" ? 0.9 : state.coolingRate === "medium" ? 0.35 : 0.12;
    next.temperature = Math.max(22, next.temperature - coolingRateCPerSec * deltaSec * 10);

    const solubilityLimit = getCuSO4Solubility(next.temperature) * (state.waterVolume / 100);
    const supersat = next.dissolvedMass - solubilityLimit;

    if (supersat > 0) {
      // Crystal growth rate kinetics
      // Fast cooling triggers rapid nucleation (small crystals)
      // Slow cooling triggers growth (larger crystals)
      const growthCoeff = state.coolingRate === "slow" ? 0.16 : state.coolingRate === "medium" ? 0.28 : 0.45;
      const crystalYield = Math.min(next.dissolvedMass, supersat * growthCoeff * deltaSec * 10);
      
      next.crystalsFormedMass += crystalYield;
      next.dissolvedMass -= crystalYield;

      // Size kinetics
      const targetSize = state.coolingRate === "slow" ? 5.8 : state.coolingRate === "medium" ? 2.5 : 0.9;
      const sizeProgress = next.crystalsFormedMass / (next.impureSaltMass || 1);
      next.crystalSize = Math.min(targetSize, targetSize * sizeProgress + (Math.random() - 0.5) * 0.1);

      if (state.coolingRate === "slow" && next.crystalSize >= 4.5) {
        next.objectives[1].completed = true;
      }

      if (next.crystalsFormedMass > 0 && state.steps[4].completed === false) {
        next.steps[4].completed = true;
        next.observations.unshift(mkObs("state_change", "Crystals started to nucleate and form at the bottom.", "info"));
      }
    }
  }

  return next;
}

export function resetCrystallization(state: CrystallizationState): CrystallizationState {
  return initialCrystallizationState(state.mode);
}
