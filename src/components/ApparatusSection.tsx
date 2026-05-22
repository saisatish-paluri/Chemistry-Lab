"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Apparatus {
  id:       string;
  name:     string;
  category: string;
  use:      string;
  material: string;
  unit:     string;
  accent:   string;
  render:   React.ReactNode;
}

const ITEMS: Apparatus[] = [
  {
    id: "burette",
    name: "Burette",
    category: "Volumetric",
    use: "Delivers precise, adjustable volumes of titrant during acid-base titrations. The stopcock allows drop-by-drop control near the endpoint.",
    material: "Borosilicate glass",
    unit: "50 mL, 0.05 mL divisions",
    accent: "#2563eb",
    render: <BuretteRender />,
  },
  {
    id: "conical-flask",
    name: "Conical Flask",
    category: "Glassware",
    use: "Holds the analyte solution during titration. The conical shape allows vigorous swirling without risk of splashing or spillage.",
    material: "Borosilicate glass",
    unit: "100 mL, 250 mL, 500 mL",
    accent: "#0891b2",
    render: <ConicalFlaskRender />,
  },
  {
    id: "bunsen-burner",
    name: "Bunsen Burner",
    category: "Heating",
    use: "Provides a controlled gas flame for heating solutions, performing flame tests, and boiling liquids. Air-hole controls flame type and temperature.",
    material: "Cast iron, rubber tubing",
    unit: "Gas flow rate: 0–5 L/min",
    accent: "#ea580c",
    render: <BunsenRender />,
  },
  {
    id: "beaker",
    name: "Beaker",
    category: "Glassware",
    use: "General-purpose reaction vessel for mixing, heating, and short-term storage. Wide mouth allows easy addition of reagents.",
    material: "Borosilicate glass",
    unit: "50 mL – 2 000 mL",
    accent: "#059669",
    render: <BeakerRender />,
  },
  {
    id: "nichrome-loop",
    name: "Nichrome Wire Loop",
    category: "Flame Test",
    use: "Carries a small sample of metal salt into the Bunsen flame. Nichrome alloy is chemically inert and does not produce interfering flame colours.",
    material: "Nickel-chromium alloy",
    unit: "Loop diameter: ~3 mm",
    accent: "#d97706",
    render: <LoopRender />,
  },
  {
    id: "dc-power-supply",
    name: "DC Power Supply",
    category: "Electrical",
    use: "Provides variable, stabilised DC voltage for electrolysis experiments. Digital display shows exact voltage and current output.",
    material: "Electronic components",
    unit: "0–12 V, 0–3 A",
    accent: "#7c3aed",
    render: <PowerSupplyRender />,
  },
  {
    id: "electrode",
    name: "Carbon / Platinum Electrode",
    category: "Electrical",
    use: "Inert conductor submerged in electrolyte solution to complete the electrical circuit and allow ion discharge at the electrode surface.",
    material: "Graphite or platinum wire",
    unit: "Rod: 6 mm × 80 mm",
    accent: "#475569",
    render: <ElectrodeRender />,
  },
  {
    id: "hofmann-voltameter",
    name: "Hofmann Voltameter",
    category: "Electrolysis",
    use: "Two inverted graduated tubes collect gases evolved at each electrode during electrolysis. Allows direct comparison of gas volumes.",
    material: "Borosilicate glass, platinum",
    unit: "Tube capacity: ~25 mL each",
    accent: "#0891b2",
    render: <HofmannRender />,
  },
  {
    id: "indicator",
    name: "Indicator Solution",
    category: "Volumetric",
    use: "Added to the analyte in small quantities. Changes colour as pH crosses the indicator's transition range, providing a visual endpoint signal.",
    material: "Organic dye in ethanol/water",
    unit: "2–3 drops per 25 mL sample",
    accent: "#db2777",
    render: <IndicatorRender />,
  },
  {
    id: "measuring-cylinder",
    name: "Measuring Cylinder",
    category: "Volumetric",
    use: "Measures approximate liquid volumes. Less precise than a burette or pipette; suitable for reagent preparation not requiring high accuracy.",
    material: "Borosilicate glass or polypropylene",
    unit: "10 mL – 1 000 mL, ±2%",
    accent: "#0284c7",
    render: <CylinderRender />,
  },
  {
    id: "test-tube",
    name: "Test Tube",
    category: "Glassware",
    use: "Small reaction vessel for qualitative tests, solubility studies, and small-scale reactions. Held in a rack or with tongs during heating.",
    material: "Borosilicate glass",
    unit: "16 × 150 mm typical",
    accent: "#16a34a",
    render: <TestTubeRender />,
  },
  {
    id: "dropper",
    name: "Dropping Pipette",
    category: "Volumetric",
    use: "Delivers individual drops of reagent. The rubber bulb provides suction to draw up liquid; releasing slowly delivers one drop at a time (~0.05 mL).",
    material: "Glass with rubber bulb",
    unit: "~0.05 mL per drop",
    accent: "#9333ea",
    render: <DropperRender />,
  },
  {
    id: "evaporating-dish",
    name: "Evaporating Dish",
    category: "Heating",
    use: "Wide, shallow vessel used to evaporate solvent and recover dissolved solids. The large surface area accelerates evaporation when heated.",
    material: "Porcelain or borosilicate glass",
    unit: "50–150 mL capacity",
    accent: "#b45309",
    render: <EvapDishRender />,
  },
  {
    id: "thermometer",
    name: "Laboratory Thermometer",
    category: "Measuring",
    use: "Measures solution temperature during reactions. Critical for calorimetry experiments and distillation fraction identification.",
    material: "Glass, mercury or alcohol fill",
    unit: "−10 to 110 °C, ±0.1 °C",
    accent: "#ef4444",
    render: <ThermometerRender />,
  },
  {
    id: "chromatography-paper",
    name: "Chromatography Paper",
    category: "Separation",
    use: "Stationary phase for paper chromatography. Cellulose fibres absorb polar substances and retard their migration relative to the mobile phase.",
    material: "Cellulose (Whatman No.1)",
    unit: "20 × 20 cm sheets",
    accent: "#0d9488",
    render: <ChromaPaperRender />,
  },
  {
    id: "condenser",
    name: "Liebig Condenser",
    category: "Separation",
    use: "Cools vapour back to liquid during distillation. Cold water circulates through the outer jacket, condensing the inner vapour stream.",
    material: "Borosilicate glass",
    unit: "Length: 300–400 mm",
    accent: "#0369a1",
    render: <CondenserRender />,
  },
];

