"use client";

import type { ExperimentStatus } from "@/lib/engine/types";

const STATUS_CONFIG: Record<ExperimentStatus, { label: string; color: string; bg: string; border: string }> = {
  idle:      { label: "Idle",        color: "#64748b", bg: "rgba(100,116,139,0.09)", border: "rgba(100,116,139,0.22)" },
  setup:     { label: "Setting Up",  color: "#d97706", bg: "rgba(217,119,6,0.09)",   border: "rgba(217,119,6,0.22)"   },
  ready:     { label: "Ready",       color: "#0891b2", bg: "rgba(8,145,178,0.09)",   border: "rgba(8,145,178,0.22)"   },
  running:   { label: "Running",     color: "#059669", bg: "rgba(5,150,105,0.09)",   border: "rgba(5,150,105,0.22)"   },
  paused:    { label: "Paused",      color: "#d97706", bg: "rgba(217,119,6,0.09)",   border: "rgba(217,119,6,0.22)"   },
  completed: { label: "Complete",    color: "#2563eb", bg: "rgba(37,99,235,0.09)",   border: "rgba(37,99,235,0.22)"   },
  failed:    { label: "Failed",      color: "#dc2626", bg: "rgba(220,38,38,0.09)",   border: "rgba(220,38,38,0.22)"   },
  heating:   { label: "Heating",     color: "#e11d48", bg: "rgba(225,29,72,0.09)",   border: "rgba(225,29,72,0.22)"   },
  cooling:   { label: "Cooling",     color: "#2563eb", bg: "rgba(37,99,235,0.09)",   border: "rgba(37,99,235,0.22)"   },
  reacting:  { label: "Reacting",    color: "#d97706", bg: "rgba(217,119,6,0.09)",   border: "rgba(217,119,6,0.22)"   },
};

interface Metric { label: string; value: string }

interface Props {
  status:   ExperimentStatus;
  metrics?: Metric[];
  error?:   string | null;
}

export default function StatusBar({ status, metrics, error }: Props) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.idle;

  return (
    <div
      className="flex flex-wrap items-center gap-2 px-4 border-b flex-shrink-0"
      style={{
        minHeight:   "40px",
        paddingTop:  "6px",
        paddingBottom: "6px",
        borderColor: "var(--lab-glass-border)",
        background:  "var(--lab-glass-heavy)",
        backdropFilter: "blur(12px) saturate(1.4)",
        WebkitBackdropFilter: "blur(12px) saturate(1.4)",
      }}
    >
      {/* Status pill */}
      <div
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1"
        style={{
          background:   cfg.bg,
          border:       `1px solid ${cfg.border}`,
          flexShrink:   0,
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{
            background:  cfg.color,
            boxShadow:   status === "running" || status === "ready" || status === "reacting" || status === "heating" || status === "cooling"
              ? `0 0 5px ${cfg.color}cc`
              : "none",
            animation:   status === "running" || status === "reacting" || status === "heating" || status === "cooling" ? "blink-dot 1.6s ease-in-out infinite" : "none",
          }}
          aria-hidden="true"
        />
        <span
          className="text-[11px] font-bold tracking-wide"
          style={{ color: cfg.color }}
        >
          {cfg.label}
        </span>
      </div>

      {/* Separator */}
      {metrics && metrics.length > 0 && (
        <div
          className="w-px h-4 flex-shrink-0"
          style={{ background: "var(--lab-glass-border)" }}
          aria-hidden="true"
        />
      )}

      {/* Metric chips */}
      {metrics?.map(({ label, value }) => (
        <div
          key={label}
          className="metric-chip"
          style={{ flexShrink: 0 }}
        >
          <span className="metric-label">{label}</span>
          <span className="metric-value">{value}</span>
        </div>
      ))}

      {/* Error banner */}
      {error && (
        <div
          className="flex items-center gap-1.5 ml-auto rounded-lg px-2.5 py-1"
          style={{
            background:  "#fef2f2",
            border:      "1px solid #fecaca",
            color:       "#dc2626",
            fontSize:    "11px",
            fontWeight:  600,
          }}
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
            <circle cx="5.5" cy="5.5" r="4.5" fill="#ef4444" fillOpacity="0.15" stroke="#ef4444" strokeWidth="1"/>
            <line x1="5.5" y1="3.5" x2="5.5" y2="6" stroke="#ef4444" strokeWidth="1.1" strokeLinecap="round"/>
            <circle cx="5.5" cy="7.5" r="0.55" fill="#ef4444"/>
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}
