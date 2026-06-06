"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ObservationEvent } from "@/lib/engine/types";

// SVG icons per observation type (no emoji to keep it polished)
function ObsIcon({ type }: { type: ObservationEvent["type"] }) {
  switch (type) {
    case "color-change":
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="6" cy="6" r="5.5" fill="#f472b6" fillOpacity="0.2" stroke="#f472b6" strokeWidth="1" />
          <circle cx="6" cy="6" r="2.5" fill="#f472b6" />
        </svg>
      );
    case "gas-evolution":
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="4"  cy="9" r="2"   fill="#93c5fd" fillOpacity="0.7" />
          <circle cx="7.5" cy="6" r="1.5" fill="#93c5fd" fillOpacity="0.8" />
          <circle cx="6"  cy="3" r="1.2" fill="#93c5fd" />
        </svg>
      );
    case "endpoint-reached":
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="6" cy="6" r="5.5" fill="#059669" fillOpacity="0.15" stroke="#059669" strokeWidth="1" />
          <path d="M3.5 6l1.8 1.8L8.5 4" stroke="#059669" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "neutralization":
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
          <path d="M6 1.5 L6 10.5 M1.5 6 L10.5 6" stroke="#2563eb" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "contamination":
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
          <path d="M6 1.5 L10.5 10.5 L1.5 10.5 Z" fill="#ef4444" fillOpacity="0.15" stroke="#ef4444" strokeWidth="1" strokeLinejoin="round" />
          <line x1="6" y1="5" x2="6" y2="7.5" stroke="#ef4444" strokeWidth="1.3" strokeLinecap="round" />
          <circle cx="6" cy="9" r="0.7" fill="#ef4444" />
        </svg>
      );
    case "conductivity-change":
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
          <path d="M2 9 L4.5 3 L6.5 7 L8 5 L10 9" stroke="#f59e0b" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );
    case "reaction-start":
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
          <polygon points="3,2 10,6 3,10" fill="#22c55e" fillOpacity="0.8" />
        </svg>
      );
    case "reaction-complete":
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
          <rect x="2" y="2" width="8" height="8" rx="2" fill="#2563eb" fillOpacity="0.15" stroke="#2563eb" strokeWidth="1" />
          <path d="M4 6l1.5 1.5L8 4" stroke="#2563eb" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="6" cy="6" r="5.5" fill="#94a3b8" fillOpacity="0.2" stroke="#94a3b8" strokeWidth="1" />
        </svg>
      );
  }
}

const SEVERITY_STYLES: Record<ObservationEvent["severity"], { border: string; bg: string; text: string }> = {
  info:    { border: "#bfdbfe", bg: "rgba(239,246,255,0.9)", text: "#1e40af" },
  warning: { border: "#fde68a", bg: "rgba(255,251,235,0.9)", text: "#92400e" },
  success: { border: "#bbf7d0", bg: "rgba(240,253,244,0.9)", text: "#14532d" },
  error:   { border: "#fecaca", bg: "rgba(254,242,242,0.9)", text: "#7f1d1d" },
};

function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
}

interface Props {
  observations: ObservationEvent[];
}

export default function ObservationPanel({ observations }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{ borderColor: "var(--lab-glass-border)" }}
      >
        <div className="flex items-center gap-2">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
            <circle cx="5.5" cy="5.5" r="4.5" stroke="var(--lab-text-subtle)" strokeWidth="1.1"/>
            <line x1="5.5" y1="4" x2="5.5" y2="7" stroke="var(--lab-text-subtle)" strokeWidth="1.1" strokeLinecap="round"/>
            <circle cx="5.5" cy="2.8" r="0.6" fill="var(--lab-text-subtle)"/>
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-wider"
            style={{ color: "var(--lab-text-muted)" }}>
            Observations
          </span>
        </div>
        {observations.length > 0 && (
          <span
            className="text-[9px] px-2 py-0.5 rounded-full font-bold"
            style={{ background: "rgba(37,99,235,0.08)", color: "var(--lab-blue-600)", border: "1px solid rgba(37,99,235,0.16)" }}
          >
            {observations.length}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5" style={{ maxHeight: "360px" }}>
        {observations.length === 0 ? (
          <div className="lab-obs-empty">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="6" stroke="var(--lab-text-subtle)" strokeWidth="1" strokeDasharray="3 2"/>
              <path d="M7 5v3M7 9.5v0.1" stroke="var(--lab-text-subtle)" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            Start the experiment to record observations
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {observations.map((obs) => {
              const s = SEVERITY_STYLES[obs.severity];
              return (
                <motion.div
                  key={obs.id}
                  layout
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0,  scale: 1    }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="flex gap-2 px-2.5 py-2 rounded-lg border text-xs"
                  style={{
                    borderColor: s.border,
                    background:  s.bg,
                    color:       s.text,
                  }}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    <ObsIcon type={obs.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="leading-snug break-words">{obs.message}</p>
                    <p className="text-[9px] mt-0.5 opacity-50 font-mono">{formatTime(obs.timestamp)}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