const CATEGORIES = ["All", ...Array.from(new Set(ITEMS.map((i) => i.category)))];

const CATEGORY_COLORS: Record<string, string> = {
  Glassware:    "#0891b2",
  Volumetric:   "#2563eb",
  Heating:      "#ea580c",
  "Flame Test": "#d97706",
  Electrical:   "#7c3aed",
  Electrolysis: "#0891b2",
  Measuring:    "#059669",
  Separation:   "#0d9488",
};

export default function ApparatusSection() {
  const [active, setActive] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");

  const shown  = filter === "All" ? ITEMS : ITEMS.filter((i) => i.category === filter);
  const detail = active ? ITEMS.find((i) => i.id === active) : null;

  return (
    <section
      id="apparatus"
      className="py-20 px-6"
      style={{ background: "var(--lab-off-white)" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          viewport={{ once: true, margin: "-80px" }}
          className="mb-10"
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-3"
             style={{ color: "var(--lab-blue-600)" }}>
            Laboratory Equipment
          </p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight"
                  style={{ color: "var(--lab-text-primary)" }}>
                Apparatus <span className="gradient-text">Reference</span>
              </h2>
              <p className="mt-3 text-base max-w-xl" style={{ color: "var(--lab-text-muted)" }}>
                Every instrument you will encounter in the virtual lab — with materials, capacity, and role in each procedure.
              </p>
            </div>
            <div className="text-right hidden md:block">
              <span className="text-3xl font-black gradient-text">{ITEMS.length}</span>
              <p className="text-xs" style={{ color: "var(--lab-text-subtle)" }}>items catalogued</p>
            </div>
          </div>
        </motion.div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => {
            const catColor = CATEGORY_COLORS[cat] ?? "#2563eb";
            const isActive = filter === cat;
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150"
                style={{
                  background:  isActive ? catColor : "transparent",
                  borderColor: isActive ? catColor : "var(--lab-glass-border)",
                  color:       isActive ? "white" : "var(--lab-text-muted)",
                  boxShadow:   isActive ? `0 2px 8px ${catColor}33` : "none",
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="flex gap-6 items-start">
          {/* Grid */}
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 flex-1">
            <AnimatePresence mode="popLayout">
              {shown.map((item, i) => {
                const isSelected = active === item.id;
                return (
                  <motion.button
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.88 }}
                    transition={{ duration: 0.22, delay: i * 0.03 }}
                    whileHover={{ y: -3, transition: { duration: 0.15 } }}
                    onClick={() => setActive(isSelected ? null : item.id)}
                    className="flex flex-col rounded-2xl border text-left overflow-hidden transition-all duration-150"
                    style={{
                      background:  isSelected ? `${item.accent}08` : "var(--lab-glass-heavy)",
                      borderColor: isSelected ? item.accent + "55" : "var(--lab-glass-border)",
                      boxShadow:   isSelected
                        ? `0 6px 24px ${item.accent}22`
                        : "var(--lab-shadow-sm)",
                    }}
                    aria-pressed={isSelected}
                  >
                    {/* Image area */}
                    <div
                      className="flex items-center justify-center h-28 w-full"
                      style={{ background: `${item.accent}08` }}
                    >
                      <div style={{ color: item.accent, width: 64, height: 64 }}>
                        {item.render}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="px-3 py-2.5">
                      <p className="text-xs font-bold leading-tight mb-0.5"
                         style={{ color: "var(--lab-text-primary)" }}>
                        {item.name}
                      </p>
                      <span
                        className="inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                        style={{ background: `${item.accent}14`, color: item.accent }}
                      >
                        {item.category}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {/* Detail panel */}
          <AnimatePresence>
            {detail && (
              <motion.div
                key={detail.id}
                initial={{ opacity: 0, x: 20, scale: 0.97 }}
                animate={{ opacity: 1, x: 0,  scale: 1    }}
                exit={{   opacity: 0, x: 16,  scale: 0.97 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="w-64 flex-shrink-0 rounded-2xl overflow-hidden self-start sticky top-24"
                style={{
                  background:  "var(--lab-glass-heavy)",
                  border:      `1px solid ${detail.accent}40`,
                  boxShadow:   `0 8px 32px ${detail.accent}1a`,
                }}
              >
                {/* Header render */}
                <div
                  className="flex items-center justify-center h-36"
                  style={{ background: `${detail.accent}0a` }}
                >
                  <div style={{ color: detail.accent, width: 80, height: 80 }}>
                    {detail.render}
                  </div>
                </div>

                <div className="p-5">
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ background: `${detail.accent}12`, color: detail.accent }}
                  >
                    {detail.category}
                  </span>
                  <h3 className="text-base font-bold mt-2 mb-1"
                      style={{ color: "var(--lab-text-primary)" }}>
                    {detail.name}
                  </h3>

                  <p className="text-xs leading-relaxed mb-4"
                     style={{ color: "var(--lab-text-muted)" }}>
                    {detail.use}
                  </p>

                  <div className="space-y-1.5 text-[10.5px]"
                       style={{ color: "var(--lab-text-muted)" }}>
                    <div className="flex justify-between border-t pt-1.5"
                         style={{ borderColor: "var(--lab-glass-border)" }}>
                      <span style={{ color: "var(--lab-text-subtle)" }}>Material</span>
                      <span className="font-medium text-right ml-2" style={{ color: "var(--lab-text-secondary)" }}>
                        {detail.material}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-1.5"
                         style={{ borderColor: "var(--lab-glass-border)" }}>
                      <span style={{ color: "var(--lab-text-subtle)" }}>Capacity / Size</span>
                      <span className="font-medium text-right ml-2" style={{ color: "var(--lab-text-secondary)" }}>
                        {detail.unit}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActive(null)}
                    className="mt-4 text-[10px] font-semibold transition-colors hover:text-blue-600"
                    style={{ color: "var(--lab-text-subtle)" }}
                  >
                    × Close
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

// ── Detailed SVG renders ──────────────────────────────────────────────────────
// Each render is a realistic SVG illustration at 64×64 (or 80×80 in detail panel via CSS scale)

function BuretteRender() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <rect x="26" y="4" width="12" height="36" rx="2" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5" />
      <line x1="27" y1="14" x2="37" y2="14" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
      <line x1="27" y1="20" x2="37" y2="20" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
      <line x1="27" y1="26" x2="37" y2="26" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
      <line x1="27" y1="32" x2="37" y2="32" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
      <rect x="22" y="39" width="20" height="6" rx="3" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M32 45 L32 58" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* stopcock */}
      <rect x="28" y="40" width="8" height="4" rx="2" fill="currentColor" opacity="0.6" />
      {/* liquid fill */}
      <rect x="27.5" y="5" width="9" height="20" rx="1" fill="currentColor" fillOpacity="0.25" />
    </svg>
  );
}

function ConicalFlaskRender() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <path d="M26 6 L26 22 L10 52 L54 52 L38 22 L38 6 Z"
            fill="currentColor" fillOpacity="0.10" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="22" y1="6" x2="42" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      {/* liquid */}
      <path d="M18 44 L46 44 L50 52 L14 52 Z" fill="currentColor" fillOpacity="0.3" />
      <path d="M16 44 Q32 41 48 44" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      {/* meniscus lines */}
      <path d="M22 30 Q32 28 42 30" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.3" />
    </svg>
  );
}

function BunsenRender() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      {/* Base */}
      <ellipse cx="32" cy="58" rx="18" ry="4" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.2" />
      {/* Barrel */}
      <rect x="26" y="28" width="12" height="30" rx="2" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.3" />
      {/* Air hole */}
      <ellipse cx="32" cy="44" rx="6" ry="2" fill="currentColor" fillOpacity="0.3" />
      {/* Gas tube */}
      <rect x="29" y="20" width="6" height="12" rx="1" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.2" />
      {/* Flame */}
      <path d="M27 18 C27 12 31 8 32 5 C33 8 37 12 37 18"
            fill="currentColor" fillOpacity="0.5" />
      <path d="M29 18 C29 14 31 10 32 8 C33 10 35 14 35 18"
            fill="currentColor" fillOpacity="0.8" />
    </svg>
  );
}

function BeakerRender() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <path d="M16 8 L48 8 M16 8 L12 56 Q12 60 32 60 Q52 60 52 56 L48 8"
            fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* spout */}
      <path d="M48 14 L54 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* liquid */}
      <path d="M14 44 L50 44 L52 56 Q52 60 32 60 Q12 60 12 56 L14 44 Z"
            fill="currentColor" fillOpacity="0.25" />
      <path d="M14 44 Q32 41 50 44" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.5" />
      {/* graduation marks */}
      <line x1="15" y1="30" x2="20" y2="30" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      <line x1="14" y1="38" x2="20" y2="38" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
    </svg>
  );
}

function LoopRender() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      {/* Handle */}
      <rect x="28" y="36" width="8" height="24" rx="4" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.3" />
      {/* Wire */}
      <path d="M32 36 L28 22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      {/* Loop */}
      <circle cx="24" cy="16" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
      {/* sample glowing dot */}
      <circle cx="24" cy="16" r="3" fill="currentColor" fillOpacity="0.4" />
    </svg>
  );
}

