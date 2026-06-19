import type {
  PhysicalChemicalState, ObservationEvent, StepDef, ExperimentObjective,
} from "./types";

function uid(): string { return Math.random().toString(36).slice(2, 10); }

function mkObs(
  type: ObservationEvent["type"],
  message: string,
  severity: ObservationEvent["severity"],
): ObservationEvent {
  return { id: uid(), timestamp: Date.now(), type, message, severity };
}

export function initialPhysicalChemicalState(mode: "guided" | "free" | "exam" | "advanced"): PhysicalChemicalState {
  const steps: StepDef[] = [
    { id: "s1", instruction: "Select a process to study from the panel list.", hint: "Choose between melting wax, rusting iron, burning paper, dissolving sugar, etc.", completed: false },
    { id: "s2", instruction: "Activate the burner or mixing trigger to initiate the process.", hint: "Watch the animation progress and monitor temperature indicators.", completed: false },
    { id: "s3", instruction: "Perform the reversibility test to confirm physical vs chemical properties.", hint: "Try to freeze molten wax, crystallize sugar, or recover burnt ash.", completed: false },
  ];

  const objectives: ExperimentObjective[] = [
    { id: "o1", description: "Investigate a physical change and demonstrate its reversibility.", completed: false },
    { id: "o2", description: "Investigate a chemical change and observe its irreversibility.", completed: false },
    { id: "o3", description: "Study exothermic heat release in combustion or neutralization.", completed: false },
  ];

  return {
    mode,
    status: "setup",
    selectedProcess: null,
    processType: null,
    temperature: 22,
    reactionProgress: 0,
    heatReleasedJ: 0,
    reversibilityChecked: false,
    isTriggered: false,
    steps,
    objectives,
    observations: [mkObs("info", "Welcome to the Physical vs Chemical Changes Lab. Select a process.", "info")],
    result: null,
    startedAt: Date.now(),
  };
}

export function selectProcess(state: PhysicalChemicalState, process: PhysicalChemicalState["selectedProcess"]): PhysicalChemicalState {
  const next = { ...state };
  next.selectedProcess = process;
  next.isTriggered = false;
  next.reactionProgress = 0;
  next.heatReleasedJ = 0;
  next.reversibilityChecked = false;
  next.temperature = 22;

  const isPhysical = ["melting-wax", "dissolving-sugar", "freezing-water"].includes(process!);
  next.processType = isPhysical ? "physical" : "chemical";
  next.status = "ready";
  next.steps[0].completed = true;

  next.observations.unshift(
    mkObs(
      "info",
      `Selected process: ${process!.replace("-", " ").toUpperCase()}. Ready to execute.`,
      "info"
    )
  );
  return next;
}

export function triggerProcessAction(state: PhysicalChemicalState): PhysicalChemicalState {
  const next = { ...state };
  if (!next.selectedProcess) return next;
  next.isTriggered = true;
  next.status = "running";
  next.steps[1].completed = true;
  next.observations.unshift(mkObs("reaction-start", `Process started. Observe the physical/chemical properties.`, "info"));
  return next;
}

export function checkReversibilityAction(state: PhysicalChemicalState): PhysicalChemicalState {
  const next = { ...state };
  if (next.status !== "completed" && next.reactionProgress < 0.95) return next;

  next.reversibilityChecked = true;
  next.steps[2].completed = true;

  const isPhysical = next.processType === "physical";
  if (isPhysical) {
    next.objectives[0].completed = true;
    next.observations.unshift(mkObs("reaction-complete", `Reversibility Test: SUCCESS. Physical changes are reversible (e.g. cooling molten wax solidifies it).`, "success"));
  } else {
    next.objectives[1].completed = true;
    next.observations.unshift(mkObs("warning", `Reversibility Test: FAILED. Chemical changes are irreversible (e.g. ashes cannot turn back into paper).`, "warning"));
  }

  // Final check for completion
  const allObjectivesCompleted = next.objectives.every(obj => obj.completed);
  next.result = {
    completedAt: Date.now(),
    success: true,
    score: allObjectivesCompleted ? 100 : Math.round(next.objectives.filter(o => o.completed).length * 33.3),
    summary: `Studied the ${next.processType} change: ${next.selectedProcess!.replace("-", " ").toUpperCase()}. Reversibility verified: ${isPhysical ? "Reversible" : "Irreversible"}.`,
    explanation: `Physical changes alter appearance or phase without changing molecular formula (reversible). Chemical changes break and form covalent/ionic bonds, producing new substances (irreversible).`,
  };

  return next;
}

export function tickPhysicalChemical(state: PhysicalChemicalState, deltaSec: number): PhysicalChemicalState {
  const next = { ...state };
  if (next.status !== "running" || !next.isTriggered || !next.selectedProcess) return next;

  // Progress ticks
  next.reactionProgress = Math.min(1.0, next.reactionProgress + 0.15 * deltaSec);

  // Thermodynamics & visual factors by process type
  if (next.selectedProcess === "melting-wax") {
    // Phase change: temperature stays at Tm=55 until melted
    next.temperature = Math.min(55, next.temperature + 15.0 * deltaSec);
    next.heatReleasedJ = -120 * next.reactionProgress; // endothermic
  }
  else if (next.selectedProcess === "freezing-water") {
    // Phase change: temperature drops to Tf=0
    next.temperature = Math.max(0, next.temperature - 12.0 * deltaSec);
    next.heatReleasedJ = 180 * next.reactionProgress; // exothermic latent release
  }
  else if (next.selectedProcess === "dissolving-sugar") {
    // Solid dissolution: temperature remains relatively constant
    next.temperature = 22.0 + 0.1 * Math.sin(next.reactionProgress * Math.PI);
  }
  else if (next.selectedProcess === "burning-paper") {
    // Fire combustion: large temperature surge, exothermic release
    next.temperature = Math.min(650, next.temperature + 220.0 * deltaSec);
    next.heatReleasedJ = 4200 * next.reactionProgress;
    next.objectives[2].completed = true; // heat study triggered
  }
  else if (next.selectedProcess === "rusting-iron") {
    // Slow oxidation: slight temperature rise, slow kinetics
    next.temperature = 22.0 + 1.2 * next.reactionProgress;
    next.heatReleasedJ = 320 * next.reactionProgress;
  }
  else if (next.selectedProcess === "neutralization") {
    // Exothermic acid-base: temperature rises to ~48°C
    next.temperature = Math.min(48.5, next.temperature + 12.0 * deltaSec);
    next.heatReleasedJ = 1100 * next.reactionProgress;
    next.objectives[2].completed = true; // heat study triggered
  }

  // Completion check
  if (next.reactionProgress >= 1.0) {
    next.status = "completed";
    next.observations.unshift(mkObs("reaction-complete", `Process complete. Ready to perform reversibility test.`, "info"));
  }

  return next;
}

export function resetPhysicalChemical(state: PhysicalChemicalState): PhysicalChemicalState {
  return initialPhysicalChemicalState(state.mode);
}
