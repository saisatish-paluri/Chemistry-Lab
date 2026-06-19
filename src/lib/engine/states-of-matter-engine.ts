import type {
  StatesOfMatterState, ObservationEvent, StepDef, ExperimentObjective, ExperimentMode,
} from "./types";

function uid(): string { return Math.random().toString(36).slice(2, 10); }

function mkObs(
  type: ObservationEvent["type"],
  message: string,
  severity: ObservationEvent["severity"],
): ObservationEvent {
  return { id: uid(), timestamp: Date.now(), type, message, severity };
}

export function initialStatesOfMatterState(mode: ExperimentMode): StatesOfMatterState {
  const steps: StepDef[] = [
    { id: "s1", instruction: "Select a substance (Water, Ethanol, or Wax) and set the altitude.", hint: "Altitude alters atmospheric pressure and changes the boiling point.", completed: false },
    { id: "s2", instruction: "Place the substance in the apparatus and note the initial temperature and solid phase.", hint: "Thermometer eye-level offset will introduce a reading error.", completed: false },
    { id: "s3", instruction: "Activate heating (hot plate burner) and watch it heat up to its melting point.", hint: "Observe the temperature pause during the latent heat of fusion plateau.", completed: false },
    { id: "s4", instruction: "Continue heating through the liquid phase to the boiling point.", hint: "Note the latent heat of vaporisation plateau as the liquid boils into gas.", completed: false },
    { id: "s5", instruction: "Turn off heating and activate cooling to observe condensation and freezing.", hint: "Plotting these values will display the phase heating/cooling curves.", completed: false },
  ];

  const objectives: ExperimentObjective[] = [
    { id: "o1", description: "Observe a complete solid-to-liquid melting transition.", completed: false },
    { id: "o2", description: "Measure the boiling point variation at high altitude (e.g. 3000m).", completed: false },
    { id: "o3", description: "Trigger an overheating splatter error by applying excess power to wax or ethanol.", completed: false },
  ];

  return {
    mode,
    status: "setup",
    selectedSubstance: null,
    temperature: -15, // start cold (e.g. ice)
    phase: "solid",
    heatingPower: 150, // W
    isHeating: false,
    isCooling: false,
    latentHeatProgress: 0,
    elapsedTime: 0,
    altitude: 0, // sea level
    pressure: 1.0,
    splatterTriggered: false,
    thermometerEyeLevelOffset: 1.5, // Parallax offset error in °C
    steps,
    objectives,
    observations: [mkObs("info", "Welcome to the States of Matter Lab. Select a substance to analyze.", "info")],
    result: null,
    startedAt: Date.now(),
  };
}

export function selectSubstance(state: StatesOfMatterState, sub: "water" | "ethanol" | "wax", alt: number): StatesOfMatterState {
  if (state.selectedSubstance !== null) return state;
  const next = { ...state };
  next.selectedSubstance = sub;
  next.altitude = alt;
  
  // Calculate pressure based on barometric formula
  // P = P0 * exp(-g * M * h / R * T) -> approx exp(-h / 8000)
  next.pressure = Number(Math.exp(-alt / 8000).toFixed(3));

  // Set initial starting temperatures
  if (sub === "water") {
    next.temperature = -15; // solid ice
    next.phase = "solid";
  } else if (sub === "ethanol") {
    next.temperature = -130; // solid ethanol
    next.phase = "solid";
  } else {
    next.temperature = 20; // solid paraffin wax
    next.phase = "solid";
  }

  next.steps[0].completed = true;
  next.steps[1].completed = true;
  
  const subName = sub === "water" ? "Water (Ice)" : sub === "ethanol" ? "Ethanol (Solid)" : "Paraffin Wax (Solid)";
  next.observations.unshift(mkObs("info", `Selected ${subName} at altitude ${alt}m (Atmospheric Pressure: ${next.pressure} atm).`, "info"));
  return next;
}

export function setHeatingPower(state: StatesOfMatterState, power: number): StatesOfMatterState {
  return { ...state, heatingPower: power };
}

export function toggleSubstanceHeating(state: StatesOfMatterState, active: boolean): StatesOfMatterState {
  const next = { ...state };
  next.isHeating = active;
  if (active) {
    next.isCooling = false;
    next.steps[2].completed = true;
  }
  return next;
}

export function toggleSubstanceCooling(state: StatesOfMatterState, active: boolean): StatesOfMatterState {
  const next = { ...state };
  next.isCooling = active;
  if (active) {
    next.isHeating = false;
    next.steps[4].completed = true;
  }
  return next;
}

export function adjustThermometerParallax(state: StatesOfMatterState, offset: number): StatesOfMatterState {
  return { ...state, thermometerEyeLevelOffset: offset };
}

// Get boiling and melting points dependent on pressure
export function getPhaseTransitionPoints(substance: "water" | "ethanol" | "wax", pressure: number) {
  let Tm = 0; // Melting point
  let Tb = 100; // Boiling point at 1 atm

  if (substance === "water") {
    Tm = 0;
    // Clausius-Clapeyron approximation
    Tb = 100 + (pressure - 1.0) * -28.0; // decreases with altitude
  } else if (substance === "ethanol") {
    Tm = -114;
    Tb = 78.3 + (pressure - 1.0) * -22.0;
  } else {
    Tm = 55;
    Tb = 350 + (pressure - 1.0) * -45.0;
  }

  return { Tm, Tb };
}