function PowerSupplyRender() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <rect x="8" y="18" width="48" height="34" rx="4" fill="currentColor" fillOpacity="0.10" stroke="currentColor" strokeWidth="1.5" />
      {/* Screen */}
      <rect x="14" y="24" width="22" height="14" rx="2" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1" />
      <text x="25" y="34" textAnchor="middle" fontSize="8" fill="currentColor" fontWeight="700">12.0V</text>
      {/* Knob */}
      <circle cx="48" cy="31" r="6" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.3" />
      <line x1="48" y1="25" x2="48" y2="28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Terminals */}
      <circle cx="24" cy="46" r="4" fill="currentColor" fillOpacity="0.6" />
      <circle cx="36" cy="46" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <text x="24" y="49" textAnchor="middle" fontSize="7" fill="white" fontWeight="800">−</text>
      <text x="36" y="49" textAnchor="middle" fontSize="7" fill="currentColor" fontWeight="800">+</text>
      {/* Leads */}
      <line x1="10" y1="10" x2="24" y2="18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="52" y1="10" x2="36" y2="18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function ElectrodeRender() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <rect x="27" y="4" width="10" height="50" rx="3" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5" />
      {/* Connection at top */}
      <rect x="28" y="4" width="8" height="4" rx="2" fill="currentColor" fillOpacity="0.5" />
      {/* Bubble dots */}
      <circle cx="22" cy="40" r="2"   fill="currentColor" fillOpacity="0.4" />
      <circle cx="44" cy="36" r="1.5" fill="currentColor" fillOpacity="0.3" />
      <circle cx="24" cy="32" r="1.5" fill="currentColor" fillOpacity="0.35" />
      <circle cx="42" cy="44" r="2"   fill="currentColor" fillOpacity="0.4" />
      <circle cx="22" cy="48" r="1.2" fill="currentColor" fillOpacity="0.25" />
    </svg>
  );
}

