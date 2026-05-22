"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const EXPERIMENT_LABELS: Record<string, string> = {
  "/experiments/titration":             "Acid-Base Titration",
  "/experiments/electrolysis":          "Electrolysis",
  "/experiments/flame-test":            "Flame Test",
  "/experiments/solubility":            "Solubility & Precipitation",
  "/experiments/reaction-rate":         "Reaction Kinetics",
  "/experiments/gas-laws":              "Gas Laws",
  "/experiments/chemical-equilibrium":  "Chemical Equilibrium",
  "/experiments/gas-collection":        "Gas Collection",
  "/experiments/redox-displacement":    "Redox Displacement",
  "/experiments/calorimetry":           "Calorimetry",
  "/experiments/separation-techniques": "Separation Techniques",
};

const EXPERIMENT_ACCENT: Record<string, string> = {
  "/experiments/titration":             "#2563eb",
  "/experiments/electrolysis":          "#0891b2",
  "/experiments/flame-test":            "#ea580c",
  "/experiments/solubility":            "#059669",
  "/experiments/reaction-rate":         "#7c3aed",
  "/experiments/gas-laws":              "#db2777",
  "/experiments/chemical-equilibrium":  "#d97706",
  "/experiments/gas-collection":        "#0284c7",
  "/experiments/redox-displacement":    "#475569",
  "/experiments/calorimetry":           "#ef4444",
  "/experiments/separation-techniques": "#0284c7",
};

export default function ExperimentsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/experiments") {
    return <>{children}</>;
  }

  const experimentLabel = EXPERIMENT_LABELS[pathname] ?? "Experiment";
  const accent          = EXPERIMENT_ACCENT[pathname] ?? "var(--lab-blue-600)";

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: "var(--lab-off-white)" }}
    >
      {/* ── Premium slim lab header — never overlaps lab UI ── */}
      <header
        className="flex items-center flex-shrink-0 border-b z-40"
        style={{
          height:               48,
          background:           "var(--lab-glass-heavy)",
          borderColor:          "var(--lab-glass-border)",
          backdropFilter:       "blur(24px) saturate(1.6)",
          WebkitBackdropFilter: "blur(24px) saturate(1.6)",
          boxShadow:            "0 1px 0 rgba(255,255,255,0.9) inset, 0 1px 4px rgba(15,23,42,0.06)",
        }}
      >
        {/* Left accent bar — unique per experiment */}
        <div
          className="w-1 self-stretch flex-shrink-0"
          style={{ background: `linear-gradient(180deg, ${accent} 0%, ${accent}55 100%)` }}
          aria-hidden="true"
        />

        <div className="flex items-center gap-2 min-w-0 flex-1 px-3">
          {/* Home link + logo */}
          <Link
            href="/"
            className="flex items-center gap-1.5 flex-shrink-0 group rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="ChemLab home"
          >
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-transform duration-150 group-hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 100%)",
                boxShadow:  "0 1px 4px rgba(37,99,235,0.30)",
              }}
            >
              <MiniFlaskIcon />
            </div>
            <span
              className="text-xs font-bold tracking-tight hidden sm:block"
              style={{ color: "var(--lab-text-primary)" }}
            >
              Chem<span className="gradient-text">Lab</span>
            </span>
          </Link>

          <ChevronRight />

          <Link
            href="/experiments"
            className="text-xs font-medium transition-opacity duration-150 hover:opacity-70 flex-shrink-0 hidden sm:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1"
            style={{ color: "var(--lab-text-muted)" }}
          >
            Labs
          </Link>

          <ChevronRight className="hidden sm:block" />

          {/* Current experiment name */}
          <span
            className="text-xs font-bold truncate"
            style={{ color: accent }}
            title={experimentLabel}
          >
            {experimentLabel}
          </span>
        </div>

        {/* Right — jumper + exit actions */}
        <div className="flex items-center gap-1.5 px-3 flex-shrink-0">
          <ExperimentJumper current={pathname} />

          <Link
            href="/"
            className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1.5 rounded-lg border transition-all duration-150 hover:bg-blue-50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 hidden sm:flex"
            style={{
              borderColor: "var(--lab-glass-border)",
              color:       "var(--lab-text-muted)",
            }}
            aria-label="Go to homepage"
          >
            <HomeIcon />
          </Link>

          <Link
            href="/experiments"
            className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all duration-150 hover:bg-blue-50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            style={{
              borderColor: "var(--lab-glass-border)",
              color:       "var(--lab-text-muted)",
            }}
            aria-label="Back to experiments list"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M6.5 1.5 L3 5 L6.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">Labs</span>
          </Link>
        </div>
      </header>

      <main className="flex flex-col flex-1 overflow-hidden min-h-0">{children}</main>
    </div>
  );
}

function ExperimentJumper({ current }: { current: string }) {
  const entries = Object.entries(EXPERIMENT_LABELS);
  return (
    <select
      value={current}
      onChange={(e) => { window.location.href = e.target.value; }}
      className="text-[11px] font-medium pl-2.5 pr-6 py-1.5 rounded-lg border outline-none cursor-pointer appearance-none focus-visible:ring-2 focus-visible:ring-blue-500"
      style={{
        background:  "var(--lab-glass)",
        borderColor: "var(--lab-glass-border)",
        color:       "var(--lab-text-secondary)",
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='10' viewBox='0 0 10 10' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 4l3 3 3-3' stroke='%2394a3b8' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
        backgroundRepeat:   "no-repeat",
        backgroundPosition: "right 8px center",
        maxWidth:           148,
      }}
      aria-label="Jump to experiment"
    >
      {entries.map(([href, label]) => (
        <option key={href} value={href}>{label}</option>
      ))}
    </select>
  );
}

function MiniFlaskIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M5 2v3.5L2 9a1 1 0 00.9 1.5h6.2A1 1 0 0010 9L7 5.5V2"
            stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 2h3" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
      <path d="M1.5 5.5L5.5 2l4 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.5 4.8V9a.5.5 0 00.5.5h2V7h1v2.5h2A.5.5 0 009 9V4.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ChevronRight({ className = "" }: { className?: string }) {
  return (
    <svg
      width="12" height="12" viewBox="0 0 12 12" fill="none"
      aria-hidden="true"
      className={`flex-shrink-0 ${className}`}
      style={{ color: "var(--lab-slate-400)" }}
    >
      <path d="M4.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
