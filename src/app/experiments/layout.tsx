"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useActiveLabStore, EXPERIMENT_META } from "@/lib/store/active-lab-store";
import {
  EXPERIMENT_LABEL_MAP,
  EXPERIMENT_ACCENT_MAP,
  EXPERIMENT_SUBJECT_MAP,
} from "@/lib/experiments-catalog";

function ActiveLabSync({ pathname }: { pathname: string }) {
  const setActiveLab   = useActiveLabStore((s) => s.setActiveLab);
  const clearActiveLab = useActiveLabStore((s) => s.clearActiveLab);

  useEffect(() => {
    const meta = EXPERIMENT_META[pathname];
    if (meta) {
      setActiveLab(meta);
    } else if (pathname === "/experiments") {
      clearActiveLab();
    }
  }, [pathname, setActiveLab, clearActiveLab]);

  return null;
}

export default function ExperimentsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Category pages and the index page render their own Navbar/Footer — skip lab shell
  if (pathname === "/experiments" || pathname.startsWith("/experiments/category")) {
    return <>{children}</>;
  }

  const experimentLabel = EXPERIMENT_LABEL_MAP[pathname]   ?? "Experiment";
  const accent          = EXPERIMENT_ACCENT_MAP[pathname]  ?? "var(--lab-blue-600)";
  const subject         = EXPERIMENT_SUBJECT_MAP[pathname] ?? "Chemistry";

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: "var(--lab-off-white)" }}
    >
      <ActiveLabSync pathname={pathname} />

      {/* ── Premium lab header ── */}
      <header
        className="flex items-center flex-shrink-0 z-40"
        style={{
          height:               52,
          background:           "var(--lab-glass-heavy)",
          borderBottom:         "1px solid var(--lab-glass-border)",
          backdropFilter:       "blur(24px) saturate(1.6)",
          WebkitBackdropFilter: "blur(24px) saturate(1.6)",
          boxShadow:
            "0 1px 0 rgba(255,255,255,0.9) inset, 0 2px 8px rgba(15,23,42,0.06)",
        }}
      >
        {/* Experiment-specific accent bar */}
        <div
          className="w-1 self-stretch flex-shrink-0"
          style={{
            background: `linear-gradient(180deg, ${accent} 0%, ${accent}50 100%)`,
          }}
          aria-hidden="true"
        />

        <div className="flex items-center gap-2 min-w-0 flex-1 px-4">
          {/* Logo + Home */}
          <Link
            href="/"
            className="flex items-center gap-2 flex-shrink-0 group rounded-lg px-1.5 py-1 -ml-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="ChemLab home"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-150 group-hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 100%)",
                boxShadow:  "0 1px 6px rgba(37,99,235,0.35)",
              }}
            >
              <MiniFlaskIcon />
            </div>
            <span
              className="text-[13px] font-bold tracking-tight hidden sm:block"
              style={{ color: "var(--lab-text-primary)" }}
            >
              Chem<span className="gradient-text">Lab</span>
            </span>
          </Link>

          <ChevronRight />

          <Link
            href="/experiments"
            className="text-[12px] font-medium transition-opacity duration-150 hover:opacity-70 flex-shrink-0 hidden sm:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1.5 py-0.5"
            style={{ color: "var(--lab-text-muted)" }}
          >
            All Experiments
          </Link>

          <ChevronRight className="hidden sm:block" />

          {/* Current experiment info */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Live status dot */}
            <span
              className="w-2 h-2 rounded-full flex-shrink-0 live-dot"
              style={{
                background: accent,
                boxShadow:  `0 0 6px ${accent}cc`,
              }}
              aria-hidden="true"
            />

            {/* Experiment name */}
            <span
              className="text-[13px] font-bold truncate"
              style={{ color: accent }}
              title={experimentLabel}
            >
              {experimentLabel}
            </span>

            {/* Subject tag */}
            <span
              className="hidden lg:flex items-center text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0"
              style={{
                background:  `${accent}0e`,
                border:      `1px solid ${accent}25`,
                color:       `${accent}cc`,
              }}
            >
              {subject}
            </span>
          </div>
        </div>

        {/* Right — jumper + actions */}
        <div className="flex items-center gap-2 px-3 flex-shrink-0">
          <ExperimentJumper current={pathname} accent={accent} />

          <Link
            href="/experiments"
            className="flex items-center gap-1.5 text-[11.5px] font-semibold px-3 py-1.5 rounded-lg border transition-all duration-150 hover:bg-slate-50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            style={{
              borderColor: "var(--lab-glass-border)",
              color:       "var(--lab-text-muted)",
            }}
            aria-label="Back to experiments list"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
              <path d="M7 1.5 L3 5.5 L7 9.5" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">Labs</span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-[11.5px] font-semibold px-3 py-1.5 rounded-lg border transition-all duration-150 hover:bg-slate-50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 hidden sm:flex"
            style={{
              borderColor: "var(--lab-glass-border)",
              color:       "var(--lab-text-muted)",
            }}
            aria-label="Go to homepage"
          >
            <HomeIcon />
            <span className="hidden md:inline">Home</span>
          </Link>
        </div>
      </header>

      <main className="flex flex-col flex-1 overflow-hidden min-h-0">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col flex-1 overflow-hidden min-h-0"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

// ── Experiment Jumper ─────────────────────────────────────────────────────────
function ExperimentJumper({ current, accent }: { current: string; accent: string }) {
  const router  = useRouter();
  const entries = Object.entries(EXPERIMENT_LABEL_MAP);
  return (
    <select
      value={current}
      onChange={(e) => { router.push(e.target.value); }}
      className="text-[11.5px] font-medium pl-3 pr-7 py-1.5 rounded-lg border outline-none cursor-pointer appearance-none focus-visible:ring-2 focus-visible:ring-blue-500 hidden sm:block"
      style={{
        background:  "var(--lab-glass)",
        borderColor: `${accent}30`,
        color:       "var(--lab-text-secondary)",
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='10' viewBox='0 0 10 10' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 4l3 3 3-3' stroke='%2394a3b8' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
        backgroundRepeat:   "no-repeat",
        backgroundPosition: "right 8px center",
        maxWidth:           168,
      }}
      aria-label="Jump to experiment"
    >
      {entries.map(([href, label]) => (
        <option key={href} value={href}>{label}</option>
      ))}
    </select>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function MiniFlaskIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M5 2v3.5L2 9a1 1 0 00.9 1.5h6.2A1 1 0 0010 9L7 5.5V2"
        stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
      />
      <path d="M4.5 2h3" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
      <path d="M1.5 5.5L5.5 2l4 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.5 4.8V9a.5.5 0 00.5.5h2V7h1v2.5h2A.5.5 0 009 9V4.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ChevronRight({ className = "" }: { className?: string }) {
  return (
    <svg
      width="12" height="12" viewBox="0 0 12 12" fill="none"
      aria-hidden="true"
      className={`flex-shrink-0 ${className}`}
      style={{ color: "var(--lab-slate-400)" }}
    >
      <path
        d="M4.5 3l3 3-3 3"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}