function HofmannRender() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      {/* Left tube */}
      <rect x="8"  y="10" width="16" height="44" rx="3" fill="currentColor" fillOpacity="0.10" stroke="currentColor" strokeWidth="1.3" />
      {/* Right tube */}
      <rect x="40" y="10" width="16" height="44" rx="3" fill="currentColor" fillOpacity="0.10" stroke="currentColor" strokeWidth="1.3" />
      {/* Connecting bottom */}
      <path d="M24 48 Q32 54 40 48" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {/* Gas in left tube (more) */}
      <rect x="9"  y="11" width="14" height="14" rx="2" fill="currentColor" fillOpacity="0.22" />
      {/* Gas in right tube (less) */}
      <rect x="41" y="11" width="14" height="22" rx="2" fill="currentColor" fillOpacity="0.22" />
      {/* Graduation marks */}
      <line x1="9"  y1="20" x2="13" y2="20" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      <line x1="9"  y1="26" x2="13" y2="26" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      <line x1="41" y1="26" x2="45" y2="26" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      <line x1="41" y1="32" x2="45" y2="32" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      {/* Electrode wires */}
      <line x1="16" y1="10" x2="16" y2="4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="48" y1="10" x2="48" y2="4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function IndicatorRender() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <rect x="22" y="8"  width="20" height="44" rx="5" fill="currentColor" fillOpacity="0.10" stroke="currentColor" strokeWidth="1.5" />
      {/* Two-colour fill (colourless on top, coloured below) */}
      <rect x="23" y="9"  width="18" height="22" rx="3" fill="currentColor" fillOpacity="0.05" />
      <rect x="23" y="31" width="18" height="20" rx="3" fill="currentColor" fillOpacity="0.45" />
      {/* Bulb cap */}
      <rect x="20" y="51" width="24" height="8"  rx="4" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.2" />
      {/* Split line */}
      <line x1="22" y1="31" x2="42" y2="31" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.6" />
      <text x="32" y="44" textAnchor="middle" fontSize="6.5" fill="currentColor" fontWeight="600">pH 8-10</text>
    </svg>
  );
}

