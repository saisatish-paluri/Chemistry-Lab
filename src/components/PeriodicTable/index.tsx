"use client";

import { useState, useRef, useCallback, useEffect, startTransition, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { elements, ChemElement, ElementCategory, CATEGORY_LABELS, ELEMENT_EXTRAS } from "./data";
import {
  SHELL_DISTRIBUTIONS,
  CRYSTAL_STRUCTURES,
  CRYSTAL_DESCRIPTIONS,
  ELEMENT_APPLICATIONS,
  ELEMENT_FACTS,
} from "./element-detail-data";
import ElementTile from "./ElementTile";

const LEGEND_CATEGORIES: { cat: ElementCategory; label: string }[] = [
  { cat: "alkali-metal",          label: "Alkali Metal" },
  { cat: "alkaline-earth",        label: "Alkaline Earth" },
  { cat: "transition-metal",      label: "Transition Metal" },
  { cat: "post-transition-metal", label: "Post-Transition" },
  { cat: "metalloid",             label: "Metalloid" },
  { cat: "nonmetal",              label: "Nonmetal" },
  { cat: "halogen",               label: "Halogen" },
  { cat: "noble-gas",             label: "Noble Gas" },
  { cat: "lanthanide",            label: "Lanthanide" },
  { cat: "actinide",              label: "Actinide" },
  { cat: "unknown",               label: "Unknown" },
];

const CAT_COLOR: Record<ElementCategory, string> = {
  "alkali-metal":          "#b45309",
  "alkaline-earth":        "#c2410c",
  "transition-metal":      "#1d4ed8",
  "post-transition-metal": "#15803d",
  "metalloid":             "#0e7490",
  "nonmetal":              "#047857",
  "halogen":               "#a16207",
  "noble-gas":             "#0369a1",
  "lanthanide":            "#a21caf",
  "actinide":              "#be123c",
  "unknown":               "#475569",
};

const CAT_BG: Record<ElementCategory, string> = {
  "alkali-metal":          "rgba(253,230,138,0.55)",
  "alkaline-earth":        "rgba(254,202,202,0.55)",
  "transition-metal":      "rgba(219,234,254,0.70)",
  "post-transition-metal": "rgba(220,252,231,0.70)",
  "metalloid":             "rgba(207,250,254,0.70)",
  "nonmetal":              "rgba(209,250,229,0.70)",
  "halogen":               "rgba(254,240,138,0.65)",
  "noble-gas":             "rgba(224,242,254,0.70)",
  "lanthanide":            "rgba(250,232,255,0.65)",
  "actinide":              "rgba(255,228,230,0.65)",
  "unknown":               "rgba(241,245,249,0.80)",
};

const CAT_FACTS: Partial<Record<ElementCategory, string>> = {
  "alkali-metal":          "Highly reactive metals that form +1 ions. React vigorously with water.",
  "alkaline-earth":        "Reactive metals forming +2 ions. Essential to biology (Ca, Mg).",
  "transition-metal":      "Variable oxidation states, coloured compounds, catalytic activity.",
  "post-transition-metal": "Softer metals between transition metals and metalloids.",
  "metalloid":             "Properties intermediate between metals and non-metals. Semiconductor uses.",
  "nonmetal":              "Poor conductors. Form covalent bonds. Vital to organic chemistry.",
  "halogen":               "Highly electronegative. Form −1 ions and diatomic molecules.",
  "noble-gas":             "Full outer shells — chemically inert under normal conditions.",
  "lanthanide":            "f-block elements. Strong magnets and phosphors (REE).",
  "actinide":              "Radioactive f-block elements. Nuclear fuel cycle.",
  "unknown":               "Synthetic or insufficiently characterised — properties predicted.",
};

const PHASE_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  solid:  { label: "Solid",  bg: "rgba(219,234,254,0.65)", color: "#1d4ed8" },
  liquid: { label: "Liquid", bg: "rgba(209,250,229,0.65)", color: "#059669" },
  gas:    { label: "Gas",    bg: "rgba(250,232,255,0.65)", color: "#a21caf" },
};

const TOOLTIP_W = 200;
const TOOLTIP_H = 155;

const mainElements = elements.filter((e) => e.row <= 7);
const lanthanides  = elements.filter((e) => e.row === 8);
const actinides    = elements.filter((e) => e.row === 9);

// ── Atomic Orbital Visualization ──────────────────────────────────────────────

interface OrbitalRingProps {
  radius:     number;  // px — half of the ring div's width/height
  tiltX:      number;  // degrees
  tiltY:      number;  // degrees
  speed:      string;  // CSS duration e.g. "3s"
  color:      string;
  direction:  "cw" | "ccw";
  opacity:    number;
  dotSize?:   number;  // px, default 8
}

