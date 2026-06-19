"use client";

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
  title:         string;
  accent:        string;
  summary:       string;
  steps?:        ContextStep[];
  facts?:        ContextFact[];
  formula?:      string;
  formulaLabel?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function LabContextPanel({
  title,
  accent,
  summary,
  facts,
  formula,
  formulaLabel,
}: LabContextPanelProps) {
  // Extract first sentence as a short subtitle
  const subtitle = summary.split(/\.\s/)[0].replace(/\.$/, "").trim();
  const shortSub = subtitle.length > 90 ? subtitle.slice(0, 88) + "…" : subtitle;

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
      {/* ── Header ── */}
      <div
        style={{
          padding:      "10px 14px 9px",
          borderBottom: "1px solid var(--lab-glass-border)",
          flexShrink:   0,
          background:   `linear-gradient(90deg, ${accent}07 0%, transparent 100%)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div
            style={{
              width:          24,
              height:         24,
              borderRadius:   7,
              background:     `${accent}16`,
              border:         `1px solid ${accent}28`,
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              flexShrink:     0,
            }}
          >
            <FlaskMiniIcon accent={accent} />
          </div>
          <span
            style={{
              fontSize:      10,
              fontWeight:    700,
              textTransform: "uppercase",
              letterSpacing: "0.11em",
              color:         "var(--lab-text-muted)",
            }}
          >
            Lab Context
          </span>
        </div>

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

        {/* One-line subtitle — replaces the full summary paragraph */}
        <p
          style={{
            fontSize:   10.5,
            lineHeight: 1.5,
            color:      "var(--lab-text-muted)",
            marginTop:  4,
          }}
        >
          {shortSub}.
        </p>
      </div>

      {/* ── Formula hero ── */}
      {formula && (
        <div
          style={{
            margin:       "10px 14px 0",
            borderRadius: 12,
            background:   `linear-gradient(135deg, ${accent}10, ${accent}05)`,
            border:       `1px solid ${accent}22`,
            padding:      "10px 14px",
            flexShrink:   0,
          }}
        >
          {formulaLabel && (
            <p
              style={{
                fontSize:      9,
                fontWeight:    700,
                textTransform: "uppercase",
                letterSpacing: "0.10em",
                color:         `${accent}99`,
                marginBottom:  5,
              }}
            >
              {formulaLabel}
            </p>
          )}
          <p
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize:   14,
              fontWeight: 800,
              color:      accent,
              lineHeight: 1.5,
              wordBreak:  "break-all",
              letterSpacing: "0.01em",
            }}
          >
            {formula}
          </p>
        </div>
      )}

      {/* ── Key facts — visual badges ── */}
      {facts && facts.length > 0 && (
        <div
          style={{
            margin:       "10px 14px 0",
            display:      "flex",
            flexDirection: "column",
            gap:          4,
            flexShrink:   0,
          }}
        >
          <p
            style={{
              fontSize:      9,
              fontWeight:    700,
              textTransform: "uppercase",
              letterSpacing: "0.10em",
              color:         "var(--lab-text-muted)",
              marginBottom:  2,
            }}
          >
            Key Values
          </p>
          {facts.map((fact) => (
            <div
              key={fact.label}
              style={{
                display:        "flex",
                alignItems:     "center",
                gap:            8,
                padding:        "6px 10px",
                borderRadius:   9,
                background:     `${accent}07`,
                border:         `1px solid ${accent}14`,
              }}
            >
              <span style={{ fontSize: 13, flexShrink: 0 }}>{fact.icon}</span>
              <span
                style={{
                  flex:       1,
                  fontSize:   10.5,
                  color:      "var(--lab-text-muted)",
                  lineHeight: 1.3,
                }}
              >
                {fact.label}
              </span>
              <span
                style={{
                  fontWeight:         700,
                  color:              accent,
                  flexShrink:         0,
                  fontSize:           11,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {fact.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FlaskMiniIcon({ accent }: { accent: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M5 2v3.5L2.5 10h8L8 5.5V2" stroke={accent} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="5" y1="2" x2="8" y2="2" stroke={accent} strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M3.5 8.5 Q6.5 7.5 9.5 8.5" stroke={accent} strokeWidth="0.9" strokeLinecap="round" opacity="0.5"/>
    </svg>
  );
}