export function tickStatesOfMatter(state: StatesOfMatterState, deltaSec: number): StatesOfMatterState {
  if (!state.isHeating && !state.isCooling) return state;
  const next = { ...state };
  next.elapsedTime += deltaSec;

  const { Tm, Tb } = getPhaseTransitionPoints(state.selectedSubstance!, state.pressure);
  
  // Specific heats (J / g / °C) and Latent heats (J / g)
  const mass = 10; // 10g substance
  let cp = 4.18;
  let Lf = 334; // Latent fusion
  let Lv = 2260; // Latent vaporisation

  if (state.selectedSubstance === "water") {
    cp = state.phase === "solid" ? 2.09 : state.phase === "liquid" ? 4.18 : 2.03;
    Lf = 334;
    Lv = 2260;
  } else if (state.selectedSubstance === "ethanol") {
    cp = state.phase === "solid" ? 1.70 : state.phase === "liquid" ? 2.44 : 1.70;
    Lf = 109;
    Lv = 841;
  } else {
    cp = state.phase === "solid" ? 2.10 : state.phase === "liquid" ? 2.90 : 2.20;
    Lf = 200;
    Lv = 350;
  }

  const heatInputPerSec = state.isHeating ? state.heatingPower : -150; // Cooling transfers heat out
  const energyTransferred = heatInputPerSec * deltaSec * 10; // scale factor

  // ── Thermodynamic Phase Change Logic ──
  if (next.phase === "solid") {
    if (energyTransferred > 0 && next.temperature >= Tm) {
      next.phase = "solid-liquid";
      next.latentHeatProgress = 0;
    } else if (energyTransferred < 0 && next.temperature <= -150) {
      // absolute minimum
    } else {
      next.temperature += energyTransferred / (mass * cp);
    }
  }

  else if (next.phase === "solid-liquid") {
    const energyRequired = mass * Lf;
    const rate = energyTransferred / energyRequired;
    next.latentHeatProgress = Math.max(0, Math.min(1.0, next.latentHeatProgress + rate));
    
    if (next.latentHeatProgress >= 1.0) {
      next.phase = "liquid";
      next.objectives[0].completed = true; // melting transition complete
      next.observations.unshift(mkObs("state_change", "Solid melted completely into liquid phase.", "info"));
    } else if (next.latentHeatProgress <= 0.0 && energyTransferred < 0) {
      next.phase = "solid";
      next.observations.unshift(mkObs("state_change", "Liquid froze completely into solid phase.", "info"));
    }
  }

  else if (next.phase === "liquid") {
    const tempLimit = energyTransferred > 0 ? Tb : Tm;
    next.temperature += energyTransferred / (mass * cp);

    if (energyTransferred > 0 && next.temperature >= tempLimit) {
      next.temperature = Tb;
      next.phase = "liquid-gas";
      next.latentHeatProgress = 0;
    } else if (energyTransferred < 0 && next.temperature <= tempLimit) {
      next.temperature = Tm;
      next.phase = "solid-liquid";
      next.latentHeatProgress = 1.0;
    }

    // Overheating splatter checks
    if (state.isHeating && state.heatingPower >= 350) {
      if ((state.selectedSubstance === "ethanol" && next.temperature >= 74) || 
          (state.selectedSubstance === "wax" && next.temperature >= 280)) {
        next.splatterTriggered = true;
        next.objectives[2].completed = true; // splatter triggered
        next.observations.unshift(mkObs("error", "WARNING: Splattering! Excessive heating power is vaporising the liquid layer violently.", "error"));
      }
    }
  }

  else if (next.phase === "liquid-gas") {
    const energyRequired = mass * Lv;
    const rate = energyTransferred / energyRequired;
    next.latentHeatProgress = Math.max(0, Math.min(1.0, next.latentHeatProgress + rate));

    if (next.latentHeatProgress >= 1.0) {
      next.phase = "gas";
      next.steps[3].completed = true;
      next.observations.unshift(mkObs("state_change", "Liquid completely vaporised into gaseous phase.", "info"));
    } else if (next.latentHeatProgress <= 0.0 && energyTransferred < 0) {
      next.phase = "liquid";
      next.observations.unshift(mkObs("state_change", "Gas condensed completely into liquid phase.", "info"));
    }
  }

  else if (next.phase === "gas") {
    if (energyTransferred < 0 && next.temperature <= Tb) {
      next.phase = "liquid-gas";
      next.latentHeatProgress = 1.0;
    } else {
      next.temperature = Math.min(500, next.temperature + energyTransferred / (mass * cp));
    }
  }

  // Check high altitude objective
  if (state.altitude >= 3000 && next.phase === "liquid-gas") {
    next.objectives[1].completed = true;
  }

  // Completion check: when they cooled it back and finished boiling/condensation loop
  if (state.isCooling && next.temperature <= 25 && next.phase === "solid") {
    next.isCooling = false;
    next.status = "completed";

    const allObjectivesCompleted = next.objectives.every(obj => obj.completed);
    next.result = {
      completedAt: Date.now(),
      success: allObjectivesCompleted,
      score: allObjectivesCompleted ? 100 : next.objectives.filter(o => o.completed).length * 33,
      summary: `Analyzed phase transitions for ${state.selectedSubstance!.toUpperCase()} at pressure ${state.pressure} atm. Measured transition thresholds under temperature and altitude configurations.`,
      explanation: `Phase transitions occur when a substance gains or loses thermal energy. During melting and boiling, temperature remains constant (latent heat plateau) as energy is consumed to break intermolecular bonds rather than increase kinetic energy. Boiling points vary with pressure.`,
    };
  }

  return next;
}

export function resetStatesOfMatter(state: StatesOfMatterState): StatesOfMatterState {
  return initialStatesOfMatterState(state.mode);
}
