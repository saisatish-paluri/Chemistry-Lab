"use client";

import { motion } from "framer-motion";

interface Props {
  view: "macro" | "micro";
  onChange: (view: "macro" | "micro") => void;
}

export default function MacroMicroViewToggle({ view, onChange }: Props) {
  return (
    <div
      className="flex items-center gap-1 p-1 rounded-xl"
      style={{
        background: "var(--lab-surface)",
        border: "1px solid var(--lab-glass-border)",
        backdropFilter: "blur(8px)",
        width: "fit-content",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04) inset",
      }}
    >
      <button
        onClick={() => onChange("macro")}
        className="relative px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors duration-150 flex items-center gap-1.5 focus:outline-none"
        style={{
          color: view === "macro" ? "var(--lab-text-primary)" : "var(--lab-text-muted)",
          zIndex: 1,
        }}
      >
        {view === "macro" && (
          <motion.div
            layoutId="active-view-pill"
            className="absolute inset-0 rounded-lg shadow-sm"
            style={{
              background: "var(--theme-white)",
              border: "1px solid var(--lab-glass-border)",
              zIndex: -1,
            }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}
        <span>🔬</span>
        <span>Macroscopic</span>
      </button>

      <button
        onClick={() => onChange("micro")}
        className="relative px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors duration-150 flex items-center gap-1.5 focus:outline-none"
        style={{
          color: view === "micro" ? "var(--lab-text-primary)" : "var(--lab-text-muted)",
          zIndex: 1,
        }}
      >
        {view === "micro" && (
          <motion.div
            layoutId="active-view-pill"
            className="absolute inset-0 rounded-lg shadow-sm"
            style={{
              background: "var(--theme-white)",
              border: "1px solid var(--lab-glass-border)",
              zIndex: -1,
            }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}
        <span>⚛</span>
        <span>Microscopic</span>
      </button>
    </div>
  );
}
