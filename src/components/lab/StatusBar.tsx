"use client";

import type { ExperimentStatus } from "@/lib/engine/types";

const STATUS_LABEL: Record<ExperimentStatus, string> = {
  idle:      "Idle",
  setup:     "Setting Up",
  ready:     "Ready",
  running:   "Running",
  paused:    "Paused",
  completed: "Complete",
  failed:    "Failed",
};

const STATUS_COLOR: Record<ExperimentStatus, string> = {
  idle:      "#94a3b8",
  setup:     "#f59e0b",
  ready:     "#0891b2",
  running:   "#22c55e",
  paused:    "#f59e0b",
  completed: "#2563eb",
  failed:    "#ef4444",
};

interface Metric { label: string; value: string }

interface Props {
  status:   ExperimentStatus;
  metrics?: Metric[];
  error?:   string | null;
}

export default function StatusBar({ status, metrics, error }: Props) {
  const color = STATUS_COLOR[status];

  return (
    <div
      className="flex flex-wrap items-center gap-3 px-4 py-2 border-b text-xs"
      style={{ borderColor: "var(--lab-glass-border)", background: "var(--lab-glass)" }}
    >
      {/* Status pill */}
      <div className="flex items-center gap-1.5">
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{
            background:   color,
            boxShadow:    status === "running" || status === "ready" ? `0 0 6px ${color}` : "none",
            animation:    status === "running" ? "blink-dot 1.6s ease-in-out infinite" : "none",
          }}
        />
        <span className="font-semibold" style={{ color }}>{STATUS_LABEL[status]}</span>
      </div>

      {/* Separator */}
      <span style={{ color: "var(--lab-glass-border)" }}>|</span>

      {/* Metrics */}
      {metrics?.map(({ label, value }) => (
        <div key={label} className="flex items-center gap-1">
          <span style={{ color: "var(--lab-text-subtle)" }}>{label}:</span>
          <span className="font-semibold font-mono" style={{ color: "var(--lab-text-secondary)" }}>{value}</span>
        </div>
      ))}

      {/* Error */}
      {error && (
        <span
          className="ml-auto px-2 py-0.5 rounded-md text-xs font-medium"
          style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
        >
          ⚠ {error}
        </span>
      )}
    </div>
  );
}
