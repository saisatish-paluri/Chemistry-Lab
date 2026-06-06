"use client";

import { useRef } from "react";
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
}

export default function ElementTile({
  element, gridRow, gridCol, onHover, onClick, isHighlighted, isActive, isSelected,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const row = gridRow ?? element.row;
  const col = gridCol ?? element.col;

  // Wave-stagger delay: tiles reveal left→right, top→bottom
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
      }}
      onMouseEnter={() => onHover(element, ref.current?.getBoundingClientRect())}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(element)}
      aria-label={`${element.name}, atomic number ${element.number}, atomic mass ${element.mass}`}
      role="button"
      tabIndex={0}
      onFocus={() => onHover(element, ref.current?.getBoundingClientRect())}
      onBlur={() => onHover(null)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(element);
        }
      }}
    >
      <span className="t-num">{element.number}</span>
      <span className="t-sym">{element.symbol}</span>
      <span className="t-mass">{element.mass}</span>
    </div>
  );
}
