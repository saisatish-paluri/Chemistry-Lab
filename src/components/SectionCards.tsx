"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type SectionId = "safety" | null;

const SAFETY_RULES = [
  { icon: "🥽", rule: "Always wear appropriate personal protective equipment (PPE) — safety goggles and lab coat." },
  { icon: "🚫", rule: "Never eat, drink, or apply cosmetics in the laboratory." },
  { icon: "🔥", rule: "Keep flammable materials away from open flames and heat sources." },
  { icon: "🧪", rule: "Read reagent labels carefully before use — check concentration and hazard symbols." },
  { icon: "💧", rule: "Clean up spills immediately using appropriate materials and methods." },
  { icon: "☣", rule: "Dispose of chemicals according to lab protocols — never pour acids down the drain without neutralising." },
  { icon: "⚡", rule: "Disconnect electrical equipment before adjusting connections in electrolysis setups." },
  { icon: "🧼", rule: "Wash hands thoroughly before leaving the lab, even if gloves were worn." },
  { icon: "📋", rule: "Report all accidents, spills, or injuries to the supervising teacher immediately." },
  { icon: "🚪", rule: "Know the location of fire exits, eye wash stations, and first aid kits before starting." },
];

type LinkCard = { kind: "link"; icon: React.ReactNode; title: string; desc: string; accent: string; bg: string; href: string; cta: string };
type ToggleCard = { kind: "toggle"; id: SectionId & string; icon: React.ReactNode; title: string; desc: string; accent: string; bg: string };
type NavCard = LinkCard | ToggleCard;

const CARDS: NavCard[] = [
  {
    kind:  "link",
    icon:  <LabsIcon />,
    title: "Virtual Labs",
    desc:  "Enter the full lab environment and conduct experiments",
    accent: "#2563eb",
    bg:    "#eff6ff",
    href:  "/experiments",
    cta:   "Choose Experiment →",
  },
  {
    kind:  "link",
    icon:  <GridIcon />,
    title: "Experiments",
    desc:  "Browse all 10 available chemistry experiments",
    accent: "#059669",
    bg:    "#ecfdf5",
    href:  "/experiments",
    cta:   "View All →",
  },
  {
    kind:  "link",
    icon:  <FlaskIcon />,
    title: "Apparatus",
    desc:  "Explore instruments you will encounter in the virtual lab",
    accent: "#d97706",
    bg:    "#fffbeb",
    href:  "/apparatus",
    cta:   "Explore →",
  },
  {
    kind:  "toggle",
    id:    "safety",
    icon:  <ShieldIcon />,
    title: "Lab Safety",
    desc:  "Essential safety rules and regulations for every session",
    accent: "#dc2626",
    bg:    "#fef2f2",
  },
];

export default function SectionCards() {
  const [open, setOpen] = useState<SectionId>(null);

  const toggle = (id: SectionId) =>
    setOpen((prev) => (prev === id ? null : id));

  return (
    <section
      className="py-16 px-6"
      style={{ background: "var(--lab-off-white)" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true, margin: "-60px" }}
          className="text-center mb-10"
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: "var(--lab-blue-600)" }}
          >
            Explore ChemLab
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold"
            style={{ color: "var(--lab-text-primary)" }}
          >
            Everything in One{" "}
            <span className="gradient-text">Place</span>
          </h2>
        </motion.div>

        {/* 4 Navigation cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {CARDS.map((card, i) => {
            if (card.kind === "link") {
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: i * 0.07, ease: "easeOut" }}
                  viewport={{ once: true, margin: "-40px" }}
                >
                  <Link
                    href={card.href}
                    className="flex flex-col items-center gap-3 rounded-2xl p-6 border text-center transition-all duration-200 hover:-translate-y-1 block"
                    style={{
                      background:     "var(--lab-glass-heavy)",
                      borderColor:    "var(--lab-glass-border)",
                      boxShadow:      "var(--lab-shadow-md)",
                      textDecoration: "none",
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: card.bg, color: card.accent }}
                    >
                      {card.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: "var(--lab-text-primary)" }}>
                        {card.title}
                      </p>
                      <p className="text-xs mt-0.5 leading-snug" style={{ color: "var(--lab-text-muted)" }}>
                        {card.desc}
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold" style={{ color: card.accent }}>
                      {card.cta}
                    </span>
                  </Link>
                </motion.div>
              );
            }

            const isOpen = open === card.id;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.07, ease: "easeOut" }}
                viewport={{ once: true, margin: "-40px" }}
              >
                <button
                  onClick={() => toggle(card.id)}
                  className="w-full flex flex-col items-center gap-3 rounded-2xl p-6 border text-center transition-all duration-200 hover:-translate-y-1"
                  style={{
                    background:  isOpen ? `${card.accent}09` : "var(--lab-glass-heavy)",
                    borderColor: isOpen ? `${card.accent}70` : "var(--lab-glass-border)",
                    boxShadow:   isOpen ? `0 4px 24px ${card.accent}1a` : "var(--lab-shadow-md)",
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: card.bg, color: card.accent }}
                  >
                    {card.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: "var(--lab-text-primary)" }}>
                      {card.title}
                    </p>
                    <p className="text-xs mt-0.5 leading-snug" style={{ color: "var(--lab-text-muted)" }}>
                      {card.desc}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold" style={{ color: card.accent }}>
                    {isOpen ? "▲ Close" : "▼ Rules"}
                  </span>
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Expandable panels — only safety remains inline */}
        <AnimatePresence mode="wait">
          {open === "safety" && (
            <motion.div
              key="safety"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <SafetyPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

// ── Safety Panel ──────────────────────────────────────────────────────────────

function SafetyPanel() {
  return (
    <div
      className="rounded-2xl p-6 border"
      style={{
        background:  "var(--lab-glass-heavy)",
        borderColor: "var(--lab-glass-border)",
        boxShadow:   "var(--lab-shadow-md)",
      }}
    >
      <div className="flex items-center gap-2 mb-5">
        <p
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "#dc2626" }}
        >
          Laboratory Safety Rules
        </p>
        <span
          className="text-[9px] px-2 py-0.5 rounded-full font-semibold"
          style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
        >
          Mandatory
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {SAFETY_RULES.map(({ icon, rule }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04, ease: "easeOut" }}
            className="flex items-start gap-3 rounded-xl p-3 border text-xs"
            style={{
              background:  "#fef2f2",
              borderColor: "#fecaca",
              color:       "#7f1d1d",
            }}
          >
            <span className="text-sm flex-shrink-0 mt-0.5">{icon}</span>
            <span className="leading-snug">{rule}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── SVG Icons ─────────────────────────────────────────────────────────────────

function LabsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M8 4h6M8 4v7L4 18h14L18 11V4" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 15 Q11 13 15 15" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="12" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="12" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="12" y="12" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function FlaskIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M9 2h4M9 2v7L5 18h12L13 9V2" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 16 Q11 14 15 16" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 2 L4 5 L4 11 C4 15.4 7.2 19.5 11 20 C14.8 19.5 18 15.4 18 11 L18 5 Z"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 11 L10 13 L14 9" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