function OrbitalRing({ radius, tiltX, tiltY, speed, color, direction, opacity, dotSize = 8 }: OrbitalRingProps) {
  const size   = radius * 2;
  const dotOff = dotSize / 2;
  return (
    /* Outer wrapper: applies the static 3-D tilt */
    <div
      style={{
        position:       "absolute",
        top:            "50%",
        left:           "50%",
        width:          size,
        height:         size,
        marginLeft:     -radius,
        marginTop:      -radius,
        transformStyle: "preserve-3d",
        transform:      `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
        pointerEvents:  "none",
      }}
    >
      {/* Static ring border */}
      <div
        style={{
          position:     "absolute",
          inset:        0,
          borderRadius: "50%",
          border:       `1.5px solid ${color}`,
          opacity,
        }}
      />

      {/* Rotating arm — carries the electron */}
      <div
        style={{
          position:      "absolute",
          inset:         0,
          borderRadius:  "50%",
          animation:     `orbit-arm-${direction} ${speed} linear infinite`,
          transformStyle:"preserve-3d",
        }}
      >
        {/* Electron dot */}
        <div
          style={{
            position:     "absolute",
            top:          -dotOff,
            left:         "50%",
            marginLeft:   -dotOff,
            width:        dotSize,
            height:       dotSize,
            borderRadius: "50%",
            background:   color,
            boxShadow:    `0 0 ${dotSize + 2}px ${color}BB, 0 0 ${dotSize - 2}px ${color}`,
          }}
        />
      </div>
    </div>
  );
}

// ── Per-element orbital parameters ─────────────────────────────────────────────
// Derives tilt angles, speeds, directions, opacities, and nucleus sizing
// from intrinsic element properties so each element looks visually distinct.
interface OrbitalParams {
  tiltXs:     number[];
  tiltYs:     number[];
  speeds:     string[];
  dirs:       ("cw" | "ccw")[];
  opacities:  number[];
  nucSize:    number;  // px diameter
  dotSize:    number;  // electron dot px
  radiiScale: number;  // 0–1 compression for f-block
}

function deriveOrbitalParams(el: ChemElement): OrbitalParams {
  const n      = el.number;
  const col    = el.col;
  const period = getPeriod(el);
  const cat    = el.category;

  const isNobleGas   = cat === "noble-gas";
  const isFBlock     = cat === "lanthanide" || cat === "actinide";
  const isAlkali     = cat === "alkali-metal";
  const isTransition = cat === "transition-metal";

  // ── Tilt angles ──────────────────────────────────────────────────────────
  // Noble gases: symmetric (full outer shell → regular geometry)
  // Others: derived from atomic number, group, and period
  let tiltXs: number[];
  let tiltYs: number[];
  if (isNobleGas) {
    tiltXs = [78, 48, 62, 34];
    tiltYs = [0, 70, 140, 210];
  } else {
    const s1 = (n * 37 + col * 23) % 100;
    const s2 = (n * 53 + period * 17) % 100;
    tiltXs = [
      55 + Math.floor(s1 * 0.30),
      38 + Math.floor((s1 * 13 + col * 7)    % 32),
      52 + Math.floor((s2 * 7  + period * 9) % 25),
      32 + Math.floor((s2 * 19 + col * 11)   % 30),
    ];
    const yPhase = (n * 53 + col * 31) % 360;
    tiltYs = [
      yPhase % 360,
      (yPhase + 60 + (col * 7)    % 30) % 360,
      (yPhase + 120 + (period * 8) % 30) % 360,
      (yPhase + 185 + (n % 25))         % 360,
    ];
  }

  // ── Orbital speeds ───────────────────────────────────────────────────────
  // Inner shells faster; heavier period → slower base; f-block slowest outer
  const speedBase   = 1.4 + period * 0.28;
  const speedFactor = isFBlock ? 1.2 : isAlkali ? 0.85 : isTransition ? 1.05 : 1.0;
  const jitter      = ((n * 7 + col * 3) % 20) * 0.05;
  const speeds = [
    `${(speedBase * speedFactor + jitter * 0.3).toFixed(2)}s`,
    `${(speedBase * speedFactor * 1.58 + jitter * 0.5).toFixed(2)}s`,
    `${(speedBase * speedFactor * 2.2  + jitter * 0.7).toFixed(2)}s`,
    `${(speedBase * speedFactor * 3.0  + jitter).toFixed(2)}s`,
  ];

  // ── Rotation directions ──────────────────────────────────────────────────
  // Shells alternate; overall sense flips per period parity
  const dirs: ("cw" | "ccw")[] = period % 2 === 0
    ? ["ccw", "cw", "ccw", "cw"]
    : ["cw", "ccw", "cw", "ccw"];

  // ── Ring opacities ───────────────────────────────────────────────────────
  const opBase = isNobleGas ? 0.65 : cat === "actinide" ? 0.42 : 0.55;
  const opacities = [
    opBase,
    opBase - 0.10,
    opBase - 0.16,
    opBase - 0.22,
  ].map((v) => Math.max(0.18, Math.min(0.75, v)));

  // ── Nucleus & electron sizing ────────────────────────────────────────────
  // Scale with period: period-1 elements have tiny nuclei, period-7 large
  const nucSize = 13 + Math.min(period - 1, 6) * 1.5;
  const dotSize = 7  + Math.min(period - 1, 6) * 0.4;

  // F-block elements compress orbits slightly (denser arrangement)
  const radiiScale = isFBlock ? 0.90 : 1.0;

  return { tiltXs, tiltYs, speeds, dirs, opacities, nucSize, dotSize, radiiScale };
}

// Given an atomic number, return the period (1–7)
function getPeriod(el: ChemElement): number {
  if (el.row <= 7) return el.row;
  return el.row === 8 ? 6 : 7;
}

// Number of orbital rings to show (capped at 4 for visual clarity)
function shellCount(el: ChemElement): number {
  return Math.min(getPeriod(el), 4);
}

interface AtomVizProps {
  el:    ChemElement;
  color: string;
  size?: number;
}

function AtomViz({ el, color, size = 180 }: AtomVizProps) {
  const shells   = shellCount(el);
  const halfSize = size / 2;

  const { tiltXs, tiltYs, speeds, dirs, opacities, nucSize, dotSize, radiiScale } =
    deriveOrbitalParams(el);

  const radii = [
    halfSize * 0.28 * radiiScale,
    halfSize * 0.44 * radiiScale,
    halfSize * 0.60 * radiiScale,
    halfSize * 0.76 * radiiScale,
  ];

  const isNobleGas = el.category === "noble-gas";
  const isActinide = el.category === "actinide";

  return (
    <div
      style={{
        position:        "relative",
        width:           size,
        height:          size,
        perspective:     "500px",
        transformStyle:  "preserve-3d",
        flexShrink:      0,
      }}
    >
      {/* Background glow — size reflects element mass/period */}
      <div
        style={{
          position:     "absolute",
          inset:        0,
          borderRadius: "50%",
          background:   isActinide
            ? `radial-gradient(circle, ${color}20 0%, ${color}08 40%, transparent 70%)`
            : `radial-gradient(circle, ${color}14 0%, transparent 68%)`,
          pointerEvents:"none",
        }}
      />

      {/* Noble gas: outer stability halo (complete shell) */}
      {isNobleGas && (
        <div style={{
          position:     "absolute",
          inset:        3,
          borderRadius: "50%",
          border:       `1.5px solid ${color}28`,
          boxShadow:    `inset 0 0 14px ${color}0C`,
          pointerEvents:"none",
        }} />
      )}

      {/* Nucleus — diameter grows with period */}
      <div
        className="atom-nucleus-pulse"
        style={{
          position:     "absolute",
          top:          "50%",
          left:         "50%",
          transform:    "translate(-50%,-50%)",
          width:        nucSize,
          height:       nucSize,
          borderRadius: "50%",
          background:   color,
          zIndex:       10,
          ["--nuc-color" as string]: color,
        }}
      />
      {/* Nucleus outer texture ring */}
      <div style={{
        position:     "absolute",
        top:          "50%",
        left:         "50%",
        transform:    "translate(-50%,-50%)",
        width:        nucSize + 8,
        height:       nucSize + 8,
        borderRadius: "50%",
        border:       `1px solid ${color}44`,
        pointerEvents:"none",
        zIndex:       9,
      }} />
      {/* Actinide: second nucleus ring (radioactive instability cue) */}
      {isActinide && (
        <div style={{
          position:     "absolute",
          top:          "50%",
          left:         "50%",
          transform:    "translate(-50%,-50%)",
          width:        nucSize + 18,
          height:       nucSize + 18,
          borderRadius: "50%",
          border:       `1px dashed ${color}28`,
          pointerEvents:"none",
          zIndex:       8,
        }} />
      )}

      {/* Orbital rings */}
      {Array.from({ length: shells }, (_, i) => (
        <OrbitalRing
          key={i}
          radius={radii[i]}
          tiltX={tiltXs[i]}
          tiltY={tiltYs[i]}
          speed={speeds[i]}
          color={color}
          direction={dirs[i]}
          opacity={opacities[i]}
          dotSize={dotSize}
        />
      ))}
    </div>
  );
}

// ── Crystal structure 3-D projection ──────────────────────────────────────────

type CrystalPt = [number, number, number];
type CrystalEdge = [CrystalPt, CrystalPt];

const CRYSTAL_FOV   = 3.4;
const CRYSTAL_CX    = 100;
const CRYSTAL_CY    = 100;
const CRYSTAL_SCALE = 66;

function projectCrystalPoints(
  pts:  CrystalPt[],
  rotX: number,
  rotY: number,
): { px: number; py: number; pz: number }[] {
  const rx = (rotX * Math.PI) / 180;
  const ry = (rotY * Math.PI) / 180;
  const cX = Math.cos(rx), sX = Math.sin(rx);
  const cY = Math.cos(ry), sY = Math.sin(ry);
  return pts.map(([x, y, z]) => {
    const x1 =  x * cY + z * sY;
    const z1 = -x * sY + z * cY;
    const y2 =  y * cX - z1 * sX;
    const z2 =  y * sX + z1 * cX;
    const f  = CRYSTAL_FOV / (CRYSTAL_FOV + z2 + 2);
    return { px: CRYSTAL_CX + x1 * f * CRYSTAL_SCALE, py: CRYSTAL_CY + y2 * f * CRYSTAL_SCALE, pz: z2 };
  });
}

const CUBE_CORNERS: CrystalPt[] = [
  [-1,-1,-1],[1,-1,-1],[-1,1,-1],[1,1,-1],
  [-1,-1, 1],[1,-1, 1],[-1,1, 1],[1,1, 1],
];
const CUBE_EDGES: CrystalEdge[] = [
  [[-1,-1,-1],[1,-1,-1]], [[1,-1,-1],[1,1,-1]], [[1,1,-1],[-1,1,-1]], [[-1,1,-1],[-1,-1,-1]],
  [[-1,-1, 1],[1,-1, 1]], [[1,-1, 1],[1,1, 1]], [[1,1, 1],[-1,1, 1]], [[-1,1, 1],[-1,-1, 1]],
  [[-1,-1,-1],[-1,-1, 1]], [[1,-1,-1],[1,-1, 1]], [[1,1,-1],[1,1, 1]], [[-1,1,-1],[-1,1, 1]],
];

const HCP_BOTTOM: CrystalPt[] = Array.from({ length: 6 }, (_, i) => {
  const a = (i * Math.PI) / 3;
  return [Math.cos(a), Math.sin(a), -1];
});
const HCP_TOP: CrystalPt[] = Array.from({ length: 6 }, (_, i) => {
  const a = (i * Math.PI) / 3;
  return [Math.cos(a), Math.sin(a), 1];
});
const HCP_MID: CrystalPt[] = Array.from({ length: 3 }, (_, i) => {
  const a = (i * (2 * Math.PI)) / 3 + Math.PI / 6;
  return [Math.cos(a) * 0.667, Math.sin(a) * 0.667, 0];
});
const HCP_EDGES: CrystalEdge[] = [
  ...Array.from({ length: 6 }, (_, i) => [HCP_BOTTOM[i], HCP_BOTTOM[(i + 1) % 6]] as CrystalEdge),
  ...Array.from({ length: 6 }, (_, i) => [HCP_TOP[i],    HCP_TOP[(i + 1) % 6]]    as CrystalEdge),
  ...Array.from({ length: 6 }, (_, i) => [HCP_BOTTOM[i], HCP_TOP[i]]              as CrystalEdge),
];

interface CrystalSystemDef {
  atoms:       CrystalPt[];
  edges:       CrystalEdge[];
  accentAtoms: number[];
}

function buildCrystalSystem(structure: string): CrystalSystemDef | null {
  switch (structure) {
    case "Simple Cubic":
      return { atoms: CUBE_CORNERS, edges: CUBE_EDGES, accentAtoms: [] };
    case "BCC":
      return { atoms: [...CUBE_CORNERS, [0,0,0]], edges: CUBE_EDGES, accentAtoms: [8] };
    case "FCC": {
      const faces: CrystalPt[] = [[0,0,-1],[0,0,1],[0,-1,0],[0,1,0],[-1,0,0],[1,0,0]];
      return { atoms: [...CUBE_CORNERS, ...faces], edges: CUBE_EDGES, accentAtoms: [8,9,10,11,12,13] };
    }
    case "Diamond Cubic": {
      const faces: CrystalPt[]  = [[0,0,-1],[0,0,1],[0,-1,0],[0,1,0],[-1,0,0],[1,0,0]];
      const inner: CrystalPt[]  = [[0.5,0.5,0.5],[-0.5,-0.5,0.5],[-0.5,0.5,-0.5],[0.5,-0.5,-0.5]];
      return { atoms: [...CUBE_CORNERS, ...faces, ...inner], edges: CUBE_EDGES, accentAtoms: [8,9,10,11,12,13,14,15,16,17] };
    }
    case "HCP":
      return { atoms: [...HCP_BOTTOM, ...HCP_TOP, ...HCP_MID], edges: HCP_EDGES, accentAtoms: [12,13,14] };
    default:
      return null;
  }
}

// Defined outside AtomModal to satisfy rerender-no-inline-components rule.
function CrystalViz({ structure, color }: { structure: string; color: string }) {
  const [rotX, setRotX] = useState(-18);
  const [rotY, setRotY] = useState(28);
  const dragging   = useRef(false);
  const lastMouse  = useRef({ x: 0, y: 0 });

  const sys = useMemo(() => buildCrystalSystem(structure), [structure]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current  = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!e.touches[0]) return;
    dragging.current  = true;
    lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      setRotY(r => r + dx * 0.55);
      setRotX(r => r + dy * 0.55);
    };
    const onTouch = (e: TouchEvent) => {
      if (!dragging.current || !e.touches[0]) return;
      const dx = e.touches[0].clientX - lastMouse.current.x;
      const dy = e.touches[0].clientY - lastMouse.current.y;
      lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setRotY(r => r + dx * 0.55);
      setRotX(r => r + dy * 0.55);
    };
    const onUp = () => { dragging.current = false; };
    document.addEventListener("mousemove",  onMove);
    document.addEventListener("touchmove",  onTouch, { passive: true });
    document.addEventListener("mouseup",    onUp);
    document.addEventListener("touchend",   onUp);
    return () => {
      document.removeEventListener("mousemove",  onMove);
      document.removeEventListener("touchmove",  onTouch);
      document.removeEventListener("mouseup",    onUp);
      document.removeEventListener("touchend",   onUp);
    };
  }, []);

  if (!sys) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "28px 0" }}>
        <div style={{
          width: 120, height: 120, borderRadius: 14,
          background: `${color}08`, border: `1px solid ${color}18`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 52, color: `${color}60`,
        }}>
          ⬡
        </div>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--lab-text-secondary)" }}>
          {structure}
        </p>
        <p style={{ fontSize: 11, color: "var(--lab-text-muted)", maxWidth: 260, textAlign: "center" }}>
          {CRYSTAL_DESCRIPTIONS[structure] ?? "Structure data not available"}
        </p>
      </div>
    );
  }

  const { atoms, edges, accentAtoms } = sys;
  const projAtoms = projectCrystalPoints(atoms, rotX, rotY);
  const edgeStarts = edges.map(e => e[0]);
  const edgeEnds   = edges.map(e => e[1]);
  const projStarts = projectCrystalPoints(edgeStarts, rotX, rotY);
  const projEnds   = projectCrystalPoints(edgeEnds,   rotX, rotY);

  const sortedIdxs = projAtoms
    .map((p, i) => ({ ...p, i }))
    .sort((a, b) => a.pz - b.pz)
    .map(p => p.i);

  return (
    <svg
      viewBox="0 0 200 200"
      width={200}
      height={200}
      style={{ cursor: "grab", userSelect: "none", display: "block", touchAction: "none" }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <circle cx={100} cy={100} r={96} fill={`${color}04`} stroke={`${color}10`} strokeWidth={1} />
      {edges.map((_, i) => (
        <line
          key={i}
          x1={projStarts[i].px} y1={projStarts[i].py}
          x2={projEnds[i].px}   y2={projEnds[i].py}
          stroke={`${color}40`}
          strokeWidth={1.2}
        />
      ))}
      {sortedIdxs.map(i => {
        const { px, py, pz } = projAtoms[i];
        const isAccent = accentAtoms.includes(i);
        const depth    = Math.max(0, Math.min(1, (pz + 2) / 4));
        const r        = isAccent ? 8 : 5.5;
        const opacity  = 0.55 + depth * 0.45;
        return (
          <circle
            key={i}
            cx={px} cy={py} r={r}
            fill={isAccent ? color : "rgba(100,116,139,0.75)"}
            stroke={isAccent ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.6)"}
            strokeWidth={isAccent ? 1.5 : 1}
            opacity={opacity}
          />
        );
      })}
    </svg>
  );
}

// ── Modal tab sub-components (outside modal to avoid inline-component penalty) ─

type TabId = "overview" | "atom" | "structure" | "applications";

const TAB_LABELS: Record<TabId, string> = {
  overview:     "Overview",
  atom:         "Atom",
  structure:    "Structure",
  applications: "Applications",
};

const SHELL_LABELS = ["K", "L", "M", "N", "O", "P", "Q"];

// Row of labeled data fields inside a rounded card.
function DataRow({ label, value, accent, index }: { label: string; value: string; accent?: string; index: number }) {
  return (
    <div style={{
      display:        "flex",
      alignItems:     "center",
      justifyContent: "space-between",
      padding:        "9px 14px",
      borderTop:      index > 0 ? "1px solid rgba(148,163,184,0.10)" : "none",
      background:     index % 2 === 0 ? "rgba(248,250,252,0.65)" : "rgba(255,255,255,0.5)",
      fontSize:       12,
      gap:            10,
    }}>
      <span style={{ color: "var(--lab-text-muted)", fontWeight: 500 }}>{label}</span>
      <span style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums", color: accent ?? "var(--lab-text-secondary)", textAlign: "right" }}>
        {value}
      </span>
    </div>
  );
}

function OverviewTab({ el, color, bg, shells }: {
  el:     ChemElement;
  color:  string;
  bg:     string;
  shells: number[];
}) {
  const period  = getPeriod(el);
  const extra   = ELEMENT_EXTRAS[el.number];
  const phase   = extra ? PHASE_BADGE[extra.phaseAtRTP] : null;
  const catFact = CAT_FACTS[el.category];
  const fact    = ELEMENT_FACTS[el.number];

  const rows = [
    { label: "Atomic Mass", value: `${el.mass} u` },
    { label: "Period",      value: `${period}` },
    { label: "Group",       value: `${el.col}` },
    { label: "Category",    value: CATEGORY_LABELS[el.category], accent: color },
    ...(extra?.meltingC ? [{ label: "Melting Point", value: `${extra.meltingC} °C` }] : []),
    ...(extra?.boilingC ? [{ label: "Boiling Point", value: `${extra.boilingC} °C` }] : []),
  ];

  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{   opacity: 0, x: -10 }}
      transition={{ duration: 0.22, ease: "easeInOut" }}
      style={{ padding: "18px 24px 24px", display: "flex", flexDirection: "column", gap: 14 }}
    >
      {/* Badges */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: "4px 13px", borderRadius: 100,
          background: bg, color, border: `1px solid ${color}28`,
        }}>
          {CATEGORY_LABELS[el.category]}
        </span>
        {phase && (
          <span style={{
            fontSize: 11, fontWeight: 700, padding: "4px 13px", borderRadius: 100,
            background: phase.bg, color: phase.color, border: `1px solid ${phase.color}28`,
          }}>
            {phase.label}
          </span>
        )}
        {CRYSTAL_STRUCTURES[el.number] && (
          <span style={{
            fontSize: 11, fontWeight: 700, padding: "4px 13px", borderRadius: 100,
            background: "rgba(248,250,252,0.9)", color: "var(--lab-text-secondary)",
            border: "1px solid rgba(148,163,184,0.22)",
          }}>
            {CRYSTAL_STRUCTURES[el.number]}
          </span>
        )}
      </div>

      {/* Shell distribution mini-bar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "var(--lab-text-muted)", textTransform: "uppercase", letterSpacing: "0.09em" }}>
          Shell Distribution
        </p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {shells.map((count, i) => (
            <div key={i} style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              padding: "5px 10px", borderRadius: 8, minWidth: 38,
              background: i === 0 ? `${color}12` : "rgba(248,250,252,0.85)",
              border: `1px solid ${i === 0 ? color + "28" : "rgba(148,163,184,0.16)"}`,
            }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: "var(--lab-text-muted)" }}>
                {SHELL_LABELS[i]}
              </span>
              <span style={{ fontSize: 16, fontWeight: 900, color: i === 0 ? color : "var(--lab-text-primary)", lineHeight: 1.2 }}>
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Data grid */}
      <div style={{ borderRadius: 12, border: "1px solid rgba(148,163,184,0.18)", overflow: "hidden" }}>
        {rows.map(({ label, value, accent }, i) => (
          <DataRow key={label} label={label} value={value} accent={accent} index={i} />
        ))}
      </div>

      {/* Interesting fact */}
      {(fact ?? catFact) && (
        <div style={{
          padding: "12px 16px", borderRadius: 12,
          background: `${color}07`, border: `1px solid ${color}16`,
        }}>
          <p style={{ fontSize: 10, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 6 }}>
            Interesting Fact
          </p>
          <p style={{ fontSize: 12, lineHeight: 1.7, color: "var(--lab-text-secondary)" }}>
            {fact ?? catFact}
          </p>
        </div>
      )}
    </motion.div>
  );
}

function AtomTab({ el, color, shells }: { el: ChemElement; color: string; shells: number[] }) {
  const extra = ELEMENT_EXTRAS[el.number];

  return (
    <motion.div
      key="atom"
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{   opacity: 0, x: -10 }}
      transition={{ duration: 0.22, ease: "easeInOut" }}
      style={{ padding: "20px 24px 28px", display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}
    >
      {/* Atom model */}
      <div style={{
        padding: "20px",
        borderRadius: 18,
        background: `radial-gradient(ellipse at center, ${color}07 0%, transparent 70%)`,
        border: `1px solid ${color}14`,
      }}>
        <AtomViz el={el} color={color} size={210} />
      </div>

      {/* Shell distribution cards */}
      <div style={{ width: "100%" }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "var(--lab-text-muted)", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 10 }}>
          Shell Distribution
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {shells.map((count, i) => (
            <div key={i} style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              padding: "10px 16px", borderRadius: 12, flex: "1 1 auto", minWidth: 60,
              background: i === 0 ? `${color}10` : "rgba(248,250,252,0.85)",
              border: `1px solid ${i === 0 ? color + "28" : "rgba(148,163,184,0.16)"}`,
              transition: "box-shadow 0.15s",
            }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--lab-text-muted)" }}>
                {SHELL_LABELS[i]} Shell
              </span>
              <span style={{ fontSize: 24, fontWeight: 900, color: i === 0 ? color : "var(--lab-text-primary)", lineHeight: 1.15 }}>
                {count}
              </span>
              <span style={{ fontSize: 9, color: "var(--lab-text-subtle)" }}>electrons</span>
            </div>
          ))}
        </div>
      </div>

      {/* Electron configuration */}
      {extra?.electronConfig && (
        <div style={{ width: "100%", padding: "12px 16px", borderRadius: 12, background: `${color}08`, border: `1px solid ${color}18` }}>
          <p style={{ fontSize: 10, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 6 }}>
            Electron Configuration
          </p>
          <p style={{ fontFamily: "monospace", fontSize: 15, fontWeight: 700, color: "var(--lab-text-primary)", letterSpacing: "0.02em" }}>
            {extra.electronConfig}
          </p>
        </div>
      )}

      <p style={{ fontSize: 10, color: "var(--lab-text-subtle)", textAlign: "center" }}>
        Orbital rings represent principal electron shells. Animation speed reflects relative orbital period.
      </p>
    </motion.div>
  );
}

function StructureTab({ el, color }: { el: ChemElement; color: string }) {
  const structure = CRYSTAL_STRUCTURES[el.number];
  const desc      = structure ? (CRYSTAL_DESCRIPTIONS[structure] ?? "") : "";

  return (
    <motion.div
      key="structure"
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{   opacity: 0, x: -10 }}
      transition={{ duration: 0.22, ease: "easeInOut" }}
      style={{ padding: "20px 24px 28px", display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}
    >
      {structure ? (
        <>
          <div style={{
            padding: "16px",
            borderRadius: 18,
            background: `radial-gradient(ellipse at center, ${color}06 0%, transparent 70%)`,
            border: `1px solid ${color}12`,
          }}>
            <CrystalViz structure={structure} color={color} />
          </div>

          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 18, fontWeight: 800, color: "var(--lab-text-primary)", marginBottom: 6 }}>
              {structure}
            </p>
            <p style={{ fontSize: 12, lineHeight: 1.65, color: "var(--lab-text-muted)", maxWidth: 340 }}>
              {desc}
            </p>
          </div>

          <div style={{
            width: "100%", padding: "10px 16px", borderRadius: 12,
            background: "rgba(248,250,252,0.8)", border: "1px solid rgba(148,163,184,0.16)",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>⟳</span>
            <p style={{ fontSize: 11, color: "var(--lab-text-muted)" }}>
              Drag the model to rotate the unit cell in 3D space
            </p>
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--lab-text-muted)" }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>?</p>
          <p style={{ fontSize: 14, fontWeight: 600 }}>Crystal structure not yet determined</p>
          <p style={{ fontSize: 12, marginTop: 6 }}>Properties of synthetic or insufficiently characterised elements are predicted.</p>
        </div>
      )}
    </motion.div>
  );
}

const APP_ICONS = ["🔬", "⚡", "🏗️", "🛸", "💊", "🌱", "🔋", "✈️"];

function ApplicationsTab({ el, color }: { el: ChemElement; color: string }) {
  const apps  = ELEMENT_APPLICATIONS[el.number];
  const extra = ELEMENT_EXTRAS[el.number];
  const list  = apps ?? (extra?.commonUse ? [extra.commonUse] : []);

  return (
    <motion.div
      key="applications"
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{   opacity: 0, x: -10 }}
      transition={{ duration: 0.22, ease: "easeInOut" }}
      style={{ padding: "20px 24px 28px" }}
    >
      {list.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "var(--lab-text-muted)", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 4 }}>
            Real-World Applications
          </p>
          {list.map((app, i) => {
            const parts = app.split(":");
            const title = parts[0].trim();
            const desc  = parts[1]?.trim();
            return (
              <div
                key={i}
                className="app-card"
                style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "12px 14px", borderRadius: 12,
                  background: "rgba(248,250,252,0.85)",
                  border: "1px solid rgba(148,163,184,0.16)",
                }}
              >
                <span style={{
                  width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                  background: `${color}10`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 17,
                }}>
                  {APP_ICONS[i % APP_ICONS.length]}
                </span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--lab-text-primary)", lineHeight: 1.3 }}>
                    {title}
                  </p>
                  {desc && (
                    <p style={{ fontSize: 11, color: "var(--lab-text-muted)", marginTop: 3, lineHeight: 1.5 }}>
                      {desc}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--lab-text-muted)" }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>⚗️</p>
          <p style={{ fontSize: 14, fontWeight: 600 }}>Application data not yet available</p>
          <p style={{ fontSize: 12, marginTop: 6 }}>This element is synthetic or insufficiently characterised for common applications.</p>
        </div>
      )}
    </motion.div>
  );
}

// ── Tab bar (extracted for reuse / no-inline-component rule) ───────────────────

function ModalTabBar({ active, color, onChange }: {
  active:   TabId;
  color:    string;
  onChange: (t: TabId) => void;
}) {
  const tabs: TabId[] = ["overview", "atom", "structure", "applications"];
  return (
    <div
      role="tablist"
      aria-label="Element information sections"
      style={{
        display:       "flex",
        flexShrink:    0,
        borderBottom:  "1px solid rgba(148,163,184,0.16)",
        paddingInline: "24px",
        gap:           4,
        overflowX:     "auto",
      }}
    >
      {tabs.map(tab => (
        <button
          key={tab}
          role="tab"
          aria-selected={active === tab}
          onClick={() => onChange(tab)}
          style={{
            padding:      "11px 14px 10px",
            fontSize:     12,
            fontWeight:   active === tab ? 700 : 500,
            color:        active === tab ? color : "var(--lab-text-muted)",
            background:   "none",
            border:       "none",
            borderBottom: `2px solid ${active === tab ? color : "transparent"}`,
            cursor:       "pointer",
            whiteSpace:   "nowrap",
            transition:   "color 0.15s, border-color 0.15s",
            flexShrink:   0,
          } as React.CSSProperties}
        >
          {TAB_LABELS[tab]}
        </button>
      ))}
    </div>
  );
}

// ── Atom Modal (portal) ────────────────────────────────────────────────────────

function AtomModal({ el, onClose }: { el: ChemElement; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const color  = CAT_COLOR[el.category];
  const bg     = CAT_BG[el.category];
  const extra  = ELEMENT_EXTRAS[el.number];
  const phase  = extra ? PHASE_BADGE[extra.phaseAtRTP] : null;
  const shells = SHELL_DISTRIBUTIONS[el.number] ?? [2];

  const handleTabChange = useCallback((t: TabId) => {
    startTransition(() => setActiveTab(t));
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="atom-modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={`Element details: ${el.name}`}
    >
      <motion.div
        className="atom-modal-card"
        initial={{ opacity: 0, scale: 0.95, y: 18 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{   opacity: 0, scale: 0.96, y: 12  }}
        transition={{ duration: 0.30, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent top bar */}
        <div style={{
          height:     4,
          flexShrink: 0,
          background: `linear-gradient(90deg, transparent 0%, ${color}80 15%, ${color} 50%, ${color}80 85%, transparent 100%)`,
        }} />

        {/* Header */}
        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          padding:        "14px 24px 12px",
          borderBottom:   "1px solid rgba(148,163,184,0.14)",
          flexShrink:     0,
          gap:            12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 12, flexShrink: 0,
              background: bg, border: `1px solid ${color}28`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1 }}>
                {el.symbol}
              </span>
            </div>
            <div>
              <p style={{ fontSize: 18, fontWeight: 800, color: "var(--lab-text-primary)", lineHeight: 1.2 }}>
                {el.name}
              </p>
              <p style={{ fontSize: 11, color: "var(--lab-text-muted)", marginTop: 2 }}>
                Z = {el.number} · {el.mass} u
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {phase && (
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 100,
                background: phase.bg, color: phase.color, border: `1px solid ${phase.color}28`,
              }}>
                {phase.label}
              </span>
            )}
            <button
              onClick={onClose}
              aria-label="Close element details"
              className="modal-close-btn"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <ModalTabBar active={activeTab} color={color} onChange={handleTabChange} />

        {/* Tab content */}
        <div style={{ flex: "1 1 0%", overflowY: "auto", minHeight: 0 }}>
          <AnimatePresence mode="wait">
            {activeTab === "overview"     && <OverviewTab     el={el} color={color} bg={bg} shells={shells} />}
            {activeTab === "atom"         && <AtomTab         el={el} color={color} shells={shells} />}
            {activeTab === "structure"    && <StructureTab    el={el} color={color} />}
            {activeTab === "applications" && <ApplicationsTab el={el} color={color} />}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// ── Hover tooltip ─────────────────────────────────────────────────────────────

function HoverTooltip({ el }: { el: ChemElement }) {
  const color = CAT_COLOR[el.category];
  const bg    = CAT_BG[el.category];
  return (
    <div style={{
      padding:        14,
      pointerEvents:  "none",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: "var(--lab-text-subtle)" }}>
          #{el.number}
        </span>
        <span style={{
          fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 100,
          background: bg, color, border: `1px solid ${color}35`,
        }}>
          {CATEGORY_LABELS[el.category]}
        </span>
      </div>
      <div style={{ fontSize: 38, fontWeight: 900, lineHeight: 1, marginBottom: 4, color }}>
        {el.symbol}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--lab-text-primary)" }}>
        {el.name}
      </div>
      <div style={{ fontSize: 11, marginTop: 2, fontVariantNumeric: "tabular-nums", color: "var(--lab-text-muted)" }}>
        {el.mass} u
      </div>
      <div style={{
        fontSize: 10, marginTop: 8, paddingTop: 8,
        borderTop: "1px solid rgba(148,163,184,0.15)",
        color: "var(--lab-text-subtle)",
      }}>
        Period {el.row <= 7 ? el.row : el.row === 8 ? 6 : 7}{" · "}Group {el.col}
        {" · "}
        <span style={{ fontWeight: 600, color: "var(--lab-text-secondary)" }}>Click for details</span>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function PeriodicTable() {
  const [hovered,     setHovered]     = useState<ChemElement | null>(null);
  const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null);
  const [selected,    setSelected]    = useState<ChemElement | null>(null);
  const [mounted,     setMounted]     = useState(false);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { startTransition(() => setMounted(true)); }, []);

  const handleHover = useCallback((el: ChemElement | null, rect?: DOMRect) => {
    if (clearTimer.current) clearTimeout(clearTimer.current);
    if (el !== null) {
      setHovered(el);
      setHoveredRect(rect ?? null);
    } else {
      clearTimer.current = setTimeout(() => {
        setHovered(null);
        setHoveredRect(null);
      }, 180);
    }
  }, []);

  const handleClick = useCallback((el: ChemElement) => {
    setSelected(el);
  }, []);

  const anyHovered = hovered !== null;

  // Tooltip position
  const tooltipStyle = (() => {
    if (!hoveredRect || !mounted) return null;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let top  = hoveredRect.bottom + 8;
    let left = hoveredRect.left + hoveredRect.width / 2 - TOOLTIP_W / 2;
    if (top + TOOLTIP_H > vh - 16) top = hoveredRect.top - TOOLTIP_H - 8;
    left = Math.max(8, Math.min(vw - TOOLTIP_W - 8, left));
    return { top, left };
  })();

  const tooltipEl =
    mounted && hovered && tooltipStyle
      ? createPortal(
          <AnimatePresence mode="wait">
            <motion.div
              key={hovered.number}
              initial={{ opacity: 0, scale: 0.86, y: -5 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{ opacity: 0,   scale: 0.90, y: -4  }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              style={{
                position:       "fixed",
                top:            tooltipStyle.top,
                left:           tooltipStyle.left,
                width:          TOOLTIP_W,
                zIndex:         9999,
                pointerEvents:  "none",
                background:     "rgba(255,255,255,0.97)",
                border:         `1px solid ${CAT_COLOR[hovered.category]}28`,
                borderRadius:   14,
                boxShadow:      `0 8px 32px rgba(15,23,42,0.12), 0 2px 8px rgba(15,23,42,0.06), 0 0 0 1px rgba(255,255,255,0.8) inset`,
                backdropFilter: "blur(16px)",
              }}
              aria-live="polite"
            >
              <HoverTooltip el={hovered} />
            </motion.div>
          </AnimatePresence>,
          document.body,
        )
      : null;

  const modalEl =
    mounted && selected
      ? createPortal(
          <AnimatePresence mode="wait">
            <AtomModal key={selected.number} el={selected} onClose={() => setSelected(null)} />
          </AnimatePresence>,
          document.body,
        )
      : null;

  return (
    <section
      id="elements"
      className="relative overflow-hidden"
      style={{
        paddingTop:    "calc(64px + 3rem)",
        paddingBottom: "4rem",
        background:
          "radial-gradient(ellipse at 55% -10%, rgba(37,99,235,0.06) 0%, transparent 50%)," +
          "linear-gradient(180deg, #eef4ff 0%, #f5f8ff 40%, #f8fafc 75%, #ffffff 100%)",
      }}
    >
      {/* ── Background decoration ── */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(59,130,246,0.07) 1px, transparent 1px)",
            backgroundSize:  "32px 32px",
          }}
        />
        <div style={{
          position: "absolute", top: "-60px", left: "50%",
          transform: "translateX(-50%)",
          width: 1100, height: 420, borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(37,99,235,0.055) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "8%", right: "3%",
          width: 480, height: 480, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.035) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: "30%", left: "-4%",
          width: 320, height: 320, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(14,165,233,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
      </div>

      {/* ── Section header ── */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ once: true, margin: "-40px" }}
        className="relative z-10 text-center mb-12 px-4"
      >
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
          <span className="section-tag section-tag-blue">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563eb", flexShrink: 0 }} />
            Interactive Reference
          </span>
        </div>

        <h2 style={{
          fontSize: "clamp(2rem, 5vw, 3.25rem)", fontWeight: 900,
          lineHeight: 1.08, letterSpacing: "-0.025em",
          color: "var(--lab-text-primary)", marginTop: 4,
        }}>
          Periodic Table of{" "}
          <span style={{
            background: "linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 55%, #7c3aed 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Elements
          </span>
        </h2>

        <p style={{ marginTop: 10, fontSize: 14, color: "var(--lab-text-muted)", letterSpacing: "0.01em", maxWidth: 520, margin: "10px auto 0" }}>
          118 elements · Hover to preview · Click any tile for interactive 3D atomic structure & data
        </p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15, ease: "easeOut" }}
          viewport={{ once: true }}
          style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 10, marginTop: 20 }}
        >
          {[
            { label: "Elements",   value: "118", accent: "#1d4ed8" },
            { label: "Periods",    value: "7",   accent: "#059669" },
            { label: "Groups",     value: "18",  accent: "#7c3aed" },
            { label: "Categories", value: "11",  accent: "#0891b2" },
          ].map(({ label, value, accent }) => (
            <div key={label} style={{
              padding: "7px 18px", borderRadius: 12, textAlign: "center",
              background: "rgba(255,255,255,0.92)",
              border: `1px solid ${accent}22`,
              boxShadow: `0 2px 8px rgba(15,23,42,0.06), 0 0 0 1px rgba(255,255,255,0.7) inset`,
            }}>
              <p style={{ fontSize: 18, fontWeight: 900, color: accent, lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--lab-text-muted)", marginTop: 3 }}>{label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* ── Table + legend (full width) ── */}
      <div className="relative z-10 max-w-[1520px] mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.60, delay: 0.08, ease: "easeOut" }}
          viewport={{ once: true, margin: "-40px" }}
          className="overflow-x-auto pb-4"
          style={{ WebkitOverflowScrolling: "touch", display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          {/* Main grid */}
          <div className="pt-grid" style={{ width: "fit-content" }}>
            {mainElements.map((el) => (
              <ElementTile
                key={el.number}
                element={el}
                onHover={handleHover}
                onClick={handleClick}
                isHighlighted={!anyHovered || hovered!.category === el.category}
                isActive={anyHovered && hovered!.category === el.category}
                isSelected={selected?.number === el.number}
              />
            ))}
            <div className="elem-placeholder" style={{ gridRow: 6, gridColumn: 3 }} title="Lanthanides 57–71">
              <span>57–71</span><span>Ln</span>
            </div>
            <div className="elem-placeholder" style={{ gridRow: 7, gridColumn: 3 }} title="Actinides 89–103">
              <span>89–103</span><span>An</span>
            </div>
          </div>

          {/* Connector */}
          <div style={{
            margin: "8px 0 4px",
            width: "calc(18 * var(--tile-w) + 17 * var(--tile-gap))",
            paddingLeft: "calc(2 * (var(--tile-w) + var(--tile-gap)))",
          }}>
            <div style={{ height: 1, background: "linear-gradient(90deg, rgba(148,163,184,0.40) 0%, rgba(148,163,184,0.06) 100%)" }} />
          </div>

          {/* F-block */}
          <div className="fblock-grid" style={{ width: "fit-content" }}>
            <div className="fblock-label" style={{ gridRow: 1, gridColumn: "1 / 3" }}>Lanthanides</div>
            <div className="fblock-label" style={{ gridRow: 2, gridColumn: "1 / 3" }}>Actinides</div>
            {lanthanides.map((el) => (
              <ElementTile
                key={el.number} element={el} gridRow={1} gridCol={el.col}
                onHover={handleHover} onClick={handleClick}
                isHighlighted={!anyHovered || hovered!.category === el.category}
                isActive={anyHovered && hovered!.category === el.category}
                isSelected={selected?.number === el.number}
              />
            ))}
            {actinides.map((el) => (
              <ElementTile
                key={el.number} element={el} gridRow={2} gridCol={el.col}
                onHover={handleHover} onClick={handleClick}
                isHighlighted={!anyHovered || hovered!.category === el.category}
                isActive={anyHovered && hovered!.category === el.category}
                isSelected={selected?.number === el.number}
              />
            ))}
          </div>
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.35 }}
          viewport={{ once: true }}
          style={{ marginTop: 22, display: "flex", flexWrap: "wrap", gap: 7 }}
        >
          {LEGEND_CATEGORIES.map(({ cat, label }) => (
            <div
              key={cat}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "4px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600,
                background: CAT_BG[cat], border: `1px solid ${CAT_COLOR[cat]}35`,
                color: CAT_COLOR[cat], cursor: "default",
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: CAT_COLOR[cat], flexShrink: 0 }} />
              {label}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Portals */}
      {tooltipEl}
      {modalEl}
    </section>
  );
}
