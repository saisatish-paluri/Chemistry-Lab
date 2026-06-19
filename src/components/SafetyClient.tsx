"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type Severity = "danger" | "warning" | "info";

interface SafetyRule {
  id:       string;
  title:    string;
  detail:   string;
  severity: Severity;
}

interface SafetySection {
  id:       string;
  heading:  string;
  icon:     React.ReactNode;
  rules:    SafetyRule[];
}

const SEV_CONFIG: Record<Severity, { bg: string; border: string; text: string; badge: string; dot: string }> = {
  danger:  { bg: "#fef2f2", border: "#fecaca", text: "#7f1d1d", badge: "DANGER",  dot: "#ef4444" },
  warning: { bg: "#fffbeb", border: "#fde68a", text: "#78350f", badge: "WARNING", dot: "#f59e0b" },
  info:    { bg: "#eff6ff", border: "#bfdbfe", text: "#1e3a8a", badge: "INFO",    dot: "#3b82f6" },
};

const SAFETY_SECTIONS: SafetySection[] = [
  {
    id: "general",
    heading: "General Lab Rules",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="9" y1="8" x2="9" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="9" cy="5.5" r="0.9" fill="currentColor"/>
      </svg>
    ),
    rules: [
      { id: "g1", severity: "danger",  title: "Never work alone",         detail: "Always have a partner or supervisor present when conducting experiments. In an emergency, you need someone who can get help immediately." },
      { id: "g2", severity: "danger",  title: "No food or drink in the lab", detail: "Consuming food or beverages in the lab risks accidental ingestion of hazardous chemicals. Keep all personal items away from work surfaces." },
      { id: "g3", severity: "warning", title: "Follow all instructions",   detail: "Read procedures fully before starting. Do not improvise or attempt unapproved shortcuts. Deviations can lead to unexpected and dangerous reactions." },
      { id: "g4", severity: "warning", title: "Label all containers",      detail: "Every solution, sample, and waste container must be clearly labelled with its contents, concentration, and date of preparation." },
      { id: "g5", severity: "info",    title: "Keep workspace tidy",       detail: "A clutter-free bench reduces the risk of spills and accidents. Remove unnecessary equipment and clean up as you work." },
      { id: "g6", severity: "info",    title: "Report all incidents",      detail: "Even minor spills, cuts, or exposures must be reported immediately to the supervisor. Early reporting enables proper decontamination and medical care." },
    ],
  },
  {
    id: "ppe",
    heading: "Personal Protective Equipment",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M9 2L3 5v5c0 3.9 2.6 7.4 6 8.5C13.4 17.4 16 13.9 16 10V5L9 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M6 9.5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    rules: [
      { id: "p1", severity: "danger",  title: "Safety goggles are mandatory", detail: "Chemical-splash goggles (not safety glasses) must be worn at all times in the lab. A single drop of acid at the right angle can cause permanent eye damage." },
      { id: "p2", severity: "danger",  title: "Wear a lab coat",              detail: "A properly fitting lab coat protects skin and clothing from splashes. Roll up sleeves and button fully when working with corrosive or reactive chemicals." },
      { id: "p3", severity: "warning", title: "Chemical-resistant gloves",    detail: "Wear nitrile or neoprene gloves when handling corrosives, oxidisers, or toxic reagents. Check gloves for holes before use and change them if contaminated." },
      { id: "p4", severity: "warning", title: "Closed-toe shoes required",    detail: "Footwear must fully cover the foot. Spills can happen at any time; sandals and open-toe shoes offer no protection from corrosive liquids." },
      { id: "p5", severity: "info",    title: "Tie back long hair",           detail: "Long hair must be secured away from the face and behind the body, especially near open flames or rotating equipment." },
      { id: "p6", severity: "info",    title: "Remove jewellery",             detail: "Rings, bracelets, and dangling necklaces can catch on equipment or concentrate chemicals against the skin. Remove or secure them before entering the lab." },
    ],
  },
  {
    id: "chemical",
    heading: "Chemical Handling",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M7 3v5L3.5 13a1.5 1.5 0 001.3 2.25h8.4A1.5 1.5 0 0014.5 13L11 8V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6.5 3h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    rules: [
      { id: "c1", severity: "danger",  title: "Never pipette by mouth",         detail: "Always use a pipette bulb, filler, or pump. Many reagents are acutely toxic; mouth pipetting is strictly prohibited in all modern laboratories." },
      { id: "c2", severity: "danger",  title: "Add acid to water, not water to acid", detail: "When preparing dilute acids, always add the concentrated acid slowly to water while stirring. Adding water to concentrated acid causes violent exothermic splashing." },
      { id: "c3", severity: "warning", title: "Work in a fume cupboard",         detail: "Any procedure involving volatile solvents, corrosive vapours, or toxic gases must be carried out under a working fume hood with the sash lowered." },
      { id: "c4", severity: "warning", title: "Read SDS before use",             detail: "Consult the Safety Data Sheet for every unfamiliar chemical. Know the hazard classification, first-aid measures, and disposal requirements before you open the bottle." },
      { id: "c5", severity: "warning", title: "Use minimum quantities",          detail: "Work with the smallest amount of chemical that will give a valid result. Smaller quantities reduce both hazard severity and waste disposal costs." },
      { id: "c6", severity: "info",    title: "Dispose of waste correctly",      detail: "Never pour chemicals down the drain without checking disposal regulations. Use labelled waste containers for different classes: aqueous, halogenated, non-halogenated, and solid waste." },
    ],
  },
  {
    id: "emergency",
    heading: "Emergency Protocols",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M9 2L2 16h14L9 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <line x1="9" y1="8" x2="9" y2="11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="9" cy="13.5" r="0.85" fill="currentColor"/>
      </svg>
    ),
    rules: [
      { id: "e1", severity: "danger",  title: "Chemical eye contact",   detail: "Immediately irrigate the eye at the eyewash station for a minimum of 15 minutes. Hold eyelids open. Seek medical attention even if symptoms seem mild — some chemicals cause delayed injury." },
      { id: "e2", severity: "danger",  title: "Chemical skin contact",  detail: "Remove contaminated clothing and flush the affected area with large amounts of water for at least 10 minutes. Use the emergency shower for large-area contamination. Seek medical advice." },
      { id: "e3", severity: "danger",  title: "Fire or explosion",      detail: "Activate the fire alarm, evacuate via the nearest exit, and call emergency services. Do not attempt to fight a fire unless trained and only if the fire is small and confined." },
      { id: "e4", severity: "warning", title: "Chemical spill",         detail: "Notify others, evacuate if the spill is large or involves volatile/toxic material. For small aqueous spills, use the spill kit. Do not attempt to clean up unknown substances without supervisor guidance." },
      { id: "e5", severity: "warning", title: "Inhalation exposure",    detail: "Move the affected person to fresh air immediately. If breathing is difficult, call emergency services. Do not enter a contaminated atmosphere without respiratory protection." },
      { id: "e6", severity: "info",    title: "Know your exits",        detail: "Before starting any experiment, identify the two nearest emergency exits, the location of the fire extinguisher, eyewash station, emergency shower, and first aid kit." },
    ],
  },
  {
    id: "experiment",
    heading: "Experiment-Specific Cautions",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <rect x="2.5" y="2.5" width="13" height="13" rx="3" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="6" y1="9" x2="12" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="9" y1="6" x2="9" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    rules: [
      { id: "x1", severity: "danger",  title: "Titration — corrosive acids and bases",   detail: "HCl and NaOH solutions used in titration are corrosive. Avoid skin contact; clean spills immediately. Keep a neutralising solution (sodium bicarbonate for acids) nearby." },
      { id: "x2", severity: "danger",  title: "Electrolysis — electrical hazards",        detail: "Never touch live electrodes or bare wire connections. Keep water away from electrical equipment. Hydrogen gas produced at the cathode is flammable — ventilate the area." },
      { id: "x3", severity: "warning", title: "Flame Test — open flame hazards",          detail: "Tie back hair and loose clothing before lighting a Bunsen burner. Never reach over an open flame. Keep flammable materials at least 30 cm away from the flame." },
      { id: "x4", severity: "warning", title: "Gas Collection — pressure build-up",       detail: "Monitor gas collection vessels for over-pressurisation. Never point the open end of a gas-collection tube at another person. Ensure adequate ventilation." },
      { id: "x5", severity: "warning", title: "Calorimetry — hot materials",              detail: "Use insulated gloves when handling hot calorimeters. Allow sufficient cooling before disassembling. Thermal burns from steam or boiling water require immediate cold-water first aid." },
      { id: "x6", severity: "info",    title: "Separation Techniques — solvent fumes",   detail: "Many organic solvents used in chromatography are flammable and have narcotic vapours. Use the fume hood, avoid open flames, and dispose of solvent waste in the designated container." },
    ],
  },
];

