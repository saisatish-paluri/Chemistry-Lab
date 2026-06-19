"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onEnter: () => void;
}

export default function LabEntrancePortal({ onEnter }: Props) {
  const [animating, setAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [checklist, setChecklist] = useState([
    { label: "Lab Goggles Equipped", checked: false },
    { label: "Lab Coat Fastened", checked: false },
    { label: "Fume Hood Ventilation Calibrated", checked: false },
    { label: "Chemical Kinetics Solved", checked: false },
  ]);

  useEffect(() => {
    // Simulate checks checking off one by one (fast, snappy!)
    checklist.forEach((item, idx) => {
      setTimeout(() => {
        setChecklist((prev) =>
          prev.map((c, i) => (i === idx ? { ...c, checked: true } : c))
        );
      }, (idx + 1) * 220);
    });
  }, []);

  const handleEnter = () => {
    if (animating) return;
    setAnimating(true);

    // Fill progress bar (fast!)
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            sessionStorage.setItem("lab_entered", "true");
            onEnter();
          }, 300);
          return 100;
        }
        return p + 8;
      });
    }, 25);
  };

  const allChecked = checklist.every((c) => c.checked);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-slate-50"
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        {/* Left Sliding Door */}
        <motion.div
          className="absolute top-0 bottom-0 left-0 w-1/2 bg-slate-100 border-r border-blue-500/10 flex items-center justify-end overflow-hidden"
          animate={animating ? { x: "-100%" } : { x: 0 }}
          transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
          style={{
            boxShadow: "5px 0 25px rgba(15,23,42,0.04)",
            backgroundImage: "radial-gradient(circle at right, var(--theme-slate-50) 0%, var(--theme-slate-100) 100%)",
          }}
        >
          {/* Decals and warning lines */}
          <div className="absolute top-8 left-8 text-blue-500/40 font-mono text-[10px] uppercase tracking-widest pointer-events-none select-none">
            Airlock Sector 4-A // Gate Closed
          </div>
          <div className="absolute bottom-8 left-8 text-rose-500/50 font-mono text-[10px] uppercase tracking-widest pointer-events-none select-none animate-pulse">
            ▲ SAFETY WARNING: Wear safety gear
          </div>
          {/* Industrial hazard stripes */}
          <div
            className="absolute top-0 bottom-0 right-0 w-3 opacity-10"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, #3b82f6, #3b82f6 10px, transparent 10px, transparent 20px)",
            }}
          />
        </motion.div>

        {/* Right Sliding Door */}
        <motion.div
          className="absolute top-0 bottom-0 right-0 w-1/2 bg-slate-100 border-l border-blue-500/10 flex items-center justify-start overflow-hidden"
          animate={animating ? { x: "100%" } : { x: 0 }}
          transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
          style={{
            boxShadow: "-5px 0 25px rgba(15,23,42,0.04)",
            backgroundImage: "radial-gradient(circle at left, var(--theme-slate-50) 0%, var(--theme-slate-100) 100%)",
          }}
        >
          <div className="absolute top-8 right-8 text-blue-500/40 font-mono text-[10px] uppercase tracking-widest pointer-events-none select-none">
            System ID: CHML-2026 // Active
          </div>
          <div className="absolute bottom-8 right-8 text-blue-500/40 font-mono text-[10px] uppercase tracking-widest pointer-events-none select-none">
            Fume Hoods: Online
          </div>
          <div
            className="absolute top-0 bottom-0 left-0 w-3 opacity-10"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, #3b82f6, #3b82f6 10px, transparent 10px, transparent 20px)",
            }}
          />
        </motion.div>

        {/* Airlock Center Lock Mechanism */}
        <motion.div
          className="absolute z-20 flex flex-col items-center justify-center p-8 rounded-3xl"
          animate={animating ? { scale: 0.85, opacity: 0 } : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{
            background: "rgba(255, 255, 255, 0.82)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(59, 130, 246, 0.25)",
            boxShadow:
              "0 20px 50px rgba(15,23,42,0.08), 0 0 35px rgba(59, 130, 246, 0.04) inset",
            width: "480px",
            maxWidth: "90%",
          }}
        >
          {/* Holographic Glowing Header */}
          <h2 className="text-xl font-black text-blue-600 tracking-wider text-center uppercase mb-1 drop-shadow-[0_0_6px_rgba(37,99,235,0.2)]">
            Laboratory Airlock
          </h2>
          <p className="text-[10px] text-blue-500/70 font-mono tracking-widest uppercase mb-6">
            Decontamination & safety cycle
          </p>

          {/* Checklist items */}
          <div className="w-full flex flex-col gap-3 mb-8">
            {checklist.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-300"
                style={{
                  background: item.checked ? "rgba(34, 197, 94, 0.06)" : "rgba(15, 23, 42, 0.02)",
                  borderColor: item.checked ? "rgba(34, 197, 94, 0.22)" : "rgba(15, 23, 42, 0.06)",
                }}
              >
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300"
                  style={{
                    border: `1.5px solid ${item.checked ? "#22c55e" : "rgba(15, 23, 42, 0.2)"}`,
                    background: item.checked ? "#22c55e" : "transparent",
                    boxShadow: item.checked ? "0 0 8px rgba(34, 197, 94, 0.4)" : "none",
                  }}
                >
                  {item.checked && (
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path
                        d="M1.5 4l1.5 1.5 3.5-3.5"
                        stroke="white"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className="text-xs font-semibold font-sans transition-colors duration-300"
                  style={{ color: item.checked ? "#0f172a" : "#64748b" }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* Chamber Status Bar */}
          {animating ? (
            <div className="w-full">
              <div className="flex justify-between items-center text-[10px] font-mono text-blue-600 mb-2">
                <span>Chamber Pressure Release...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-blue-500/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <button
              disabled={!allChecked}
              onClick={handleEnter}
              className={`relative w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all duration-300 ${
                allChecked
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white cursor-pointer shadow-[0_4px_16px_rgba(59,130,246,0.3)] hover:scale-[1.01]"
                  : "bg-slate-100 text-slate-400 border border-slate-200/60 cursor-not-allowed"
              }`}
            >
              Enter Laboratory
            </button>
          )}
        </motion.div>

        {/* Steam / Decompression Smoke Overlay */}
        {animating && (
          <div className="absolute inset-0 pointer-events-none z-30">
            {Array.from({ length: 14 }).map((_, i) => {
              const startX = 15 + Math.random() * 70;
              return (
                <motion.div
                  key={i}
                  className="absolute bottom-0 rounded-full bg-blue-200/5 filter blur-2xl"
                  initial={{
                    x: `${startX}%`,
                    y: "100%",
                    scale: 0.5 + Math.random() * 0.8,
                    opacity: 0.45,
                  }}
                  animate={{
                    y: "-40%",
                    scale: 2 + Math.random() * 2,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 1.5 + Math.random() * 0.8,
                    ease: "easeOut",
                    delay: Math.random() * 0.4,
                  }}
                  style={{
                    width: "120px",
                    height: "120px",
                  }}
                />
              );
            })}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
