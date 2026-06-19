"use client";

import React from "react";

export default function Loading() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50/40 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-[52px] border-b border-slate-200/80 bg-white/70 backdrop-blur flex items-center px-4 gap-4">
        <div className="w-8 h-8 bg-slate-200 rounded-lg" />
        <div className="w-28 h-4 bg-slate-200 rounded-md" />
        <div className="w-16 h-3.5 bg-slate-200 rounded-md" />
      </div>

      {/* Workspace Area Skeleton */}
      <div className="flex-1 flex flex-col md:flex-row p-6 gap-6 overflow-hidden">
        {/* Left Instruction Panel */}
        <div className="w-full md:w-80 flex flex-col gap-4 flex-shrink-0">
          <div className="h-36 bg-slate-200 rounded-2xl" />
          <div className="h-56 bg-slate-200 rounded-2xl" />
        </div>

        {/* Center Canvas / Graph Area */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="flex-1 bg-slate-200 rounded-3xl" />
          <div className="h-28 bg-slate-200 rounded-2xl" />
        </div>

        {/* Right Controls Panel */}
        <div className="w-full md:w-64 flex flex-col gap-4 flex-shrink-0">
          <div className="h-72 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