function SeverityBadge({ severity }: { severity: Severity }) {
  const cfg = SEV_CONFIG[severity];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border"
      style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.text }}
    >
      <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
      {cfg.badge}
    </span>
  );
}

function RuleCard({ rule }: { rule: SafetyRule }) {
  const [open, setOpen] = useState(false);
  const cfg = SEV_CONFIG[rule.severity];
  return (
    <div
      className="rounded-xl border overflow-hidden transition-all duration-200"
      style={{ background: open ? cfg.bg : "var(--lab-surface-card)", borderColor: open ? cfg.border : "var(--lab-glass-border)" }}
    >
      <button
        className="w-full flex items-start gap-3 p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span
          className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
          style={{ background: cfg.dot }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold" style={{ color: "var(--lab-text-primary)" }}>
              {rule.title}
            </span>
            <SeverityBadge severity={rule.severity} />
          </div>
        </div>
        <svg
          width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"
          className="flex-shrink-0 mt-0.5 transition-transform duration-200"
          style={{
            transform:  open ? "rotate(180deg)" : "none",
            color:      "var(--lab-text-subtle)",
          }}
        >
          <path d="M3 5.5l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pl-9 text-sm leading-relaxed" style={{ color: "var(--lab-text-muted)" }}>
              {rule.detail}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionPanel({ section }: { section: SafetySection }) {
  const [expanded, setExpanded] = useState(true);
  const dangerCount  = section.rules.filter((r) => r.severity === "danger").length;
  const warningCount = section.rules.filter((r) => r.severity === "warning").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="premium-card rounded-2xl overflow-hidden"
    >
      {/* Section header */}
      <button
        className="w-full flex items-center gap-3 p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--lab-surface)", color: "var(--lab-blue-600)" }}
        >
          {section.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold" style={{ color: "var(--lab-text-primary)" }}>
            {section.heading}
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            {dangerCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "#fef2f2", color: "#dc2626" }}>
                {dangerCount} danger
              </span>
            )}
            {warningCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "#fffbeb", color: "#d97706" }}>
                {warningCount} warning
              </span>
            )}
          </div>
        </div>
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"
          className="flex-shrink-0 transition-transform duration-200"
          style={{ transform: expanded ? "rotate(180deg)" : "none", color: "var(--lab-text-subtle)" }}
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div
              className="px-5 pb-5 space-y-2.5 border-t"
              style={{ borderColor: "var(--lab-glass-border)" }}
            >
              <div className="pt-4 space-y-2.5">
                {section.rules.map((rule) => (
                  <RuleCard key={rule.id} rule={rule} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function SafetyClient() {
  return (
    <div style={{ background: "linear-gradient(180deg,#fffbeb 0%,#ffffff 40%,#f8fafc 100%)" }}>

      {/* ── Hero ── */}
      <section className="pt-14 pb-12 px-6 sm:px-8 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Warning shield */}
          <div className="flex justify-center mb-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg,#f59e0b 0%,#ef4444 100%)",
                boxShadow:  "0 6px 24px rgba(245,158,11,0.3)",
              }}
            >
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
                <path d="M15 3L4 8v7.5C4 21.6 8.9 27.5 15 29c6.1-1.5 11-7.4 11-13.5V8L15 3Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
                <path d="M11 15l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <p className="section-eyebrow">Lab Safety</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4"
              style={{ color: "var(--lab-text-primary)" }}>
            Safety First, <span style={{ color: "#ef4444" }}>Always</span>
          </h1>
          <p className="text-base sm:text-lg leading-relaxed max-w-2xl mx-auto"
             style={{ color: "var(--lab-text-muted)" }}>
            A thorough understanding of laboratory safety is the foundation of good science.
            Review these guidelines before conducting any experiment — virtual or real.
          </p>

          {/* Severity legend */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            {(["danger", "warning", "info"] as Severity[]).map((s) => {
              const cfg = SEV_CONFIG[s];
              return (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border"
                  style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.text }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
                  {cfg.badge}
                </span>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* ── Section panels ── */}
      <section className="px-6 sm:px-8 max-w-4xl mx-auto pb-16 space-y-5">
        {SAFETY_SECTIONS.map((section, i) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.52, delay: i * 0.08, ease: "easeOut" }}
          >
            <SectionPanel section={section} />
          </motion.div>
        ))}
      </section>

      {/* ── CTA band ── */}
      <section className="px-6 sm:px-8 max-w-4xl mx-auto pb-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="rounded-3xl p-8 text-center"
          style={{
            background: "linear-gradient(135deg,rgba(239,68,68,0.07) 0%,rgba(245,158,11,0.07) 100%)",
            border:     "1px solid rgba(239,68,68,0.15)",
          }}
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#ef4444" }}>
            Ready to begin?
          </p>
          <h3 className="text-xl font-black mb-2" style={{ color: "var(--lab-text-primary)" }}>
            Safety reviewed — time to experiment
          </h3>
          <p className="text-sm mb-6" style={{ color: "var(--lab-text-muted)" }}>
            Now that you know the safety rules, explore the virtual labs with confidence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/experiments"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5 active:scale-95"
              style={{ background: "linear-gradient(135deg,#1d4ed8 0%,#0ea5e9 100%)" }}
            >
              Enter the Laboratory
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <path d="M2 6.5h9M8 3l3.5 3.5L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-slate-50 active:scale-95"
              style={{ borderColor: "var(--lab-glass-border)", color: "var(--lab-text-secondary)" }}
            >
              View Dashboard
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
