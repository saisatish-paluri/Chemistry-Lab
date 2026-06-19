"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useActiveLabStore } from "@/lib/store/active-lab-store";
import LabInfoCard from "./LabInfoCard";
import LabEducationPanel from "./LabEducationPanel";
import type { LabEducation } from "@/lib/experiment-education";
import type { ExperimentMode } from "@/lib/engine/types";
import PreLabIntro from "./PreLabIntro";

// ── Types ─────────────────────────────────────────────────────────────────────
type RightTab = "controls" | "guide" | "info";

export type { LabEducation };

export interface LabPageShellProps {
  preLabIntro?: ReactNode;
  statusBar:    ReactNode;
  workspace:    ReactNode;
  /** @deprecated — workspace now fills all available center space; prop kept for backwards-compat but has no effect */
  workspaceMaxW?: string;
  centerBottom?:  ReactNode;
  /** Optional left context panel — shown at ≥1024 px wide only */
  leftPanel?:     ReactNode;
  controls:   ReactNode;
  setupPhase?: ReactNode;
  stepGuide?:  ReactNode;
  infoCards?:  ReactNode;
  mode:      ExperimentMode;
  onSetMode: (m: "guided" | "free") => void;
  observations: ReactNode;
  chemNotif?: ReactNode;
  obsNotif?:  ReactNode;
  resultModal?: ReactNode;
  education?: LabEducation;
  reactionNote?: string;
}