function CylinderRender() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <rect x="20" y="6"  width="24" height="52" rx="5" fill="currentColor" fillOpacity="0.10" stroke="currentColor" strokeWidth="1.5" />
      {/* Liquid */}
      <rect x="21" y="32" width="22" height="25" rx="4" fill="currentColor" fillOpacity="0.28" />
      <path d="M21 32 Q32 29.5 43 32" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.6" />
      {/* Graduation lines */}
      {[14, 20, 26, 32, 38, 44, 50].map((y) => (
        <line key={y} x1="21" y1={y} x2={y % 14 === 0 ? 29 : 26} y2={y} stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      ))}
      {/* Base */}
      <ellipse cx="32" cy="57" rx="12" ry="3" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function TestTubeRender() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <path d="M24 6 L24 46 Q24 58 32 58 Q40 58 40 46 L40 6"
            fill="currentColor" fillOpacity="0.10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="6" x2="44" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Liquid */}
      <path d="M25 38 L39 38 L39 46 Q39 57 32 57 Q25 57 25 46 Z" fill="currentColor" fillOpacity="0.35" />
      <path d="M25 38 Q32 35.5 39 38" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.6" />
    </svg>
  );
}

function DropperRender() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      {/* Rubber bulb */}
      <ellipse cx="32" cy="14" rx="10" ry="12" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.3" />
      {/* Glass tube */}
      <rect x="28" y="24" width="8" height="28" rx="3" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.3" />
      {/* Tip */}
      <path d="M29.5 52 L32 60 L34.5 52" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
      {/* Liquid in tube */}
      <rect x="29" y="28" width="6" height="16" rx="2" fill="currentColor" fillOpacity="0.35" />
      {/* Drop falling */}
      <path d="M32 60 Q32 64 32 64" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      <ellipse cx="32" cy="65" rx="2" ry="2.5" fill="currentColor" fillOpacity="0.3" />
    </svg>
  );
}

