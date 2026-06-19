/**
 * Catalog / dashboard metadata consistency tests.
 * Catches drift between experiments-catalog.ts, active-lab-store.ts,
 * and DashboardClient.tsx before it reaches production.
 */
import { describe, it, expect } from "vitest";
import CATALOG, {
  EXPERIMENT_LABEL_MAP,
  EXPERIMENT_ACCENT_MAP,
  EXPERIMENT_SUBJECT_MAP,
  getExperiment,
} from "@/lib/experiments-catalog";
import { EXPERIMENT_META } from "@/lib/store/active-lab-store";

// ── Catalog integrity ────────────────────────────────────────────────────────

describe("CATALOG — basic integrity", () => {
  it("has exactly 30 experiments", () => {
    expect(CATALOG).toHaveLength(30);
  });

  it("every entry has a non-empty slug, href, title, subject, and accent", () => {
    for (const e of CATALOG) {
      expect(e.slug,    `slug missing in "${e.title}"`).toBeTruthy();
      expect(e.href,    `href missing in "${e.title}"`).toBeTruthy();
      expect(e.title,   `title missing for slug "${e.slug}"`).toBeTruthy();
      expect(e.subject, `subject missing in "${e.title}"`).toBeTruthy();
      expect(e.accent,  `accent missing in "${e.title}"`).toBeTruthy();
    }
  });

  it("every href matches /experiments/<slug>", () => {
    for (const e of CATALOG) {
      expect(e.href).toBe(`/experiments/${e.slug}`);
    }
  });

  it("no duplicate slugs", () => {
    const slugs = CATALOG.map((e) => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every entry has at least one classLevel and one feature", () => {
    for (const e of CATALOG) {
      expect(e.classLevels.length, `No classLevels for "${e.title}"`).toBeGreaterThan(0);
      expect(e.features.length,    `No features for "${e.title}"`).toBeGreaterThan(0);
    }
  });

  it("all difficulty values are Beginner | Intermediate | Advanced", () => {
    const valid = new Set(["Beginner", "Intermediate", "Advanced"]);
    for (const e of CATALOG) {
      expect(valid.has(e.difficulty), `Bad difficulty "${e.difficulty}" in "${e.title}"`).toBe(true);
    }
  });
});

// ── Derived maps ─────────────────────────────────────────────────────────────

describe("EXPERIMENT_LABEL_MAP / ACCENT / SUBJECT derived maps", () => {
  it("EXPERIMENT_LABEL_MAP has an entry for every catalog href", () => {
    for (const e of CATALOG) {
      expect(EXPERIMENT_LABEL_MAP[e.href], `Missing label map entry for "${e.href}"`).toBe(e.title);
    }
  });

  it("EXPERIMENT_ACCENT_MAP has an entry for every catalog href", () => {
    for (const e of CATALOG) {
      expect(EXPERIMENT_ACCENT_MAP[e.href], `Missing accent map entry for "${e.href}"`).toBe(e.accent);
    }
  });

  it("EXPERIMENT_SUBJECT_MAP has an entry for every catalog href", () => {
    for (const e of CATALOG) {
      expect(EXPERIMENT_SUBJECT_MAP[e.href], `Missing subject map entry for "${e.href}"`).toBe(e.subject);
    }
  });
});

// ── active-lab-store EXPERIMENT_META sync ────────────────────────────────────

describe("EXPERIMENT_META (active-lab-store) matches catalog", () => {
  it("has an EXPERIMENT_META entry for every catalog experiment", () => {
    for (const e of CATALOG) {
      const meta = EXPERIMENT_META[e.href];
      expect(meta, `Missing EXPERIMENT_META entry for "${e.href}"`).toBeDefined();
    }
  });

  it("EXPERIMENT_META accents match catalog accents", () => {
    for (const e of CATALOG) {
      const meta = EXPERIMENT_META[e.href];
      if (!meta) continue; // covered by above test
      expect(meta.accent).toBe(e.accent);
    }
  });

  it("EXPERIMENT_META difficulty matches catalog difficulty", () => {
    for (const e of CATALOG) {
      const meta = EXPERIMENT_META[e.href];
      if (!meta) continue;
      expect(meta.difficulty).toBe(e.difficulty);
    }
  });

  it("no EXPERIMENT_META entries that don't exist in the catalog", () => {
    const catalogHrefs = new Set(CATALOG.map((e) => e.href));
    for (const href of Object.keys(EXPERIMENT_META)) {
      expect(catalogHrefs.has(href), `EXPERIMENT_META has stale entry for "${href}"`).toBe(true);
    }
  });
});

// ── Helper functions ─────────────────────────────────────────────────────────

describe("getExperiment helper", () => {
  it("returns the correct entry for a known slug", () => {
    const entry = getExperiment("titration");
    expect(entry?.title).toBe("Acid-Base Titration");
  });

  it("returns undefined for an unknown slug", () => {
    expect(getExperiment("nonexistent")).toBeUndefined();
  });
});
