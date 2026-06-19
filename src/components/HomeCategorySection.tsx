"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import CATALOG, { CATEGORIES, type CategoryDef } from "@/lib/experiments-catalog";
import Interactive3DCard from "@/components/Interactive3DCard";

// ── Category card ─────────────────────────────────────────────────────────────
function CategoryCard({
  cat,
  index,
  reduced,
}: {
  cat: CategoryDef;
  index: number;
  reduced: boolean;
}) {
  const count = useMemo(
    () => CATALOG.filter((e) => e.category === cat.id).length,
    [cat.id],
  );

  return (
    <motion.div
      className="hcs-card-wrap"
      initial={reduced ? false : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-32px" }}
      transition={{
        duration: 0.62,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      }}
    >
      <Interactive3DCard>
        <Link
          href={`/experiments/category/${cat.id}`}
          aria-label={`Explore ${cat.label} — ${count} experiments`}
          className="hcs-card-link"
        >

        {/* ── Layered overlays ── */}
        <div className="hcs-card-overlay-base" aria-hidden="true" />
        <div
          className="hcs-card-overlay-accent"
          aria-hidden="true"
          style={{
            background: `radial-gradient(ellipse at 90% 10%, ${cat.color}32 0%, transparent 58%)`,
          }}
        />

        {/* ── Top accent bar ── */}
        <div
          className="hcs-card-top-bar"
          aria-hidden="true"
          style={{
            background: `linear-gradient(90deg, ${cat.color} 0%, ${cat.color}55 60%, transparent 100%)`,
          }}
        />

        {/* ── Content ── */}
        <div className="hcs-card-content">
          {/* Experiment count — top left */}
          <div className="hcs-card-count">
            <span
              className="hcs-card-count-dot"
              style={{ background: cat.color, boxShadow: `0 0 7px ${cat.color}90` }}
            />
            <span className="hcs-card-count-text">
              {count}&nbsp;Experiment{count !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Bottom block */}
          <div className="hcs-card-bottom">
            <h2 className="hcs-card-title">{cat.label}</h2>
            <p className="hcs-card-tagline" style={{ color: cat.color }}>
              {cat.tagline}
            </p>
            <p className="hcs-card-desc">
              {cat.description.split(".")[0]}.
            </p>

            {/* CTA */}
            <span
              className="hcs-card-cta"
              style={{ borderColor: `${cat.color}50`, color: cat.color }}
            >
              Open Lab
              <svg
                width="11"
                height="11"
                viewBox="0 0 11 11"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 5.5h7M6.5 3.5l2 2-2 2"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </div>
      </Link>
      </Interactive3DCard>
    </motion.div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────
export default function HomeCategorySection() {
  const reduced = useReducedMotion() ?? false;
  const total = CATALOG.length;

  return (
    <section className="hcs-section">
      {/* Dot grid texture */}
      <div className="hcs-dot-grid" aria-hidden="true" />

      <div className="hcs-inner">
        {/* ── Header ── */}
        <motion.header
          className="hcs-header"
          initial={reduced ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        >
          <span className="hcs-eyebrow">
            <span className="hcs-eyebrow-dot" />
            Virtual Chemistry Laboratory
          </span>
          <h1 className="hcs-headline">
            Choose Your{" "}
            <span className="gradient-text-hero">Discipline</span>
          </h1>
          <p className="hcs-sub">
            {total} interactive experiments across {CATEGORIES.length} chemistry domains
          </p>
        </motion.header>

        {/* ── Category grid ── */}
        <div className="hcs-grid" role="list" aria-label="Chemistry experiment categories">
          {CATEGORIES.map((cat, i) => (
            <CategoryCard key={cat.id} cat={cat} index={i} reduced={reduced} />
          ))}
        </div>
      </div>
    </section>
  );
}
