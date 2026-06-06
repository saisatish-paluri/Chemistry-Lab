"use client";

import { useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ContextStep {
  number: number;
  title:  string;
  body:   string;
}

export interface ContextFact {
  icon:  string;
  label: string;
  value: string;
}

export interface LabContextPanelProps {
  title:      string;
  accent:     string;
  summary:    string;
  steps?:     ContextStep[];
  facts?:     ContextFact[];
  formula?:   string;
  formulaLabel?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function LabContextPanel({
  title,
  accent,
  summary,
  steps,
  facts,
  formula,
  formulaLabel,
}: LabContextPanelProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div
      style={{
        display:       "flex",
        flexDirection: "column",
        height:        "100%",
        overflowY:     "auto",
        padding:       "0 0 12px",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding:      "10px 14px 9px",
          borderBottom: "1px solid var(--lab-glass-border)",
          flexShrink:   0,
          background:   `linear-gradient(90deg, ${accent}06 0%, transparent 100%)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div
            style={{
              width:        24,
              height:       24,
              borderRadius: 7,
              background:   `${accent}16`,
              border:       `1px solid ${accent}28`,
              display:      "flex",
              alignItems:   "center",
              justifyContent: "center",
              flexShrink:   0,
            }}
          >
            <BookIcon accent={accent} />
          </div>
          <span
            style={{
              fontSize:      10,
              fontWeight:    700,
              textTransform: "uppercase",
              letterSpacing: "0.11em",
              color:         "var(--lab-text-muted)",
              flex:          1,
            }}
          >
            Lab Context
          </span>
          <button
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Collapse context panel" : "Expand context panel"}
            style={{
              width:        22,
              height:       22,
              borderRadius: 6,
              border:       "1px solid var(--lab-glass-border)",
              background:   "rgba(255,255,255,0.7)",
              cursor:       "pointer",
              display:      "flex",
              alignItems:   "center",
              justifyContent: "center",
              fontSize:     10,
              color:        "var(--lab-text-muted)",
              flexShrink:   0,
            }}
          >
            {expanded ? "▲" : "▼"}
          </button>
        </div>

        {/* Experiment title */}
        <p
          style={{
            fontSize:      12,
            fontWeight:    800,
            color:         accent,
            marginTop:     7,
            lineHeight:    1.3,
            letterSpacing: "-0.005em",
          }}
        >
          {title}
        </p>
      </div>

      {expanded && (
        <>
          {/* Summary */}
          <div
            style={{
              padding:   "10px 14px 0",
              flexShrink: 0,
            }}
          >
            <p
              style={{
                fontSize:   11.5,
                lineHeight: 1.70,
                color:      "var(--lab-text-secondary)",
              }}
            >
              {summary}
            </p>
          </div>

          {/* Key facts */}
          {facts && facts.length > 0 && (
            <div
              style={{
                margin:       "10px 14px 0",
                borderRadius: 9,
                border:       `1px solid ${accent}18`,
                background:   `${accent}05`,
                overflow:     "hidden",
                flexShrink:   0,
              }}
            >
              {facts.map((fact, i) => (
                <div
                  key={fact.label}
                  style={{
                    display:    "flex",
                    alignItems: "center",
                    gap:        8,
                    padding:    "7px 11px",
                    borderTop:  i > 0 ? `1px solid ${accent}12` : "none",
                    fontSize:   11,
                  }}
                >
                  <span style={{ fontSize: 13, flexShrink: 0 }}>{fact.icon}</span>
                  <span style={{ color: "var(--lab-text-muted)", flex: 1 }}>{fact.label}</span>
                  <span style={{ fontWeight: 700, color: accent, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                    {fact.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Formula / equation */}
          {formula && (
            <div
              style={{
                margin:       "10px 14px 0",
                borderRadius: 9,
                background:   `${accent}07`,
                border:       `1px solid ${accent}1c`,
                padding:      "9px 12px",
                flexShrink:   0,
              }}
            >
              {formulaLabel && (
                <p
                  style={{
                    fontSize:      9.5,
                    fontWeight:    700,
                    textTransform: "uppercase",
                    letterSpacing: "0.09em",
                    color:         `${accent}bb`,
                    marginBottom:  5,
                  }}
                >
                  {formulaLabel}
                </p>
              )}
              <p
                style={{
                  fontFamily:  "var(--font-mono, monospace)",
                  fontSize:    13,
                  fontWeight:  700,
                  color:       accent,
                  lineHeight:  1.5,
                  wordBreak:   "break-all",
                }}
              >
                {formula}
              </p>
            </div>
          )}

          {/* Procedure steps */}
          {steps && steps.length > 0 && (
            <div
              style={{
                padding:   "10px 14px 0",
                flexShrink: 0,
              }}
            >
              <p
                style={{
                  fontSize:      9.5,
                  fontWeight:    700,
                  textTransform: "uppercase",
                  letterSpacing: "0.09em",
                  color:         "var(--lab-text-muted)",
                  marginBottom:  8,
                }}
              >
                Procedure
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {steps.map((step) => (
                  <div key={step.number} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                    <div
                      style={{
                        width:        20,
                        height:       20,
                        borderRadius: "50%",
                        background:   `${accent}14`,
                        border:       `1px solid ${accent}28`,
                        display:      "flex",
                        alignItems:   "center",
                        justifyContent: "center",
                        fontSize:     9.5,
                        fontWeight:   800,
                        color:        accent,
                        flexShrink:   0,
                      }}
                    >
                      {step.number}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize:   11,
                          fontWeight: 700,
                          color:      "var(--lab-text-secondary)",
                          lineHeight: 1.3,
                          marginBottom: 2,
                        }}
                      >
                        {step.title}
                      </p>
                      <p
                        style={{
                          fontSize:   10.5,
                          color:      "var(--lab-text-muted)",
                          lineHeight: 1.6,
                        }}
                      >
                        {step.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function BookIcon({ accent }: { accent: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M2 2.5C2 2.5 4 2 6.5 2C9 2 11 2.5 11 2.5V11C11 11 9 10.5 6.5 10.5C4 10.5 2 11 2 11V2.5Z"
        stroke={accent} strokeWidth="1.2" strokeLinejoin="round"/>
      <line x1="6.5" y1="2" x2="6.5" y2="10.5" stroke={accent} strokeWidth="1" opacity="0.5"/>
    </svg>
  );
}
