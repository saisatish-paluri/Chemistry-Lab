"use client";

import { useState, useRef, useCallback, useEffect, startTransition } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { elements, ChemElement, ElementCategory, CATEGORY_LABELS, ELEMENT_EXTRAS } from "./data";
import ElementTile from "./ElementTile";

const LEGEND_CATEGORIES: { cat: ElementCategory; label: string }[] = [
  { cat: "alkali-metal",          label: "Alkali Metal" },
  { cat: "alkaline-earth",        label: "Alkaline Earth" },
  { cat: "transition-metal",      label: "Transition Metal" },
  { cat: "post-transition-metal", label: "Post-Transition" },
  { cat: "metalloid",             label: "Metalloid" },
  { cat: "nonmetal",              label: "Nonmetal" },
  { cat: "halogen",               label: "Halogen" },
  { cat: "noble-gas",             label: "Noble Gas" },
  { cat: "lanthanide",            label: "Lanthanide" },
  { cat: "actinide",              label: "Actinide" },
  { cat: "unknown",               label: "Unknown" },
];

const CAT_BG: Record<ElementCategory, string> = {
  "alkali-metal":          "#fef9c3",
  "alkaline-earth":        "#ffedd5",
  "transition-metal":      "#dbeafe",
  "post-transition-metal": "#dcfce7",
  "metalloid":             "#cffafe",
  "nonmetal":              "#d1fae5",
  "halogen":               "#fef3c7",
  "noble-gas":             "#e0f2fe",
  "lanthanide":            "#fce7f3",
  "actinide":              "#ffe4e6",
  "unknown":               "#f1f5f9",
};
const CAT_BORDER: Record<ElementCategory, string> = {
  "alkali-metal":          "#d97706",
  "alkaline-earth":        "#ea580c",
  "transition-metal":      "#3b82f6",
  "post-transition-metal": "#16a34a",
  "metalloid":             "#0891b2",
  "nonmetal":              "#059669",
  "halogen":               "#d97706",
  "noble-gas":             "#0284c7",
  "lanthanide":            "#db2777",
  "actinide":              "#e11d48",
  "unknown":               "#94a3b8",
};

// State descriptions for each category
const CAT_FACTS: Partial<Record<ElementCategory, string>> = {
  "alkali-metal":          "Highly reactive metals that form +1 ions. React vigorously with water.",
  "alkaline-earth":        "Reactive metals forming +2 ions. Essential to biology (Ca, Mg).",
  "transition-metal":      "Variable oxidation states, coloured compounds, catalytic activity.",
  "post-transition-metal": "Softer metals between transition metals and metalloids.",
  "metalloid":             "Properties intermediate between metals and non-metals. Semiconductor uses.",
  "nonmetal":              "Poor conductors. Form covalent bonds. Vital to organic chemistry.",
  "halogen":               "Highly electronegative. Form −1 ions and diatomic molecules.",
  "noble-gas":             "Full outer shells — chemically inert under normal conditions.",
  "lanthanide":            "f-block elements. Strong magnets and phosphors (REE).",
  "actinide":              "Radioactive f-block elements. Nuclear fuel cycle.",
  "unknown":               "Synthetic or insufficiently characterised — properties predicted.",
};

const TOOLTIP_W = 196;
const TOOLTIP_H = 148;

const mainElements = elements.filter((e) => e.row <= 7);
const lanthanides  = elements.filter((e) => e.row === 8);
const actinides    = elements.filter((e) => e.row === 9);

// ── Element detail left panel ─────────────────────────────────────────────────

const PHASE_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  solid:  { label: "Solid",  bg: "#dbeafe", color: "#1d4ed8" },
  liquid: { label: "Liquid", bg: "#d1fae5", color: "#059669" },
  gas:    { label: "Gas",    bg: "#fce7f3", color: "#db2777" },
};