function EvapDishRender() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      {/* Dish profile */}
      <path d="M8 36 Q8 52 32 52 Q56 52 56 36 L56 32 Q56 28 32 28 Q8 28 8 32 Z"
            fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5" />
      {/* Rim */}
      <ellipse cx="32" cy="32" rx="24" ry="6" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.3" />
      {/* Crystal deposits */}
      {[20, 28, 36, 44].map((x, i) => (
        <rect key={i} x={x} y="42" width="4" height="4" fill="white" stroke="currentColor" strokeWidth="0.6"
              transform={`rotate(${i * 22}, ${x + 2}, 44)`} fillOpacity="0.8" />
      ))}
      {/* Solution */}
      <ellipse cx="32" cy="40" rx="20" ry="4" fill="currentColor" fillOpacity="0.2" />
    </svg>
  );
}

function ThermometerRender() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      {/* Stem */}
      <rect x="29" y="6" width="6" height="44" rx="3" fill="currentColor" fillOpacity="0.10" stroke="currentColor" strokeWidth="1.3" />
      {/* Mercury column */}
      <rect x="30.5" y="20" width="3" height="30" rx="1.5" fill="currentColor" fillOpacity="0.6" />
      {/* Bulb */}
      <circle cx="32" cy="54" r="7" fill="currentColor" fillOpacity="0.7" stroke="currentColor" strokeWidth="1.3" />
      {/* Graduation lines */}
      {[12, 18, 24, 30, 36, 42].map((y) => (
        <line key={y} x1="35" y1={y} x2={y % 12 === 0 ? 41 : 38} y2={y} stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      ))}
    </svg>
  );
}

function ChromaPaperRender() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <rect x="12" y="4" width="40" height="52" rx="2" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.3" />
      {/* Baseline */}
      <line x1="12" y1="46" x2="52" y2="46" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
      {/* Solvent front */}
      <line x1="12" y1="12" x2="52" y2="12" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" opacity="0.4" />
      {/* Spots at different heights */}
      <circle cx="24" cy="28" r="4" fill="#2563eb" fillOpacity="0.8" />
      <circle cx="32" cy="36" r="4" fill="#dc2626" fillOpacity="0.7" />
      <circle cx="40" cy="20" r="4" fill="#16a34a" fillOpacity="0.8" />
      {/* Sample spots on baseline */}
      <circle cx="24" cy="46" r="2" fill="#2563eb" fillOpacity="0.5" />
      <circle cx="32" cy="46" r="2" fill="#dc2626" fillOpacity="0.4" />
      <circle cx="40" cy="46" r="2" fill="#16a34a" fillOpacity="0.5" />
      <text x="32" y="57" textAnchor="middle" fontSize="6" fill="currentColor" opacity="0.5">Rf reference</text>
    </svg>
  );
}

function CondenserRender() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      {/* Outer jacket */}
      <rect x="8" y="20" width="48" height="18" rx="4" fill="currentColor" fillOpacity="0.10" stroke="currentColor" strokeWidth="1.4" />
      {/* Inner tube */}
      <rect x="4" y="25" width="56" height="8" rx="4" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1" />
      {/* Water inlet/outlet */}
      <path d="M14 20 L14 14 M50 38 L50 44"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="14" cy="13" rx="4" ry="2" stroke="currentColor" strokeWidth="1" fillOpacity="0" />
      <ellipse cx="50" cy="45" rx="4" ry="2" stroke="currentColor" strokeWidth="1" fillOpacity="0" />
      {/* Flow arrows */}
      <text x="18" y="12" fontSize="7" fill="currentColor" opacity="0.6">water in ↑</text>
      <text x="22" y="51" fontSize="7" fill="currentColor" opacity="0.6">water out ↓</text>
      {/* Vapour condensing */}
      <path d="M6 29 Q32 27 58 29" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}
