"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";

// ── Types ─────────────────────────────────────────────────────────────────────
type RightTab = "lab" | "guide" | "info";

export interface LabPageShellProps {
  preLabIntro?: ReactNode;
  statusBar:    ReactNode;
  workspace:    ReactNode;
  workspaceMaxW?: string;
  centerBottom?:  ReactNode;
  controls:   ReactNode;
  setupPhase?: ReactNode;
  stepGuide?:  ReactNode;
  infoCards?:  ReactNode;
  mode:      "guided" | "free";
  onSetMode: (m: "guided" | "free") => void;
  observations: ReactNode;
  chemNotif?: ReactNode;
  obsNotif?:  ReactNode;
  resultModal?: ReactNode;
}

const TAB_ICONS: Record<RightTab, (active: boolean) => ReactNode> = {
  lab: (active) => (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="8.5" r="3.5" stroke={active ? "var(--lab-blue-600)" : "currentColor"} strokeWidth="1.3" />
      <path d="M4.5 3h4M5.5 3v2.5" stroke={active ? "var(--lab-blue-600)" : "currentColor"} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M8.5 3v2" stroke={active ? "var(--lab-blue-600)" : "currentColor"} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ),
  guide: (active) => (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M2 3h9M2 6.5h7M2 10h5" stroke={active ? "var(--lab-blue-600)" : "currentColor"} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  info: (active) => (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="5.5" stroke={active ? "var(--lab-blue-600)" : "currentColor"} strokeWidth="1.3" />
      <line x1="6.5" y1="5.5" x2="6.5" y2="9" stroke={active ? "var(--lab-blue-600)" : "currentColor"} strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="6.5" cy="3.8" r="0.7" fill={active ? "var(--lab-blue-600)" : "currentColor"} />
    </svg>
  ),
};

// ── Component ────────────────────────────────────────────────────────────────
export default function LabPageShell({
  preLabIntro,
  statusBar,
  workspace,
  workspaceMaxW = "max-w-lg",
  centerBottom,
  controls,
  setupPhase,
  stepGuide,
  infoCards,
  mode,
  onSetMode,
  observations,
  chemNotif,
  obsNotif,
  resultModal,
}: LabPageShellProps) {
  const [activeTab, setActiveTab] = useState<RightTab>("lab");

  const tabs: { id: RightTab; label: string }[] = [
    { id: "lab",   label: "Controls" },
    ...(stepGuide  ? [{ id: "guide" as RightTab, label: "Guide"    }] : []),
    ...(infoCards  ? [{ id: "info"  as RightTab, label: "Info"     }] : []),
  ];

  return (
    <div className="flex flex-col h-full min-h-0">
      {preLabIntro}
      {statusBar}

      {/* ── Main content area ── */}
      <div className="lab-body">

        {/* ═══════════════════════════════════════════════════
            CENTER — workspace + popup overlay + secondary viz
        ═══════════════════════════════════════════════════ */}
        <div className="relative flex flex-col flex-1 overflow-hidden min-w-0 min-h-0">

          {/* Context popup overlay — floats top-right over workspace canvas */}
          <div
            className="lab-popup-overlay"
            aria-live="polite"
            aria-label="Lab notifications"
          >
            {chemNotif}
            {obsNotif}
          </div>

          {/* Workspace canvas */}
          <div className="flex-1 flex items-center justify-center p-4 pb-2 overflow-hidden min-h-0">
            <div className={`w-full ${workspaceMaxW} flex-shrink-0`}>
              {workspace}
            </div>
          </div>

          {/* Secondary visualisation (e.g. pH curve) */}
          {centerBottom && (
            <div
              className="flex-shrink-0 px-4 pb-4 overflow-y-auto"
              style={{ maxHeight: 240 }}
            >
              {centerBottom}
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════
            RIGHT PANEL — tabs + observations
        ═══════════════════════════════════════════════════ */}
        <aside
          className="lab-right-panel flex flex-col"
          style={{
            background:          "var(--lab-glass)",
            backdropFilter:      "blur(8px) saturate(1.4)",
            WebkitBackdropFilter:"blur(8px) saturate(1.4)",
          }}
          aria-label="Lab controls panel"
        >
          {/* ── Tab bar ── */}
          <div
            className="flex border-b flex-shrink-0 relative"
            style={{ borderColor: "var(--lab-glass-border)" }}
            role="tablist"
            aria-label="Lab panel tabs"
          >
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold transition-all duration-150 relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                  style={{
                    color:      active ? "var(--lab-blue-600)" : "var(--lab-text-muted)",
                    background: "transparent",
                  }}
                >
                  {TAB_ICONS[tab.id](active)}
                  {tab.label}
                  {active && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                      style={{ background: "var(--lab-blue-600)" }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Tab content (scrollable) ── */}
          <div className="flex-1 overflow-y-auto min-h-0" role="tabpanel">
            {/* Controls tab */}
            {activeTab === "lab" && (
              <div className="p-3 space-y-3">
                {setupPhase}
                {controls}
              </div>
            )}

            {/* Guide tab */}
            {activeTab === "guide" && (
              <div>
                {/* Mode toggle */}
                <div
                  className="flex border-b"
                  style={{ borderColor: "var(--lab-glass-border)" }}
                >
                  {(["guided", "free"] as const).map((m) => {
                    const isActive = mode === m;
                    return (
                      <button
                        key={m}
                        onClick={() => onSetMode(m)}
                        className="flex-1 py-2 text-[11px] font-semibold capitalize transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                        style={{
                          background: isActive ? "rgba(37,99,235,0.07)" : "transparent",
                          color:      isActive ? "var(--lab-blue-600)" : "var(--lab-text-muted)",
                        }}
                      >
                        {m === "guided" ? "Guided" : "Free Explore"}
                      </button>
                    );
                  })}
                </div>
                {stepGuide}
              </div>
            )}

            {/* Info tab */}
            {activeTab === "info" && (
              <div className="p-3 space-y-3">
                {infoCards}
              </div>
            )}
          </div>

          {/* ── Observations (pinned at bottom) ── */}
          <div
            className="lab-obs-panel flex-shrink-0 border-t overflow-hidden"
            style={{
              borderColor: "var(--lab-glass-border)",
              background:  "rgba(255,255,255,0.4)",
            }}
          >
            {observations}
          </div>
        </aside>
      </div>

      {resultModal}
    </div>
  );
}
