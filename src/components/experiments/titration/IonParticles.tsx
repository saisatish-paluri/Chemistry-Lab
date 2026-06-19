"use client";

/**
 * IonParticles — real-time physics simulation of ions inside the titration flask.
 *
 * Rendered as SVG <g> children so they sit inside the parent <svg> coordinate
 * space and are automatically clipped by the flask clipPath.
 *
 * Physics:
 *  • Each ion has (x, y, vx, vy) in SVG units.
 *  • Euler integration at 25 fps (40 ms interval).
 *  • Bounces elastically off the trapezoidal flask walls (approximated as a
 *    rectangle for the liquid zone).
 *  • When swirlCount changes, angular velocity is applied around the flask
 *    centre for 1.5 s, then decays back to thermal drift speed.
 *
 * Ion types shown depend on pH:
 *   pH < 7  → H⁺ (blue) + Cl⁻ (amber) dominate
 *   pH ≈ 7  → all four types + H₂O in equal measure
 *   pH > 7  → Na⁺ (green) + OH⁻ (red) dominate
 */

import { useEffect, useRef, useState } from "react";

// ── Ion catalogue ─────────────────────────────────────────────────────────────

type IonType = "H+" | "OH-" | "Cl-" | "Na+" | "H2O";

const ION_COLOR: Record<IonType, string> = {
  "H+":  "#60a5fa",   // blue
  "OH-": "#f87171",   // red
  "Cl-": "#fbbf24",   // amber
  "Na+": "#34d399",   // green
  "H2O": "#bae6fd",   // sky (faint)
};

const ION_GLOW: Record<IonType, string> = {
  "H+":  "rgba(96,165,250,0.20)",
  "OH-": "rgba(248,113,113,0.20)",
  "Cl-": "rgba(251,191,36,0.18)",
  "Na+": "rgba(52,211,153,0.20)",
  "H2O": "rgba(186,230,253,0.12)",
};

const ION_R: Record<IonType, number> = {
  "H+":  2.0, "OH-": 2.6, "Cl-": 2.4, "Na+": 2.2, "H2O": 2.8,
};

const ION_LABEL: Record<IonType, string> = {
  "H+": "H⁺", "OH-": "OH⁻", "Cl-": "Cl⁻", "Na+": "Na⁺", "H2O": "",
};

// ── Distribution by pH ────────────────────────────────────────────────────────

function buildIonList(pH: number, total: number): IonType[] {
  const acidFrac = Math.max(0, Math.min(1, (7 - pH) / 7));    // 1 at pH 0, 0 at pH 7+
  const baseFrac = Math.max(0, Math.min(1, (pH - 7) / 7));    // 0 at pH 7-, 1 at pH 14

  const nH   = Math.round(acidFrac * total * 0.40);
  const nOH  = Math.round(baseFrac * total * 0.40);
  const nNa  = Math.min(4, Math.round((pH / 14) * 5));         // grows as titrant added
  const nCl  = Math.min(4, Math.round((1 - acidFrac) * 4) + 1);
  const nH2O = Math.max(0, total - nH - nOH - nNa - nCl);

  const list: IonType[] = [
    ...Array<IonType>(nH).fill("H+"),
    ...Array<IonType>(nOH).fill("OH-"),
    ...Array<IonType>(nNa).fill("Na+"),
    ...Array<IonType>(nCl).fill("Cl-"),
    ...Array<IonType>(nH2O).fill("H2O"),
  ];
  while (list.length < total) list.push("H2O");
  return list.slice(0, total);
}

// ── Particle interface ────────────────────────────────────────────────────────

interface Particle {
  x:    number;
  y:    number;
  vx:   number;
  vy:   number;
  type: IonType;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  pH:          number;
  /** Top of liquid fill in SVG coordinates. */
  flaskLiqY:   number;
  /** Number of flask swirls performed (triggers angular impulse). */
  swirlCount:  number;
  /** Whether the experiment is active enough to animate. */
  isActive:    boolean;
  // Flask liquid bounds in SVG coordinates (rectangular approximation)
  xMin?:       number;
  xMax?:       number;
  yMax?:       number;
}

const TOTAL       = 20;
const BASE_SPEED  = 0.55;  // SVG units per 40 ms frame (~14 SVG-u/s)
const SWIRL_DUR   = 1500;  // ms

