import type {
  TitrationState, ElectrolysisState, FlameTestState,
  SolubilityState, ReactionRateState, GasLawsState,
  ChemicalEquilibriumState, GasCollectionState,
  RedoxDisplacementState, CalorimetryState,
  EquilibriumPerturbation,
  ValidationError,
} from "./types";

// ─── Titration ────────────────────────────────────────────────────────────────

export function validateAddTitrant(s: TitrationState): ValidationError | null {
  if (!s.flask.indicatorAdded)
    return { code: "NO_INDICATOR",    message: "Add an indicator to the flask before titrating." };
  if (s.burette.volumeRemaining <= 0)
    return { code: "BURETTE_EMPTY",   message: "Burette is empty — reset to refill." };
  if (s.status === "completed" || s.status === "failed")
    return { code: "EXPERIMENT_DONE", message: "Experiment complete — reset to try again." };
  return null;
}

export function validateAddIndicator(s: TitrationState): ValidationError | null {
  if (s.flask.indicatorAdded)
    return { code: "INDICATOR_PRESENT", message: "Indicator already added — adding more would contaminate the sample." };
  if (s.status === "running")
    return { code: "TITRATION_RUNNING", message: "Cannot add indicator while titration is in progress." };
  if (s.status === "completed" || s.status === "failed")
    return { code: "EXPERIMENT_DONE",   message: "Experiment complete — reset to try again." };
  return null;
}

// ─── Electrolysis ─────────────────────────────────────────────────────────────

export function validateStartElectrolysis(s: ElectrolysisState): ValidationError | null {
  if (!s.electrolyte)
    return { code: "NO_ELECTROLYTE",   message: "Select an electrolyte before starting." };
  if (!s.anode.connected || !s.cathode.connected)
    return { code: "ELECTRODES_OUT",   message: "Insert both electrodes into the solution first." };
  if (!s.circuitComplete)
    return { code: "OPEN_CIRCUIT",     message: "Connect the circuit before applying current." };
  if (s.status === "completed" || s.status === "failed")
    return { code: "EXPERIMENT_DONE",  message: "Experiment complete — reset to try again." };
  return null;
}

export function validateConnectCircuit(s: ElectrolysisState): ValidationError | null {
  if (!s.anode.connected || !s.cathode.connected)
    return { code: "ELECTRODES_OUT",      message: "Insert electrodes into the solution before connecting the circuit." };
  if (s.circuitComplete)
    return { code: "ALREADY_CONNECTED",   message: "Circuit is already connected." };
  if (s.status === "completed" || s.status === "failed")
    return { code: "EXPERIMENT_DONE",     message: "Experiment complete — reset to try again." };
  return null;
}

export function validateInsertElectrodes(s: ElectrolysisState): ValidationError | null {
  if (!s.electrolyte)
    return { code: "NO_ELECTROLYTE",   message: "Add electrolyte solution before inserting electrodes." };
  if (s.anode.connected && s.cathode.connected)
    return { code: "ALREADY_INSERTED", message: "Electrodes are already in the solution." };
  if (s.status === "completed" || s.status === "failed")
    return { code: "EXPERIMENT_DONE",  message: "Experiment complete — reset to try again." };
  return null;
}

// ─── Flame Test ───────────────────────────────────────────────────────────────

export function validateLightBurner(s: FlameTestState): ValidationError | null {
  if (s.flameLit)
    return { code: "BURNER_LIT", message: "Burner is already lit." };
  if (s.status === "completed" || s.status === "failed")
    return { code: "EXPERIMENT_DONE", message: "Experiment complete — reset to try again." };
  return null;
}

export function validateDipLoop(s: FlameTestState): ValidationError | null {
  if (!s.selectedSample)
    return { code: "NO_SAMPLE",      message: "Select a metal salt sample before dipping the loop." };
  if (!s.flameLit)
    return { code: "NO_BURNER",      message: "Light the Bunsen burner first." };
  if (s.loopDipped)
    return { code: "ALREADY_DIPPED", message: "Loop is already coated — perform the test or clean the loop." };
  if (s.status === "running")
    return { code: "TEST_RUNNING",   message: "A flame test is currently in progress." };
  if (s.status === "completed" || s.status === "failed")
    return { code: "EXPERIMENT_DONE", message: "Experiment complete — reset to try again." };
  return null;
}

export function validatePerformTest(s: FlameTestState): ValidationError | null {
  if (!s.flameLit)
    return { code: "NO_BURNER",   message: "Light the Bunsen burner first." };
  if (!s.loopDipped)
    return { code: "NO_SAMPLE",   message: "Dip the loop into a sample before testing." };
  if (s.status === "running")
    return { code: "TEST_RUNNING", message: "A flame test is already running." };
  if (s.status === "completed" || s.status === "failed")
    return { code: "EXPERIMENT_DONE", message: "Experiment complete — reset to try again." };
  return null;
}

export function validateCompleteFlameTest(s: FlameTestState): ValidationError | null {
  if (s.testHistory.length < 1)
    return { code: "NO_TESTS", message: "Complete at least one flame test before finishing." };
  if (s.status === "running")
    return { code: "TEST_RUNNING", message: "Finish the current flame test first." };
  if (s.status === "completed" || s.status === "failed")
    return { code: "EXPERIMENT_DONE", message: "Experiment already complete." };
  return null;
}

