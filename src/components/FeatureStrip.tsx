"use client";

import { motion } from "framer-motion";

const FEATURES = [
  {
    icon: <SimIcon />,
    title: "Physics‑Based Simulations",
    desc: "Reactions modeled with accurate thermodynamic and kinetic principles.",
    color: "#2563eb",
    bg: "#eff6ff",
  },
  {
    icon: <AiIcon />,
    title: "AI Lab Assistant",
    desc: "Step-by-step guidance, instant answers, and real-time safety checks.",
    color: "#0891b2",
    bg: "#ecfeff",
  },
  {
    icon: <MolIcon />,
    title: "3D Molecular Viewer",
    desc: "Rotate, inspect, and interact with atomic structures at full resolution.",
    color: "#059669",
    bg: "#ecfdf5",
  },
];

export default function FeatureStrip() {
  return (
    <section
      id="features"
      className="py-16 px-6"
      style={{ background: "var(--lab-white)" }}
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          viewport={{ once: true, margin: "-60px" }}
          className="glass rounded-2xl p-2"
          style={{ boxShadow: "var(--lab-shadow-md)" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {FEATURES.map(({ icon, title, desc, color, bg }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                viewport={{ once: true }}
                className="group flex items-start gap-4 p-6 md:p-8 rounded-xl transition-colors duration-200 hover:bg-white"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                  style={{ background: bg }}
                >
                  <span style={{ color }}>{icon}</span>
                </div>
                <div>
                  <h3
                    className="text-sm font-semibold mb-1"
                    style={{ color: "var(--lab-text-secondary)" }}
                  >
                    {title}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--lab-text-muted)" }}>
                    {desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function SimIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="8" width="3" height="8" rx="1" fill="currentColor" opacity="0.4" />
      <rect x="7.5" y="5" width="3" height="11" rx="1" fill="currentColor" opacity="0.7" />
      <rect x="13" y="2" width="3" height="14" rx="1" fill="currentColor" />
    </svg>
  );
}

function AiIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6 9h6M9 6v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="9" cy="9" r="1.5" fill="currentColor" />
    </svg>
  );
}

function MolIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="2.5" fill="currentColor" />
      <circle cx="2.5" cy="5" r="1.5" fill="currentColor" opacity="0.7" />
      <circle cx="15.5" cy="5" r="1.5" fill="currentColor" opacity="0.7" />
      <circle cx="9" cy="15.5" r="1.5" fill="currentColor" opacity="0.7" />
      <line x1="4" y1="5.8" x2="7" y2="7.8" stroke="currentColor" strokeWidth="1.2" />
      <line x1="14" y1="5.8" x2="11" y2="7.8" stroke="currentColor" strokeWidth="1.2" />
      <line x1="9" y1="11.5" x2="9" y2="14" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
