"use client";

import React from "react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/20 backdrop-blur-md">
      <div className="flex flex-col items-center p-8 rounded-3xl bg-slate-900/90 border border-cyan-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {/* Holographic Loader Ring */}
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-cyan-500/10" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-500 animate-spin" />
        </div>
        <p className="font-mono text-[10px] text-cyan-400/80 tracking-widest uppercase animate-pulse">
          Calibrating Lab Equipment...
        </p>
      </div>
    </div>
  );
}