// ─── Solubility ───────────────────────────────────────────────────────────────

export function validateCombineSolutions(s: SolubilityState): ValidationError | null {
  if (!s.solutionA)
    return { code: "NO_SOLUTION_A", message: "Select solution A before combining." };
  if (!s.solutionB)
    return { code: "NO_SOLUTION_B", message: "Select solution B before combining." };
  if (s.solutionA === s.solutionB)
    return { code: "SAME_SOLUTION", message: "Choose two different solutions." };
  if (s.status === "running")
    return { code: "MIXING",         message: "Mixing is already in progress." };
  if (s.status === "completed" || s.status === "failed")
    return { code: "EXPERIMENT_DONE", message: "Experiment complete — reset to try again." };
  return null;
}

export function validateCompleteSolubility(s: SolubilityState): ValidationError | null {
  if (s.testHistory.length < 1)
    return { code: "NO_TESTS", message: "Complete at least one combination test before finishing." };
  if (s.status === "running")
    return { code: "MIXING", message: "Finish the current mixing before concluding." };
  if (s.status === "completed" || s.status === "failed")
    return { code: "EXPERIMENT_DONE", message: "Experiment already complete." };
  return null;
}

// ─── Reaction Rate ────────────────────────────────────────────────────────────

export function validateStartReaction(s: ReactionRateState): ValidationError | null {
  if (s.status === "running")
    return { code: "ALREADY_RUNNING", message: "Reaction is already running." };
  if (s.status === "completed" || s.status === "failed")
    return { code: "EXPERIMENT_DONE", message: "Reaction complete — reset to run again." };
  return null;
}

export function validateStopReaction(s: ReactionRateState): ValidationError | null {
  if (s.status !== "running")
    return { code: "NOT_RUNNING", message: "Reaction is not currently running." };
  return null;
}

// ─── Gas Laws ─────────────────────────────────────────────────────────────────

export function validateSelectLaw(s: GasLawsState): ValidationError | null {
  if (s.status === "completed" || s.status === "failed")
    return { code: "EXPERIMENT_DONE", message: "Experiment complete — reset to try again." };
  return null;
}

export function validateRecordDataPoint(s: GasLawsState): ValidationError | null {
  if (!s.law)
    return { code: "NO_LAW", message: "Select a gas law before recording data." };
  if (s.status !== "running")
    return { code: "NOT_RUNNING", message: "Start the exploration before recording data points." };
  return null;
}

export function validateCompleteGasLaws(s: GasLawsState): ValidationError | null {
  if (s.dataPoints.length < 1)
    return { code: "NO_DATA", message: "Record at least one data point before completing." };
  if (s.status === "completed" || s.status === "failed")
    return { code: "EXPERIMENT_DONE", message: "Experiment already complete." };
  return null;
}

// ─── Chemical Equilibrium ─────────────────────────────────────────────────────

export function validateApplyPerturbation(
  s: ChemicalEquilibriumState,
  perturbation: EquilibriumPerturbation,
): ValidationError | null {
  void perturbation;
  if (s.status === "completed" || s.status === "failed")
    return { code: "EXPERIMENT_DONE", message: "Experiment complete — reset to try again." };
  return null;
}

// ─── Gas Collection ───────────────────────────────────────────────────────────

export function validateAddMarbleChips(s: GasCollectionState): ValidationError | null {
  if (s.status === "completed" || s.status === "failed")
    return { code: "EXPERIMENT_DONE", message: "Reaction complete — reset to try again." };
  return null;
}

export function validateAddHCl(s: GasCollectionState): ValidationError | null {
  if (s.caco3Grams <= 0)
    return { code: "NO_MARBLE", message: "Add marble chips to the flask before adding acid." };
  if (s.status === "completed" || s.status === "failed")
    return { code: "EXPERIMENT_DONE", message: "Reaction complete — reset to try again." };
  return null;
}

// ─── Redox Displacement ───────────────────────────────────────────────────────

export function validateSelectMetal(s: RedoxDisplacementState): ValidationError | null {
  if (s.status === "completed" || s.status === "failed")
    return { code: "EXPERIMENT_DONE", message: "Experiment complete — reset to try again." };
  return null;
}

export function validateAddMetal(s: RedoxDisplacementState): ValidationError | null {
  if (!s.selectedMetal)
    return { code: "NO_METAL", message: "Select a metal before placing it in solution." };
  if (s.status === "running")
    return { code: "ALREADY_RUNNING", message: "A metal is already reacting in the solution." };
  if (s.status === "completed" || s.status === "failed")
    return { code: "EXPERIMENT_DONE", message: "Experiment complete — reset to try again." };
  return null;
}

// ─── Calorimetry ─────────────────────────────────────────────────────────────

export function validateAddNaOH(s: CalorimetryState): ValidationError | null {
  if (s.naohAddedMl >= 120)
    return { code: "EXCESS_NAOH", message: "Sufficient NaOH added — experiment effectively complete." };
  if (s.status === "completed" || s.status === "failed")
    return { code: "EXPERIMENT_DONE", message: "Experiment complete — reset to try again." };
  return null;
}
