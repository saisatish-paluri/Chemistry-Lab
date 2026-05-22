"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Bubble {
  id:     number;
  xPct:   number; // % of container width (0–100)
  xOff:   number; // px offset within the spread band
  size:   number; // px diameter
  dur:    number; // animation duration (s)
  drift:  number; // horizontal drift (px)
  travel: number; // vertical rise (px)
}

interface Props {
  active:   boolean;
  rate:     number;  // 0–1
  color:    string;
  /** X position as a percentage (0–100) of the container width. */
  xPct:     number;
  spread:   number;  // px spread around center
  bottom:   number;  // % from bottom of container
  label?:   string;
}

export default function BubbleParticles({ active, rate, color, xPct, spread, bottom, label }: Props) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    if (!active || rate <= 0) {
      startTransition(() => setBubbles([]));
      return;
    }
    const interval = Math.max(100, 750 - rate * 600);
    const id = setInterval(() => {
      nextId.current += 1;
      const nid = nextId.current;
      const bubble: Bubble = {
        id:     nid,
        xPct,
        xOff:   (Math.random() - 0.5) * spread,
        size:   4 + Math.random() * 7,
        dur:    1.1 + Math.random() * 0.9,
        drift:  (Math.random() - 0.5) * 14,
        travel: 85 + Math.random() * 55,
      };
      setBubbles((prev) => [...prev.slice(-12), bubble]);
      setTimeout(() => setBubbles((prev) => prev.filter((b) => b.id !== nid)), 2300);
    }, interval);
    return () => clearInterval(id);
  }, [active, rate, xPct, spread]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {bubbles.map((b) => (
          <motion.div
            key={b.id}
            className="absolute rounded-full"
            style={{
              width:     b.size,
              height:    b.size,
              // percentage-based center + px offset for spread
              left:      `calc(${b.xPct}% + ${b.xOff}px)`,
              bottom:    `${bottom}%`,
              background: color,
              border:    "1px solid rgba(255,255,255,0.4)",
              transform: "translateX(-50%)",
            }}
            initial={{ y: 0, opacity: 0.85, x: 0, scale: 1 }}
            animate={{ y: -b.travel, opacity: 0, x: b.drift, scale: 0.3 }}
            transition={{ duration: b.dur, ease: [0.15, 0.5, 0.4, 1] }}
          />
        ))}
      </AnimatePresence>

      {/* Gas label */}
      {label && active && (
        <div
          className="absolute text-[9px] font-semibold pointer-events-none"
          style={{
            left:      `${xPct}%`,
            bottom:    `${bottom + 14}%`,
            transform: "translateX(-50%)",
            color:     "rgba(71,85,105,0.8)",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
