"use client";

import React, { useState, useRef, type MouseEvent } from "react";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";

export default function Interactive3DCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values for tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs to ensure buttery-smooth frame transitions
  const springConfig = { damping: 22, stiffness: 160 };
  const rotateX = useSpring(x, springConfig);
  const rotateY = useSpring(y, springConfig);

  // Mouse position inside card for sheen effect
  const sheenX = useMotionValue(50);
  const sheenY = useMotionValue(50);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Map coordinates to percentage (-0.5 to 0.5)
    const px = (mouseX / width) - 0.5;
    const py = (mouseY / height) - 0.5;

    // Calculate rotation (max 10 degrees tilt)
    // rotateX is driven by Y coordinate (tilt up/down)
    // rotateY is driven by X coordinate (tilt left/right)
    x.set(-py * 10);
    y.set(px * 10);

    // Sheen coordinates in percentage (0 to 100)
    sheenX.set((mouseX / width) * 100);
    sheenY.set((mouseY / height) * 100);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  // Build reactive sheen gradient string
  const sheenBg = useTransform(
    [sheenX, sheenY],
    ([sx, sy]) =>
      `radial-gradient(circle at ${sx}% ${sy}%, rgba(255, 255, 255, 0.18) 0%, transparent 58%)`
  );

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="w-full h-full relative rounded-[inherit]"
      >
        {children}
        {isHovered && (
          <motion.div
            style={{
              background: sheenBg,
              pointerEvents: "none",
            }}
            className="absolute inset-0 z-30 rounded-[inherit] mix-blend-overlay"
          />
        )}
      </motion.div>
    </div>
  );
}
