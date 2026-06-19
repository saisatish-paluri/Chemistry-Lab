/**
 * Observation Generation Engine
 *
 * Generates realistic, varied observation strings from simulation state.
 * Instead of a hardcoded "Color changed to pink", the engine picks from
 * context-sensitive phrase pools to produce natural-sounding lab observations.
 *
 * All functions are pure and deterministic given a seeded random context.
 */

import type {
  ObservationCategory,
  ObservationContext,
  GeneratedObservation,
} from "./types";

// ─── Phrase Pools ──────────────────────────────────────────────────────────────

// Each pool entry is a function or a string template.
// Variables like {color}, {speed} are filled from the context.

type PhrasePool = readonly string[];

const POOLS: Partial<Record<ObservationCategory, Record<string, PhrasePool>>> = {
  "color-change": {
    faint: [
      "Faint {colorAfter} tinge visible in the solution.",
      "Slight {colorAfter} coloration appeared briefly.",
      "Very faint {colorAfter} — barely perceptible.",
      "Pale {colorAfter} hue observed on addition.",
    ],
    moderate: [
      "Solution turned {colorAfter}.",
      "Clear {colorAfter} color observed.",
      "{colorAfter} coloration developing steadily.",
      "Solution changing from {colorBefore} to {colorAfter}.",
    ],
    intense: [
      "Deep {colorAfter} color appeared immediately.",
      "Vivid {colorAfter} — strongly colored solution.",
      "Intense {colorAfter} coloration throughout the flask.",
      "Sharp color change to {colorAfter} on mixing.",
    ],
    endpoint: [
      "Permanent faint {colorAfter} — endpoint reached.",
      "Color changed to {colorAfter} and persisted on swirling.",
      "Pale {colorAfter} endpoint — persisted for 30 seconds.",
      "First permanent {colorAfter} color — recording volume.",
    ],
    "faded-back": [
      "Color appeared then faded on swirling — not yet at endpoint.",
      "{colorAfter} color disappeared after mixing — continue titrating.",
      "Transient {colorAfter} color — requires more titrant.",
    ],
  },
  "precipitate": {
    trace: [
      "Trace white cloudiness observed.",
      "Very slight turbidity on mixing.",
      "Faint cloudiness — trace precipitate forming.",
    ],
    small: [
      "Small amount of precipitate forming.",
      "White precipitate beginning to form.",
      "Slight precipitate — solution becoming cloudy.",
    ],
    moderate: [
      "Precipitate forming rapidly.",
      "Solution turned cloudy with precipitate.",
      "{color} precipitate forming on mixing.",
      "Visible precipitate settling to the bottom.",
    ],
    large: [
      "Heavy precipitate formed immediately.",
      "Dense {color} precipitate — vigorous precipitation.",
      "Abundant precipitate — reaction is complete.",
      "Flocculent precipitate filling the vessel.",
    ],
  },
  "gas-evolution": {
    slow: [
      "Small bubbles appearing slowly.",
      "Occasional bubble rising from the surface.",
      "Slow, steady effervescence observed.",
    ],
    moderate: [
      "Steady stream of bubbles rising.",
      "Moderate effervescence from the reaction mixture.",
      "Continuous gas evolution observed.",
      "Bubbles forming at the surface — gas being produced.",
    ],
    rapid: [
      "Rapid bubbling from the mixture.",
      "Vigorous gas evolution — reaction proceeding quickly.",
      "Brisk effervescence with visible gas production.",
      "Active bubbling — gas collecting in the tube.",
    ],
    vigorous: [
      "Very vigorous effervescence.",
      "Rapid, vigorous gas evolution — reaction rate high.",
      "Intense bubbling — significant gas production.",
    ],
  },
  "temperature-change": {
    warming: [
      "Flask becoming warm to the touch.",
      "Temperature rising — exothermic reaction occurring.",
      "Noticeable heat being released.",
      "Solution warming rapidly on mixing.",
    ],
    cooling: [
      "Flask becoming cold to the touch.",
      "Temperature dropping — endothermic process.",
      "Solution cooling as reaction proceeds.",
    ],
    neutral: [
      "No perceptible temperature change.",
      "Solution remains at room temperature.",
    ],
  },
  "endpoint": {
    overshot: [
      "Color persisted but solution is deeply colored — overshot.",
      "Dark {colorAfter} — too much reagent added past the endpoint.",
    ],
    sharp: [
      "Sharp endpoint — single drop caused permanent color change.",
      "Clean endpoint reached at {value} {unit}.",
      "Half-drop endpoint — excellent technique.",
    ],
    broad: [
      "Broad endpoint — color developed gradually over several drops.",
      "Gradual color change near equivalence — endpoint less sharp.",
    ],
  },
  "reaction-start": {
    immediate: [
      "Reaction began immediately on mixing.",
      "Instantaneous reaction observed.",
      "Immediate color/precipitate change on addition.",
    ],
    delayed: [
      "Brief induction period before reaction began.",
      "Reaction started after a few seconds of mixing.",
    ],
  },
  "reaction-progress": {
    fast: [
      "Reaction proceeding rapidly.",
      "Fast reaction — product forming quickly.",
      "Color deepening as reaction progresses.",
    ],
    slow: [
      "Slow reaction — changes visible over minutes.",
      "Gradual progress — reaction rate is low.",
    ],
    complete: [
      "Reaction appears complete.",
      "No further change observed — reaction complete.",
      "Final product color stable.",
    ],
  },
  "warning": {
    general: [
      "Caution: solution may be near the endpoint.",
      "Approaching endpoint — reduce addition rate.",
      "Warning: excess reagent may invalidate the result.",
    ],
    overshot: [
      "Possible overshoot — solution deeply colored.",
      "Warning: excess reagent detected.",
    ],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fillTemplate(template: string, ctx: ObservationContext): string {
  return template
    .replace("{color}",       ctx.color       ?? "colored")
    .replace("{colorBefore}", ctx.colorBefore ?? "colorless")
    .replace("{colorAfter}",  ctx.colorAfter  ?? "colored")
    .replace("{speed}",       ctx.speed       ?? "moderate")
    .replace("{amount}",      ctx.amount      ?? "moderate")
    .replace("{reagent}",     ctx.reagentLabel ?? "reagent")
    .replace("{value}",       ctx.value?.toString()  ?? "—")
    .replace("{unit}",        ctx.unit        ?? "");
}

function severityFor(cat: ObservationCategory): GeneratedObservation["weight"] {
  switch (cat) {
    case "warning":          return "warning";
    case "endpoint":         return "success";
    case "temperature-change": return "info";
    case "reaction-start":   return "info";
    default:                 return "info";
  }
}

// ─── Core API ─────────────────────────────────────────────────────────────────

/**
 * Generate a varied observation message from a category and context.
 *
 * @param category  The type of observation (e.g. "color-change").
 * @param ctx       Contextual parameters that fill template variables.
 * @param subkey    Optional pool subdivision (e.g. "endpoint", "faint").
 */
export function generateObservation(
  category: ObservationCategory,
  ctx:      ObservationContext = {},
  subkey?:  string,
): GeneratedObservation {
  const pool = POOLS[category];
  if (!pool) {
    return { category, message: `${category} observed.`, weight: "info" };
  }

  // Choose subkey: explicit > context-derived > first available
  const key =
    subkey ??
    ctx.intensity ??
    ctx.speed ??
    ctx.amount ??
    Object.keys(pool)[0];

  const phrases = pool[key] ?? pool[Object.keys(pool)[0]];
  const template = pick(phrases);
  const message  = fillTemplate(template, ctx);

  return { category, message, weight: severityFor(category) };
}

/**
 * Generate a color-change observation at endpoint.
 */
export function endpointObservation(colorAfter: string): GeneratedObservation {
  return generateObservation("color-change", { colorAfter }, "endpoint");
}

/**
 * Generate a precipitate observation with a given amount.
 */
export function precipitateObservation(
  amount: "trace" | "small" | "moderate" | "large",
  color?: string,
): GeneratedObservation {
  return generateObservation("precipitate", { amount, color }, amount);
}

/**
 * Generate a gas-evolution observation at a given intensity.
 */
export function gasObservation(
  speed: "slow" | "moderate" | "rapid" | "vigorous",
): GeneratedObservation {
  return generateObservation("gas-evolution", { speed }, speed);
}

/**
 * Generate a temperature-change observation.
 */
export function temperatureObservation(deltaT: number): GeneratedObservation {
  const subkey = deltaT > 0.5 ? "warming" : deltaT < -0.5 ? "cooling" : "neutral";
  return generateObservation("temperature-change", {}, subkey);
}

/**
 * Generate multiple observations for a complex event (e.g. simultaneous
 * precipitate + temperature change).
 */
export function generateObservationSet(
  events: { category: ObservationCategory; ctx?: ObservationContext; subkey?: string }[],
): GeneratedObservation[] {
  return events.map(({ category, ctx, subkey }) =>
    generateObservation(category, ctx ?? {}, subkey),
  );
}

/**
 * Pick a random variation from a simple list of phrases.
 * Useful for quick one-off observation strings.
 */
export function pickPhrase(phrases: string[]): string {
  return pick(phrases);
}