function ElementDetailPanel({ el, onClose }: { el: ChemElement; onClose: () => void }) {
  const period  = el.row <= 7 ? el.row : el.row === 8 ? 6 : 7;
  const group   = el.col;
  const bg      = CAT_BG[el.category];
  const border  = CAT_BORDER[el.category];
  const extra   = ELEMENT_EXTRAS[el.number];
  const phase   = extra ? PHASE_BADGE[extra.phaseAtRTP] : null;

  return (
    <motion.div
      key={el.number}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-56 flex-shrink-0 self-start"
      style={{
        background:   "var(--lab-glass-heavy)",
        border:       `1px solid var(--lab-glass-border)`,
        borderRadius: 18,
        boxShadow:    `0 8px 32px ${border}22, var(--lab-shadow-md)`,
        overflow:     "hidden",
      }}
    >
      {/* Colour accent strip */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${border}80, ${border})` }} />

      <div className="p-5">
        {/* Atomic number + close */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-[10px] font-bold tabular-nums px-2 py-0.5 rounded-full"
            style={{ background: bg, color: border, border: `1px solid ${border}55` }}
          >
            #{el.number}
          </span>
          <div className="flex items-center gap-1.5">
            {phase && (
              <span
                className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{ background: phase.bg, color: phase.color }}
              >
                {phase.label}
              </span>
            )}
            <button
              onClick={onClose}
              className="text-[10px] font-semibold transition-opacity hover:opacity-60"
              style={{ color: "var(--lab-text-subtle)" }}
              aria-label="Close element panel"
            >
              × Close
            </button>
          </div>
        </div>

        {/* Symbol hero */}
        <div
          className="w-full rounded-xl flex flex-col items-center justify-center py-4 mb-3"
          style={{ background: bg, border: `1px solid ${border}44` }}
        >
          <span className="text-6xl font-black leading-none" style={{ color: border }}>
            {el.symbol}
          </span>
          <span className="text-xs font-semibold mt-1" style={{ color: border }}>
            {el.name}
          </span>
          {extra && (
            <span className="text-[9px] mt-1.5 font-mono px-2 py-0.5 rounded-full"
                  style={{ background: `${border}18`, color: border }}>
              {extra.electronConfig}
            </span>
          )}
        </div>

        {/* Data rows */}
        <div className="space-y-1.5 text-xs">
          <DataRow label="Atomic Mass" value={`${el.mass} u`} />
          <DataRow label="Period"      value={`${period}`} />
          <DataRow label="Group"       value={`${group}`} />
          <DataRow
            label="Category"
            value={CATEGORY_LABELS[el.category]}
            valueStyle={{ color: border, fontWeight: 600 }}
          />
          {extra?.meltingC && <DataRow label="Melting Pt" value={`${extra.meltingC} °C`} />}
          {extra?.boilingC && <DataRow label="Boiling Pt" value={`${extra.boilingC} °C`} />}
        </div>

        {/* Common use */}
        {extra?.commonUse && (
          <div
            className="mt-3 p-2 rounded-lg text-[9.5px] leading-snug"
            style={{ background: `${border}0a`, border: `1px solid ${border}22`, color: "var(--lab-text-muted)" }}
          >
            <span className="font-semibold" style={{ color: border }}>Uses: </span>
            {extra.commonUse}
          </div>
        )}

        {/* Category fact */}
        {CAT_FACTS[el.category] && (
          <p
            className="mt-3 text-[10px] leading-snug pt-2.5 border-t"
            style={{ color: "var(--lab-text-muted)", borderColor: "var(--lab-glass-border)" }}
          >
            {CAT_FACTS[el.category]}
          </p>
        )}
      </div>
    </motion.div>
  );
}

function DataRow({
  label, value, valueStyle,
}: { label: string; value: string; valueStyle?: React.CSSProperties }) {
  return (
    <div className="flex items-center justify-between">
      <span style={{ color: "var(--lab-text-subtle)" }}>{label}</span>
      <span
        className="font-semibold tabular-nums"
        style={{ color: "var(--lab-text-secondary)", ...valueStyle }}
      >
        {value}
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PeriodicTable() {
  const [hovered, setHovered]         = useState<ChemElement | null>(null);
  const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null);
  const [selected, setSelected]       = useState<ChemElement | null>(null);
  const [mounted, setMounted]         = useState(false);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { startTransition(() => setMounted(true)); }, []);

  const handleHover = useCallback((el: ChemElement | null, rect?: DOMRect) => {
    if (clearTimer.current) clearTimeout(clearTimer.current);
    if (el !== null) {
      setHovered(el);
      setHoveredRect(rect ?? null);
    } else {
      clearTimer.current = setTimeout(() => {
        setHovered(null);
        setHoveredRect(null);
      }, 180);
    }
  }, []);

  const handleClick = useCallback((el: ChemElement) => {
    setSelected((prev) => (prev?.number === el.number ? null : el));
  }, []);

  const anyHovered = hovered !== null;

  // Hover tooltip position (portal, fixed)
  const tooltipStyle = (() => {
    if (!hoveredRect || !mounted) return null;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let top  = hoveredRect.bottom + 8;
    let left = hoveredRect.left + hoveredRect.width / 2 - TOOLTIP_W / 2;
    if (top + TOOLTIP_H > vh - 16) top = hoveredRect.top - TOOLTIP_H - 8;
    left = Math.max(8, Math.min(vw - TOOLTIP_W - 8, left));
    return { top, left, width: TOOLTIP_W };
  })();

  const tooltipEl =
    mounted && hovered && tooltipStyle
      ? createPortal(
          <AnimatePresence mode="wait">
            <motion.div
              key={hovered.number}
              initial={{ opacity: 0, scale: 0.88, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -4 }}
              transition={{ duration: 0.17, ease: "easeOut" }}
              style={{
                position:      "fixed",
                top:           tooltipStyle.top,
                left:          tooltipStyle.left,
                width:         tooltipStyle.width,
                zIndex:        9999,
                pointerEvents: "none",
              }}
              className="glass-heavy rounded-2xl p-4"
              aria-live="polite"
            >
              <div className="flex items-start justify-between mb-1.5">
                <span
                  className="text-[10px] font-semibold tabular-nums"
                  style={{ color: "var(--lab-text-muted)" }}
                >
                  #{hovered.number}
                </span>
                <span
                  className="text-[9px] font-medium px-1.5 py-0.5 rounded-full border"
                  style={{
                    background:  CAT_BG[hovered.category],
                    borderColor: CAT_BORDER[hovered.category],
                    color:       CAT_BORDER[hovered.category],
                  }}
                >
                  {CATEGORY_LABELS[hovered.category]}
                </span>
              </div>
              <div className="text-4xl font-black leading-none mb-1 gradient-text">
                {hovered.symbol}
              </div>
              <div className="text-sm font-semibold" style={{ color: "var(--lab-text-secondary)" }}>
                {hovered.name}
              </div>
              <div className="text-xs mt-0.5 tabular-nums" style={{ color: "var(--lab-text-muted)" }}>
                {hovered.mass} u
              </div>
              <div
                className="text-[10px] mt-2.5 pt-2.5 border-t"
                style={{ color: "var(--lab-text-subtle)", borderColor: "var(--lab-glass-border)" }}
              >
                Period {hovered.row <= 7 ? hovered.row : hovered.row === 8 ? 6 : 7}
                {" · "}
                Group {hovered.col}
                {" · "}
                <span className="font-medium">Click for details</span>
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body,
        )
      : null;

  return (
    <section
      id="elements"
      style={{ background: "var(--lab-surface)" }}
      className="py-20 px-4"
    >
      <div className="max-w-[1440px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-10"
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: "var(--lab-blue-600)" }}
          >
            Interactive Reference
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold leading-tight"
            style={{ color: "var(--lab-text-primary)" }}
          >
            Periodic Table of
            <span className="gradient-text"> Elements</span>
          </h2>
          <p className="mt-2 text-sm" style={{ color: "var(--lab-text-muted)" }}>
            Hover to preview · Click any element for detailed info in the side panel
          </p>
        </motion.div>

        {/* Layout: left detail panel + table */}
        <div className="flex gap-6 items-start">
          {/* Left detail panel */}
          <div className="hidden lg:block" style={{ minWidth: 224 }}>
            <AnimatePresence mode="wait">
              {selected ? (
                <ElementDetailPanel
                  key={selected.number}
                  el={selected}
                  onClose={() => setSelected(null)}
                />
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-56 flex-shrink-0 rounded-2xl border p-5 flex flex-col items-center justify-center text-center"
                  style={{
                    background:  "var(--lab-glass-heavy)",
                    borderColor: "var(--lab-glass-border)",
                    minHeight:   280,
                    boxShadow:   "var(--lab-shadow-sm)",
                  }}
                >
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mb-3 opacity-30">
                    <rect x="4"  y="4"  width="10" height="10" rx="2" fill="currentColor" />
                    <rect x="18" y="4"  width="10" height="10" rx="2" fill="currentColor" />
                    <rect x="4"  y="18" width="10" height="10" rx="2" fill="currentColor" />
                    <rect x="18" y="18" width="10" height="10" rx="2" fill="currentColor" />
                  </svg>
                  <p
                    className="text-xs font-semibold leading-snug"
                    style={{ color: "var(--lab-text-subtle)" }}
                  >
                    Click an element to see its details here
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Table + legend (takes remaining width) */}
          <div className="flex-1 min-w-0">
            {/* Table scroll container */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
              viewport={{ once: true, margin: "-60px" }}
              className="overflow-x-auto pb-4"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {/* Main grid (periods 1–7) */}
              <div className="pt-grid" style={{ width: "fit-content" }}>
                {mainElements.map((el) => (
                  <ElementTile
                    key={el.number}
                    element={el}
                    onHover={handleHover}
                    onClick={handleClick}
                    isHighlighted={!anyHovered || hovered!.category === el.category}
                    isActive={anyHovered && hovered!.category === el.category}
                    isSelected={selected?.number === el.number}
                  />
                ))}
                {/* Placeholder at (6,3) → lanthanides */}
                <div
                  className="elem-placeholder"
                  style={{ gridRow: 6, gridColumn: 3 }}
                  title="Lanthanides 57–71"
                >
                  <span>57–71</span>
                  <span>Ln</span>
                </div>
                {/* Placeholder at (7,3) → actinides */}
                <div
                  className="elem-placeholder"
                  style={{ gridRow: 7, gridColumn: 3 }}
                  title="Actinides 89–103"
                >
                  <span>89–103</span>
                  <span>An</span>
                </div>
              </div>

              {/* Connector line */}
              <div
                className="mt-2 mb-1"
                style={{
                  width:       "calc(18 * var(--tile-w) + 17 * var(--tile-gap))",
                  paddingLeft: "calc(2 * (var(--tile-w) + var(--tile-gap)))",
                }}
              >
                <div
                  className="h-px"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(59,130,246,0.35) 0%, rgba(59,130,246,0.06) 100%)",
                  }}
                />
              </div>

              {/* F-block (lanthanides + actinides) */}
              <div className="fblock-grid" style={{ width: "fit-content" }}>
                <div className="fblock-label" style={{ gridRow: 1, gridColumn: "1 / 3" }}>
                  Lanthanides
                </div>
                <div className="fblock-label" style={{ gridRow: 2, gridColumn: "1 / 3" }}>
                  Actinides
                </div>

                {lanthanides.map((el) => (
                  <ElementTile
                    key={el.number}
                    element={el}
                    gridRow={1}
                    gridCol={el.col}
                    onHover={handleHover}
                    onClick={handleClick}
                    isHighlighted={!anyHovered || hovered!.category === el.category}
                    isActive={anyHovered && hovered!.category === el.category}
                    isSelected={selected?.number === el.number}
                  />
                ))}
                {actinides.map((el) => (
                  <ElementTile
                    key={el.number}
                    element={el}
                    gridRow={2}
                    gridCol={el.col}
                    onHover={handleHover}
                    onClick={handleClick}
                    isHighlighted={!anyHovered || hovered!.category === el.category}
                    isActive={anyHovered && hovered!.category === el.category}
                    isSelected={selected?.number === el.number}
                  />
                ))}
              </div>
            </motion.div>

            {/* Category legend */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="mt-8 flex flex-wrap gap-2"
            >
              {LEGEND_CATEGORIES.map(({ cat, label }) => (
                <div
                  key={cat}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
                  style={{
                    background:  CAT_BG[cat],
                    borderColor: CAT_BORDER[cat],
                    color:       CAT_BORDER[cat],
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: CAT_BORDER[cat] }}
                  />
                  {label}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile element detail panel (shown below table on small screens) */}
      <div className="lg:hidden max-w-[1440px] mx-auto mt-6">
        <AnimatePresence mode="wait">
          {selected && (
            <motion.div
              key={`mobile-${selected.number}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.25 }}
            >
              <ElementDetailPanel
                el={selected}
                onClose={() => setSelected(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fixed-position anchored tooltip (portal) */}
      {tooltipEl}
    </section>
  );
}
