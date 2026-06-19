"use client";

import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const STATS = [
  { value: 20,  suffix: "",  label: "Virtual Labs",        color: "#2563eb" },
  { value: 118, suffix: "",  label: "Elements",            color: "#7c3aed" },
  { value: 5,   suffix: "",  label: "Chemistry Domains",   color: "#059669" },
];

const SHOWCASE = [
  {
    slug:  "titration",
    title: "Acid-Base Titration",
    photo: "/images/experiments/titration.png",
    accent: "#2563eb",
  },
  {
    slug:  "flame-test",
    title: "Flame Test",
    photo: "/images/experiments/flame.png",
    accent: "#f97316",
  },
  {
    slug:  "electrolysis",
    title: "Electrolysis",
    photo: "/images/experiments/electrolysis.png",
    accent: "#06b6d4",
  },
];

function AnimatedStat({ target, suffix, color }: { target: number; suffix: string; color: string }) {
  const [value, setValue] = useState(0);
  const ref   = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    if (!inView) return;
    const duration = 1200;
    const start    = Date.now();
    const raf = requestAnimationFrame(function tick() {
      const elapsed   = Date.now() - start;
      const progress  = Math.min(elapsed / duration, 1);
      const eased     = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);

  return (
    <div
      ref={ref}
      style={{
        fontSize:          "clamp(2.8rem, 6vw, 4.5rem)",
        fontWeight:        900,
        color,
        lineHeight:        1,
        letterSpacing:     "-0.04em",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {value}{suffix}
    </div>
  );
}

export default function FeatureStrip() {
  const reduced = useReducedMotion() ?? false;

  return (
    <section
      id="features"
      style={{
        background: "transparent",
        position:   "relative",
        overflow:   "hidden",
        padding:    "clamp(4rem, 8vw, 8rem) clamp(16px, 4vw, 48px)",
        borderTop:  "1px solid var(--lab-glass-border)",
      }}
    >
      {/* Light dot grid */}
      <div
        aria-hidden="true"
        style={{
          position:             "absolute",
          inset:                0,
          backgroundImage:      "radial-gradient(circle, rgba(37,99,235,0.042) 1px, transparent 1px)",
          backgroundSize:       "28px 28px",
          pointerEvents:        "none",
        }}
      />

      {/* Central radial glow */}
      <div
        aria-hidden="true"
        style={{
          position:     "absolute",
          top:          "50%",
          left:         "50%",
          transform:    "translate(-50%, -50%)",
          width:        "900px",
          height:       "440px",
          borderRadius: "50%",
          background:   "radial-gradient(ellipse, rgba(37,99,235,0.06) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 2 }}>

        {/* Section eyebrow + headline */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: "center", marginBottom: "clamp(2.5rem, 5vw, 4.5rem)" }}
        >
          <p style={{
            fontSize:       10,
            fontWeight:     700,
            letterSpacing:  "0.20em",
            textTransform:  "uppercase",
            color:          "var(--lab-text-muted)",
            marginBottom:   18,
          }}>
            The Platform
          </p>
          <h2 style={{
            fontSize:       "clamp(1.9rem, 5vw, 3.5rem)",
            fontWeight:     900,
            color:          "var(--lab-text-primary)",
            lineHeight:     1.05,
            letterSpacing:  "-0.035em",
            margin:         0,
          }}>
            Chemistry at Scale
          </h2>
          <p style={{
            fontSize:   "clamp(13px, 1.7vw, 15px)",
            color:      "var(--lab-text-muted)",
            marginTop:  "1rem",
            maxWidth:   "340px",
            margin:     "1rem auto 0",
            lineHeight: 1.6,
          }}>
            From periodic table to full simulations — one ecosystem.
          </p>
        </motion.div>

        {/* ── Large stat numbers ── */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.08 }}
          style={{
            display:        "flex",
            justifyContent: "center",
            alignItems:     "center",
            gap:            "clamp(2.5rem, 10vw, 9rem)",
            marginBottom:   "clamp(3rem, 6vw, 5.5rem)",
            flexWrap:       "wrap",
          }}
        >
          {STATS.map(({ value, suffix, label, color }, i) => (
            <motion.div
              key={label}
              initial={reduced ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.18 + i * 0.10, ease: [0.22, 1, 0.36, 1] }}
              style={{ textAlign: "center" }}
            >
              <AnimatedStat target={value} suffix={suffix} color={color} />
              <p style={{
                fontSize:      10.5,
                fontWeight:    600,
                color:         "var(--lab-text-muted)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginTop:     10,
              }}>
                {label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Experiment showcase images ── */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, delay: 0.15 }}
          className="showcase-card-grid"
          style={{
            display:               "grid",
            gridTemplateColumns:   "repeat(3, 1fr)",
            gap:                   "clamp(8px, 1.4vw, 14px)",
            marginBottom:          "2.5rem",
          }}
        >
          {SHOWCASE.map(({ slug, title, photo, accent }, i) => (
            <motion.div
              key={slug}
              initial={reduced ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.28 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="showcase-card"
              style={{ position: "relative", borderRadius: "14px", overflow: "hidden", aspectRatio: "16/10" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo}
                alt={title}
                loading="lazy"
                decoding="async"
                className="showcase-card-img"
                style={{
                  width:      "100%",
                  height:     "100%",
                  objectFit:  "cover",
                  transition: "transform 0.65s cubic-bezier(0.22,1,0.36,1)",
                  display:    "block",
                }}
              />

              {/* Gradient overlay */}
              <div
                aria-hidden="true"
                style={{
                  position:   "absolute",
                  inset:      0,
                  background: "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.72) 100%)",
                  transition: "opacity 0.3s ease",
                }}
              />

              {/* Accent line */}
              <div
                aria-hidden="true"
                style={{
                  position:   "absolute",
                  top:        0,
                  left:       0,
                  right:      0,
                  height:     "2.5px",
                  background: `linear-gradient(90deg, ${accent}, ${accent}60)`,
                  opacity:    0.9,
                }}
              />

              {/* Title */}
              <div style={{
                position:      "absolute",
                bottom:        12,
                left:          13,
                fontSize:      "clamp(11px, 1.1vw, 13px)",
                fontWeight:    700,
                color:         "rgba(255,255,255,0.90)",
                letterSpacing: "-0.01em",
                lineHeight:    1.3,
                pointerEvents: "none",
              }}>
                {title}
              </div>

              {/* Invisible full-card link */}
              <Link
                href={`/experiments/${slug}`}
                aria-label={`Open ${title}`}
                style={{ position: "absolute", inset: 0 }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* ── CTA ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.35 }}
          style={{ textAlign: "center" }}
        >
          <Link
            href="/experiments"
            style={{
              display:        "inline-flex",
              alignItems:     "center",
              gap:            8,
              padding:        "11px 28px",
              borderRadius:   12,
              background:     "rgba(37,99,235,0.08)",
              border:         "1px solid rgba(37,99,235,0.22)",
              color:          "#1d4ed8",
              fontSize:       13,
              fontWeight:     700,
              textDecoration: "none",
              transition:     "background 0.2s ease, border-color 0.2s ease, transform 0.18s ease, box-shadow 0.18s ease",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background    = "rgba(37,99,235,0.14)";
              el.style.borderColor   = "rgba(37,99,235,0.36)";
              el.style.transform     = "translateY(-2px)";
              el.style.boxShadow     = "0 8px 28px rgba(37,99,235,0.15)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background    = "rgba(37,99,235,0.08)";
              el.style.borderColor   = "rgba(37,99,235,0.22)";
              el.style.transform     = "";
              el.style.boxShadow     = "";
            }}
          >
            Browse All 20 Labs →
            <svg width="0" height="0" aria-hidden="true">
            </svg>
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
