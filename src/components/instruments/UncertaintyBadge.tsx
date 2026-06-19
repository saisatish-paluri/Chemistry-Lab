"use client";

/**
 * UncertaintyBadge
 *
 * Compact inline badge displaying "± X unit  (Y%)" for a single reading.
 * Designed to be placed next to a value in a results table or calculation panel.
 */

import { memo } from "react";
import type { InstrumentReading } from "@/lib/instruments/types";
import { INSTRUMENT_SPECS } from "@/lib/instruments/instruments";

interface Props {
  reading:         InstrumentReading;
  showPercentage?: boolean;
  className?:      string;
}

export default memo(function UncertaintyBadge({
  reading,
  showPercentage = true,
  className = "",
}: Props) {
  const spec = INSTRUMENT_SPECS[reading.instrument];
  const pct  = reading.percentageUncertainty;

  // Colour intensity based on percentage uncertainty
  const color = pct < 1 ? "#4ade80" : pct < 3 ? "#facc15" : "#f87171";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold ${className}`}
      style={{
        background: `${color}15`,
        border:     `1px solid ${color}35`,
        color,
      }}
      title={reading.withUncertainty}
    >
      <span>±{reading.uncertainty.toFixed(spec.decimalPlaces)}</span>
      <span style={{ opacity: 0.7 }}>{reading.unit}</span>
      {showPercentage && (
        <span style={{ opacity: 0.65 }}>({pct.toFixed(2)}%)</span>
      )}
    </span>
  );
});