// ── Icon components ───────────────────────────────────────────────────────────
function ControlsIcon({ active, accent }: { active: boolean; accent: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="8" r="3.2" stroke={active ? accent : "currentColor"} strokeWidth="1.3"/>
      <path d="M5 3h3M5.5 3v2.5" stroke={active ? accent : "currentColor"} strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M8 3v1.8" stroke={active ? accent : "currentColor"} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function GuideIcon({ active, accent }: { active: boolean; accent: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M2 3.5h9M2 6.5h7M2 9.5h5" stroke={active ? accent : "currentColor"} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

function InfoIcon({ active, accent }: { active: boolean; accent: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="5.5" stroke={active ? accent : "currentColor"} strokeWidth="1.3"/>
      <line x1="6.5" y1="5.5" x2="6.5" y2="9" stroke={active ? accent : "currentColor"} strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="6.5" cy="3.8" r="0.7" fill={active ? accent : "currentColor"}/>
    </svg>
  );
}

// ── Component ────────────────────────────────────────────────────────────────
export default function LabPageShell({
  preLabIntro,
  statusBar,
  workspace,
  centerBottom,
  leftPanel,
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
  education,
  reactionNote,
}: LabPageShellProps) {
  const [activeTab, setActiveTab]   = useState<RightTab>("controls");
  const [panelOpen, setPanelOpen]   = useState(true);

  const accent   = useActiveLabStore((s) => s.accent);
  const isActive = useActiveLabStore((s) => s.isActive);
  const title    = useActiveLabStore((s) => s.title);

  const effectiveAccent = isActive ? accent : "var(--lab-blue-600)";

  const dynamicPreLab =
    !preLabIntro && education && isActive && title ? (
      <PreLabIntro
        title={title}
        objective={education.aim}
        apparatus={education.apparatus}
        reagents={education.chemicals.map((c) => ({
          name: c.formula ? `${c.name} (${c.formula})` : c.name,
          concentration: c.concentration,
        }))}
        safetyNotes={education.safetyNotes}
      />
    ) : null;

  const hasTabs = !!stepGuide;
  const tabs: { id: RightTab; label: string; icon: (a: boolean) => ReactNode }[] = [
    { id: "controls", label: "Controls", icon: (a) => <ControlsIcon active={a} accent={effectiveAccent} /> },
    ...(hasTabs ? [{ id: "guide" as RightTab, label: "Guide", icon: (a: boolean) => <GuideIcon active={a} accent={effectiveAccent} /> }] : []),
    { id: "info", label: "Info", icon: (a) => <InfoIcon active={a} accent={effectiveAccent} /> },
  ];

  return (
    <div
      className="flex flex-col h-full min-h-0"
      style={{
        background: isActive
          ? `radial-gradient(ellipse at 100% 0%, ${accent}06 0%, transparent 45%), var(--lab-off-white)`
          : "var(--lab-off-white)",
      }}
    >
      {preLabIntro || dynamicPreLab}

      {/* ── Education Panel ── */}
      {education && <LabEducationPanel data={education} accent={effectiveAccent} />}

      {/* ── Status Bar ── */}
      {statusBar}

      {/* ── Main body ── */}
      <div
        className="flex flex-1 overflow-hidden min-h-0"
        style={{ flexDirection: "row" }}
      >
        {/* ═══════════════════════════════════════════════════
            LEFT COLUMN — optional context / info panel
        ═══════════════════════════════════════════════════ */}
        {leftPanel && (
          <aside
            className="lab-left-panel"
            aria-label="Lab context panel"
          >
            {leftPanel}
          </aside>
        )}

        {/* ═══════════════════════════════════════════════════
            CENTER COLUMN — workspace + graph/data panel
            On landscape ≥1024 px with a graph, the graph
            panel sits to the RIGHT of the workspace (side-
            by-side) so the workspace gets full column height.
        ═══════════════════════════════════════════════════ */}
        <div className={`lab-center-col${centerBottom ? " has-graph" : ""}`}>

          {/* Center main: workspace + reaction note (position:relative for overlay) */}
          <div className="lab-center-main">

            {/* Notification overlay (top-right of workspace area) */}
            <div
              className="lab-popup-overlay"
              aria-live="polite"
              aria-label="Lab notifications"
            >
              {chemNotif}
              {obsNotif}
            </div>

            {/* Workspace canvas — fills all available center area */}
            <div
              className={`lab-ws-area${isActive ? " lab-ws-area--active" : ""}`}
              style={isActive ? ({ "--ws-accent": accent } as React.CSSProperties) : undefined}
            >
              {workspace}
            </div>

            {/* Reaction explanation note */}
            {reactionNote && (
              <div
                className="mx-4 mb-2 px-4 py-2.5 rounded-xl flex items-start gap-2.5"
                style={{
                  background:  `${effectiveAccent}07`,
                  border:      `1px solid ${effectiveAccent}22`,
                  flexShrink:  0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="mt-0.5 flex-shrink-0">
                  <circle cx="7" cy="7" r="6" fill={effectiveAccent} fillOpacity="0.15" stroke={effectiveAccent} strokeWidth="1.2"/>
                  <line x1="7" y1="5.5" x2="7" y2="9" stroke={effectiveAccent} strokeWidth="1.3" strokeLinecap="round"/>
                  <circle cx="7" cy="4" r="0.7" fill={effectiveAccent}/>
                </svg>
                <p className="text-[12px] leading-relaxed" style={{ color: "var(--lab-text-secondary)" }}>
                  {reactionNote}
                </p>
              </div>
            )}
          </div>

          {/* Graph / secondary visualisation panel.
              Portrait: stacked below workspace.
              Landscape ≥1024 px: rendered to the right via .has-graph CSS. */}
          {centerBottom && (
            <div className="lab-center-bottom">
              {centerBottom}
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════
            RIGHT COLUMN — controls / guide / info panel
        ═══════════════════════════════════════════════════ */}
        <aside
          className={`lab-right-panel flex flex-col${panelOpen ? "" : " lab-right-panel--collapsed"}`}
          aria-label="Lab controls panel"
          style={{
            position: "relative",
            background:
              "linear-gradient(180deg, var(--lab-glass-heavy) 0%, var(--lab-white) 100%)",
            backdropFilter:       "blur(16px) saturate(1.6)",
            WebkitBackdropFilter: "blur(16px) saturate(1.6)",
            boxShadow:            "-1px 0 0 var(--lab-glass-border)",
          }}
        >
          {/* Collapse toggle */}
          <button
            className="lab-panel-toggle"
            onClick={() => setPanelOpen((v) => !v)}
            aria-label={panelOpen ? "Collapse controls panel" : "Expand controls panel"}
            title={panelOpen ? "Collapse controls" : "Expand controls"}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"
              style={{ transform: panelOpen ? "none" : "scaleX(-1)", transition: "transform 0.25s ease" }}>
              <path d="M3 1.5L6.5 5 3 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Accent line at top */}
          <div
            className="h-0.5 w-full flex-shrink-0"
            style={{
              background: isActive
                ? `linear-gradient(90deg, transparent, ${accent}70, ${accent}, ${accent}70, transparent)`
                : `linear-gradient(90deg, transparent, rgba(37,99,235,0.40), transparent)`,
            }}
          />

          {/* Tab bar */}
          <div
            className="flex border-b flex-shrink-0"
            style={{
              borderColor: "var(--lab-glass-border)",
              background:  "var(--lab-glass-light)",
            }}
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
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11.5px] font-semibold transition-all duration-150 relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                  style={{
                    color:      active ? effectiveAccent : "var(--lab-text-muted)",
                    background: active ? `${effectiveAccent}08` : "transparent",
                  }}
                >
                  {tab.icon(active)}
                  {tab.label}
                  {active && (
                    <motion.div
                      layoutId="right-tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                      style={{ background: effectiveAccent }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    />
                  )}
                </button>
              );
            })}
            {/* Live indicator chip — always visible in tab bar */}
            {isActive && (
              <div
                className="flex items-center gap-1.5 px-2.5 flex-shrink-0 self-center mr-1"
                aria-label="Simulation active"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full live-dot flex-shrink-0"
                  style={{ background: accent, boxShadow: `0 0 5px ${accent}99` }}
                />
              </div>
            )}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <AnimatePresence mode="wait" initial={false}>

              {/* Controls tab */}
              {activeTab === "controls" && (
                <motion.div
                  key="controls"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="p-3 space-y-3"
                >
                  {/* Active lab indicator — compact status pill */}
                  {isActive && (
                    <div
                      className="rounded-lg border px-2.5 py-1.5 flex items-center gap-2"
                      style={{
                        background:  `${accent}08`,
                        borderColor: `${accent}22`,
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0 live-dot"
                        style={{ background: accent, boxShadow: `0 0 5px ${accent}aa` }}
                      />
                      <span className="text-[11px] font-semibold" style={{ color: accent }}>
                        Live Simulation
                      </span>
                    </div>
                  )}

                  {setupPhase}
                  {controls}
                </motion.div>
              )}

              {/* Guide tab */}
              {activeTab === "guide" && hasTabs && (
                <motion.div
                  key="guide"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  {/* Mode switcher */}
                  <div
                    className="flex border-b sticky top-0"
                    style={{
                      borderColor: "var(--lab-glass-border)",
                      background:  "var(--lab-glass-heavy)",
                      backdropFilter: "blur(8px)",
                      zIndex: 2,
                    }}
                  >
                    {(["guided", "free"] as const).map((m) => {
                      const isActiveMode = mode === m;
                      return (
                        <button
                          key={m}
                          onClick={() => onSetMode(m)}
                          className="flex-1 py-2.5 text-[11px] font-semibold capitalize transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                          style={{
                            background: isActiveMode ? `${effectiveAccent}10` : "transparent",
                            color:      isActiveMode ? effectiveAccent : "var(--lab-text-muted)",
                            borderBottom: isActiveMode ? `2px solid ${effectiveAccent}` : "2px solid transparent",
                          }}
                        >
                          {m === "guided" ? "Guided Mode" : "Free Explore"}
                        </button>
                      );
                    })}
                  </div>
                  {stepGuide}
                </motion.div>
              )}

              {/* Info tab */}
              {activeTab === "info" && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="p-3 space-y-3"
                >
                  <LabInfoCard />
                  {infoCards}
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* ── Observations pinned at bottom ── */}
          <div
            className="lab-obs-panel flex-shrink-0 border-t overflow-hidden"
            style={{
              borderColor: "var(--lab-glass-border)",
              background:  "var(--lab-glass-heavy)",
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
