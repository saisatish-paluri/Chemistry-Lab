import type { UnknownValueConfig, GeneratedUnknown, SessionUnknowns } from "./types";

// FNV-1a hash — maps a session ID string to a stable 32-bit seed
function hashToSeed(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// Mulberry32 — fast, high-quality 32-bit PRNG
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Creates a deterministic unknown-value generator bound to a session ID.
 * All values produced for the same sessionId are reproducible.
 */
export function createUnknownGenerator(sessionId: string) {
  const rng = mulberry32(hashToSeed(sessionId));

  function generate(config: UnknownValueConfig): GeneratedUnknown {
    const raw = config.min + rng() * (config.max - config.min);
    const value = parseFloat(raw.toFixed(config.decimalPlaces));
    return {
      configId:    config.id,
      label:       config.label,
      value,
      unit:        config.unit,
      formatted:   `${value} ${config.unit}`.trim(),
      sessionId,
      generatedAt: Date.now(),
    };
  }

  return {
    /** Generate a single unknown value from a config. */
    generate,

    /** Generate all unknowns for a list of configs in order. */
    generateAll(configs: UnknownValueConfig[]): GeneratedUnknown[] {
      return configs.map(generate);
    },

    /** Build the full SessionUnknowns record for persistence. */
    buildSessionUnknowns(configs: UnknownValueConfig[]): SessionUnknowns {
      return {
        sessionId,
        unknowns:  configs.map(generate),
        createdAt: Date.now(),
      };
    },
  };
}

/**
 * Produces a unique, URL-safe session identifier.
 * Format: `<experimentId>_<base36-timestamp>_<5-char random>`
 */
export function generateSessionId(experimentId: string): string {
  const ts   = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 7);
  return `${experimentId}_${ts}_${rand}`;
}
