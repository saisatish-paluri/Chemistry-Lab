"use client";

import { motion } from "framer-motion";
import { useActiveLabStore, DIFFICULTY_STYLE } from "@/lib/store/active-lab-store";

const LAB_MOLECULES: Record<string, { label: string; key: string }[]> = {
  "/experiments/neutralization": [
    { label: "Water (H₂O)", key: "H2O" },
    { label: "Hydrogen Chloride (HCl)", key: "HCl" },
    { label: "Sodium Chloride (NaCl)", key: "NaCl" },
    { label: "Carbon Dioxide (CO₂)", key: "CO2" }
  ],
  "/experiments/gas-collection": [
    { label: "Carbon Dioxide (CO₂)", key: "CO2" },
    { label: "Water (H₂O)", key: "H2O" },
    { label: "Ammonia (NH₃)", key: "NH3" },
    { label: "Oxygen Gas (O₂)", key: "O2" },
    { label: "Nitrogen Gas (N₂)", key: "N2" }
  ],
  "/experiments/dissolving-rate": [
    { label: "Water (H₂O)", key: "H2O" },
    { label: "Ethanol (C₂H₅OH)", key: "C2H5OH" }
  ],
  "/experiments/chemical-equilibrium": [
    { label: "Water (H₂O)", key: "H2O" },
    { label: "Carbon Dioxide (CO₂)", key: "CO2" }
  ],
  "/experiments/flame-test": [
    { label: "Methane (CH₄)", key: "CH4" },
    { label: "Ethylene (C₂H₄)", key: "C2H4" },
    { label: "Acetylene (C₂H₂)", key: "C2H2" },
    { label: "Carbon Tetrachloride (CCl₄)", key: "CCl4" }
  ],
  "/experiments/electrolysis": [
    { label: "Water (H₂O)", key: "H2O" },
    { label: "Oxygen Gas (O₂)", key: "O2" },
    { label: "Nitrogen Gas (N₂)", key: "N2" }
  ],
  "/experiments/gas-laws": [
    { label: "Methane (CH₄)", key: "CH4" },
    { label: "Nitrogen Gas (N₂)", key: "N2" },
    { label: "Carbon Dioxide (CO₂)", key: "CO2" },
    { label: "Ammonia (NH₃)", key: "NH3" }
  ],
  "/experiments/titration": [
    { label: "Hydrogen Chloride (HCl)", key: "HCl" },
    { label: "Water (H₂O)", key: "H2O" },
    { label: "Sodium Chloride (NaCl)", key: "NaCl" },
    { label: "Acetic Acid (CH₃COOH)", key: "CH3COOH" }
  ],
  "/experiments/solubility": [
    { label: "Sodium Chloride (NaCl)", key: "NaCl" },
    { label: "Water (H₂O)", key: "H2O" },
    { label: "Ethanol (C₂H₅OH)", key: "C2H5OH" }
  ],
  "/experiments/salt-analysis": [
    { label: "Sodium Chloride (NaCl)", key: "NaCl" },
    { label: "Water (H₂O)", key: "H2O" },
    { label: "Carbon Dioxide (CO₂)", key: "CO2" },
    { label: "Ammonia (NH₃)", key: "NH3" }
  ],
  "/experiments/functional-groups": [
    { label: "Ethanol (C₂H₅OH)", key: "C2H5OH" },
    { label: "Acetic Acid (CH₃COOH)", key: "CH3COOH" },
    { label: "Benzene (C₆H₆)", key: "C6H6" },
    { label: "Ethylene (C₂H₄)", key: "C2H4" }
  ],
  "/experiments/chromatography": [
    { label: "Water (H₂O)", key: "H2O" },
    { label: "Ethanol (C₂H₅OH)", key: "C2H5OH" }
  ],
  "/experiments/reaction-rate": [
    { label: "Carbon Dioxide (CO₂)", key: "CO2" },
    { label: "Water (H₂O)", key: "H2O" }
  ],
  "/experiments/calorimetry": [
    { label: "Water (H₂O)", key: "H2O" }
  ],
  "/experiments/water-hardness": [
    { label: "Water (H₂O)", key: "H2O" },
    { label: "Carbon Dioxide (CO₂)", key: "CO2" }
  ]
};

