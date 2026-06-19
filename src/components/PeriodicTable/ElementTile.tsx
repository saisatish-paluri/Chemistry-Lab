"use client";

import { useRef, useState, memo } from "react";
import { ChemElement } from "./data";

interface Props {
  element:       ChemElement;
  gridRow?:      number;
  gridCol?:      number;
  onHover:       (el: ChemElement | null, rect?: DOMRect) => void;
  onClick:       (el: ChemElement) => void;
  isHighlighted: boolean;
  isActive:      boolean;
  isSelected:    boolean;
  trendBg?:      string;
  trendBorder?:  string;
}

// How many orbital rings to show based on period (row)
function orbitRings(row: number): number {
  if (row <= 1) return 1;
  if (row <= 2) return 2;
  if (row <= 4) return 3;
  return 4;
}

// Orbital ring speed in seconds (inner = faster)
const RING_SPEED = [1.2, 1.9, 2.8, 4.0];
const RING_R     = [9, 15, 21, 27];   // radii in the 64×64 SVG viewBox
// Electron colours tinted by category accent (fall back to sky blue)
const ELECTRON_COLORS = [
  "#60a5fa", "#34d399", "#f59e0b", "#f87171",
];

function ElementTile({
  element, gridRow, gridCol, onHover, onClick, isHighlighted, isActive, isSelected,
  trendBg, trendBorder,
}: Props) {
  const ref  = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const row  = gridRow ?? element.row;
  const col  = gridCol ?? element.col;
  const rings = orbitRings(element.row);

  const delayMs = Math.min(1400, ((row - 1) * 18 + (col - 1)) * 5);

  return (
    <div
      ref={ref}
      className={`elem-tile cat-${element.category}`}
      style={{
        gridRow:       row,
        gridColumn:    col,
        opacity:       isHighlighted ? 1 : 0.22,
        outline:       isSelected
          ? "2px solid var(--tile-border, var(--lab-blue-600))"
          : isActive
          ? "1px solid var(--tile-border, var(--lab-blue-500))"
          : undefined,
        outlineOffset: isSelected ? "2px" : isActive ? "1px" : undefined,
        boxShadow:     isSelected ? "0 0 16px var(--tile-border, rgba(96,165,250,0.5))" : undefined,
        transition:    "opacity 0.18s ease, outline 0.10s ease, box-shadow 0.15s ease",
        animationDelay: `${delayMs}ms`,
        position:      "relative",
        overflow:      isHovered ? "visible" : "hidden",
        ...(trendBg && { background: trendBg }),
        ...(trendBorder && { borderColor: trendBorder }),
      }}
      onMouseEnter={() => {
        setIsHovered(true);
        onHover(element, ref.current?.getBoundingClientRect());
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        onHover(null);
      }}
      onClick={() => onClick(element)}
      aria-label={`${element.name}, atomic number ${element.number}, atomic mass ${element.mass}`}
      role="button"
      tabIndex={0}
      onFocus={() => {
        setIsHovered(true);
        onHover(element, ref.current?.getBoundingClientRect());
      }}
      onBlur={() => {
        setIsHovered(false);
        onHover(null);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(element);
        }
      }}
    >
      {/* Normal tile content */}
      <span className="t-num">{element.number}</span>
      <span className="t-sym">{element.symbol}</span>
      <span className="t-mass">{element.mass}</span>

      {/* ── Bohr-model orbital overlay (appears on hover via CSS) ── */}
      <div
        className="elem-orbital-overlay"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 64 64"
          width="64"
          height="64"
          style={{ overflow: "visible" }}
        >
          {/* Orbital rings + electrons */}
          {Array.from({ length: rings }, (_, i) => {
            const r    = RING_R[i];
            const dur  = RING_SPEED[i];
            const eCol = ELECTRON_COLORS[i % ELECTRON_COLORS.length];
            const dir  = i % 2 === 0 ? 1 : -1;   // alternate CW / CCW
            return (
              <g key={i}>
                {/* Ring */}
                <ellipse
                  cx="32" cy="32"
                  rx={r} ry={r * 0.38}
                  fill="none"
                  stroke="rgba(255,255,255,0.28)"
                  strokeWidth="0.7"
                />
                {/* Electron arm — rotates, electron sits at tip */}
                <g
                  style={{
                    transformOrigin: "32px 32px",
                    animation: isHovered
                      ? `${dir > 0 ? "spin-slow" : "spin-rev"} ${dur}s linear infinite`
                      : "none",
                  }}
                >
                  <circle
                    cx={32 + r} cy={32}
                    r={1.6}
                    fill={eCol}
                    style={{
                      filter: `drop-shadow(0 0 2px ${eCol})`,
                    }}
                  />
                </g>
              </g>
            );
          })}
          {/* Nucleus */}
          <circle cx="32" cy="32" r="3.5"
            fill="var(--tile-border, #fbbf24)"
            style={{ filter: "drop-shadow(0 0 3px rgba(251,191,36,0.8))" }}
          />
        </svg>
      </div>
    </div>
  );
}

export default memo(ElementTile);