export default function IonParticles({
  pH, flaskLiqY, swirlCount, isActive,
  xMin = 124, xMax = 250, yMax = 553,
}: Props) {

  const particlesRef = useRef<Particle[]>([]);
  const swirlRef     = useRef<{ endTime: number; cx: number; cy: number }>({
    endTime: 0, cx: 0, cy: 0,
  });
  const typesRef = useRef<IonType[]>(buildIonList(pH, TOTAL));
  const [render, setRender] = useState<Particle[]>([]);

  // ── Initialise particles once ─────────────────────────────────────────────
  useEffect(() => {
    const yMin = flaskLiqY + 18;
    const yRange = Math.max(10, yMax - yMin);
    typesRef.current = buildIonList(pH, TOTAL);
    particlesRef.current = Array.from({ length: TOTAL }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      return {
        x:    xMin + Math.random() * (xMax - xMin),
        y:    yMin + Math.random() * yRange,
        vx:   Math.cos(angle) * BASE_SPEED,
        vy:   Math.sin(angle) * BASE_SPEED,
        type: typesRef.current[i],
      };
    });
    setRender([...particlesRef.current]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Retype ions when pH changes significantly ─────────────────────────────
  useEffect(() => {
    typesRef.current = buildIonList(pH, TOTAL);
    particlesRef.current = particlesRef.current.map((p, i) => ({
      ...p, type: typesRef.current[i],
    }));
  }, [pH]);

  // ── Adjust y-boundary when liquid level changes ──────────────────────────
  useEffect(() => {
    const yMin = flaskLiqY + 18;
    particlesRef.current = particlesRef.current.map(p => ({
      ...p,
      y: Math.max(yMin, Math.min(yMax, p.y)),
    }));
  }, [flaskLiqY, yMax]);

  // ── Swirl impulse ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (swirlCount === 0) return;
    const cx = (xMin + xMax) / 2;
    const cy = (flaskLiqY + yMax) / 2;
    swirlRef.current = { endTime: Date.now() + SWIRL_DUR, cx, cy };
    // Apply centripetal kick
    particlesRef.current = particlesRef.current.map(p => {
      const dx   = p.x - cx;
      const dy   = p.y - cy;
      const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      return { ...p, vx: (-dy / dist) * 2.8, vy: (dx / dist) * 2.8 };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swirlCount]);

  // ── Physics loop at 25 fps ────────────────────────────────────────────────
  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(() => {
      const now      = Date.now();
      const swirling = now < swirlRef.current.endTime;
      const { cx, cy } = swirlRef.current;
      const yMin = flaskLiqY + 18;

      particlesRef.current = particlesRef.current.map(p => {
        let { x, y, vx, vy } = p;

        if (swirling) {
          // Centripetal pull toward swirl
          const dx   = p.x - cx;
          const dy   = p.y - cy;
          const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
          vx += (-dy / dist) * 0.10;
          vy += (dx  / dist) * 0.10;
          // Cap swirl speed
          const spd = Math.sqrt(vx * vx + vy * vy);
          if (spd > 3.2) { vx = (vx / spd) * 3.2; vy = (vy / spd) * 3.2; }
        } else {
          // Decay back toward thermal speed
          const spd = Math.sqrt(vx * vx + vy * vy);
          if (spd > BASE_SPEED * 1.15) {
            vx *= 0.96;
            vy *= 0.96;
          } else if (spd < BASE_SPEED * 0.6) {
            const a = Math.random() * Math.PI * 2;
            vx = Math.cos(a) * BASE_SPEED;
            vy = Math.sin(a) * BASE_SPEED;
          }
        }

        x += vx;
        y += vy;

        // Elastic wall bounce
        if (x < xMin) { x = xMin; vx = Math.abs(vx); }
        if (x > xMax) { x = xMax; vx = -Math.abs(vx); }
        if (y < yMin) { y = yMin; vy = Math.abs(vy); }
        if (y > yMax) { y = yMax; vy = -Math.abs(vy); }

        return { ...p, x, y, vx, vy };
      });

      setRender([...particlesRef.current]);
    }, 40);

    return () => clearInterval(id);
  }, [isActive, flaskLiqY, xMin, xMax, yMax]);

  if (!isActive || render.length === 0) return null;

  return (
    <g clipPath="url(#tw-flask-clip)" style={{ pointerEvents: "none" }}>
      {render.map((p, i) => {
        const r     = ION_R[p.type];
        const color = ION_COLOR[p.type];
        const glow  = ION_GLOW[p.type];
        const label = ION_LABEL[p.type];
        const isWater = p.type === "H2O";

        return (
          <g key={i} opacity={isWater ? 0.5 : 1}>
            {/* Glow halo */}
            <circle cx={p.x} cy={p.y} r={r + 2.5} fill={glow} />
            {/* Ion body */}
            <circle
              cx={p.x} cy={p.y} r={r}
              fill={color}
              fillOpacity={isWater ? 0.55 : 0.88}
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="0.5"
            />
            {/* Specular highlight */}
            <circle cx={p.x - r * 0.32} cy={p.y - r * 0.32} r={r * 0.35}
              fill="rgba(255,255,255,0.42)" />
            {/* Ion label (skip H₂O to reduce clutter) */}
            {label && (
              <text
                x={p.x} y={p.y + 0.9}
                fontSize="3.2"
                fill="white"
                textAnchor="middle"
                dominantBaseline="middle"
                fontWeight="800"
                style={{ userSelect: "none", pointerEvents: "none" }}
              >
                {label}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}