// Renders a premium card inside the lab env — same quality as home page LabPreview cards.
export default function LabInfoCard() {
  const title      = useActiveLabStore((s) => s.title);
  const href       = useActiveLabStore((s) => s.href);
  const accent     = useActiveLabStore((s) => s.accent);
  const bg         = useActiveLabStore((s) => s.bg);
  const difficulty = useActiveLabStore((s) => s.difficulty);
  const features   = useActiveLabStore((s) => s.features);
  const desc       = useActiveLabStore((s) => s.desc);
  const isActive   = useActiveLabStore((s) => s.isActive);

  if (!isActive) return null;

  const ds = DIFFICULTY_STYLE[difficulty];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border overflow-hidden"
      style={{
        background:     "var(--lab-glass-heavy)",
        borderColor:    accent + "30",
        boxShadow:      `0 8px 32px ${accent}14, var(--lab-shadow-sm)`,
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Accent bar */}
      <div
        className="h-0.5 w-full"
        style={{ background: `linear-gradient(90deg, ${accent}70, ${accent}, ${accent}70)` }}
      />

      {/* Icon area — tinted bg like home page cards */}
      <div
        className="relative flex items-center gap-3 px-4 py-3.5 border-b"
        style={{
          background:  bg,
          borderColor: accent + "20",
        }}
      >
        {/* Subtle radial glow */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 0% 50%, ${accent}12 0%, transparent 60%)`,
          }}
        />
        <div
          className="relative w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: `${accent}14`,
            border:     `1.5px solid ${accent}24`,
            color:      accent,
          }}
        >
          <LabFlaskIcon />
        </div>
        <div className="min-w-0 relative">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
            style={{ color: accent + "cc" }}>
            Current Experiment
          </p>
          <p className="text-sm font-bold leading-tight truncate"
            style={{ color: "var(--lab-text-primary)" }}>
            {title}
          </p>
        </div>
        {/* Difficulty badge */}
        <span
          className="text-[9px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ml-auto"
          style={{ background: ds.bg, color: ds.color, borderColor: ds.border }}
        >
          {difficulty}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Description */}
        <p className="text-[11.5px] leading-relaxed" style={{ color: "var(--lab-text-muted)" }}>
          {desc}
        </p>

        {/* Feature pills — exact same style as home page */}
        {features.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {features.map((f) => (
              <span
                key={f}
                className="text-[9.5px] px-2 py-0.5 rounded-full border font-medium"
                style={{
                  background:  bg,
                  borderColor: accent + "40",
                  color:       accent,
                }}
              >
                {f}
              </span>
            ))}
          </div>
        )}

        {/* Related 3D Molecules inspect section */}
        {(() => {
          const related = LAB_MOLECULES[href] || [];
          if (related.length === 0) return null;
          return (
            <div className="border-t pt-3" style={{ borderColor: accent + "18" }}>
              <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: accent }}>
                3D Molecular Models
              </p>
              <div className="flex flex-col gap-1.5 mb-3">
                {related.map((mol) => (
                  <button
                    key={mol.key}
                    onClick={() => window.dispatchEvent(new CustomEvent("open-3d-builder", { detail: { molecule: mol.key } }))}
                    className="flex items-center justify-between w-full px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all hover:bg-white/50 hover:-translate-y-0.5 active:scale-95 text-left cursor-pointer"
                    style={{
                      background: "rgba(255, 255, 255, 0.40)",
                      borderColor: accent + "18",
                      color: "var(--lab-text-secondary)"
                    }}
                  >
                    <span>{mol.label}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md font-extrabold uppercase tracking-wide bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                      Inspect 3D
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Status row */}
        <div className="flex items-center justify-between pt-1 border-t"
          style={{ borderColor: "var(--lab-glass-border)" }}>
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full live-dot flex-shrink-0"
              style={{ background: accent, boxShadow: `0 0 6px ${accent}99` }}
            />
            <span className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: accent }}>
              Lab Active
            </span>
          </div>
          <span className="text-[9px] font-medium" style={{ color: "var(--lab-text-subtle)" }}>
            Real-time simulation
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function LabFlaskIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M6 2.5h6M6 2.5v5.5L3 14.5h12L12 8V2.5"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
      <path d="M5.5 12 Q9 10.5 12.5 12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}
