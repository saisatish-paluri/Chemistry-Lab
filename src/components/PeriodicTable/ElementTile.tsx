"use client";

import { useRef } from "react";
import { ChemElement } from "./data";

interface Props {
  element:       ChemElement;
  gridRow?:      number;
  gridCol?:      number;
  onHover:       (el: ChemElement | null, rect?: DOMRect) => void;
  onClick:       (el: ChemElement) => void;
  /** Full opacity when true; dimmed when false and something else is hovered. */
  isHighlighted: boolean;
  /** True when this tile's category is the actively hovered category. */
  isActive:      boolean;
  /** True when this element is the selected/clicked element. */
  isSelected:    boolean;
}

export default function ElementTile({
  element, gridRow, gridCol, onHover, onClick, isHighlighted, isActive, isSelected,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const row = gridRow ?? element.row;
  const col = gridCol ?? element.col;

  return (
    <div
      ref={ref}
      className={`elem-tile cat-${element.category}`}
      style={{
        gridRow:       row,
        gridColumn:    col,
        opacity:       isHighlighted ? 1 : 0.4,
        outline:       isSelected
          ? "2px solid var(--lab-blue-600)"
          : isActive
          ? "2px solid var(--lab-blue-500)"
          : undefined,
        outlineOffset: isSelected || isActive ? "1px" : undefined,
        transition:    "opacity 0.18s ease, outline 0.1s ease",
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
