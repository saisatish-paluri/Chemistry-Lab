"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

// ── Web Audio Synth System ──────────────────────────────────────────────────
class LabSynth {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {}

  setMute(mute: boolean) {
    this.isMuted = mute;
  }

  private init() {
    if (this.isMuted) return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playSnap() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(850, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.10, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch (e) {
      console.warn("Audio Context blocked:", e);
    }
  }

  playChime() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const tones = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      
      tones.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.06, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.001, now + idx * 0.08 + 0.20);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.21);
      });
    } catch (e) {
      console.warn("Audio Context blocked:", e);
    }
  }
}

const synth = new LabSynth();

// ── Types and Molecule Data ──────────────────────────────────────────────────
interface Vector3D {
  x: number;
  y: number;
  z: number;
}

interface Edge {
  a: number;
  b: number;
  double?: boolean;
  triple?: boolean;
  ionic?: boolean;
  polar?: boolean;
}

interface AtomDef {
  symbol: string;
  pos: Vector3D;
  color: string;
  size: number;
}

interface AssemblyStep {
  atomIndices: number[];
  description: string;
}

interface MoleculeDef {
  name: string;
  formula: string;
  description: string;
  atoms: AtomDef[];
  edges: Edge[];
  steps: AssemblyStep[];
}

const MOLECULES: Record<string, MoleculeDef> = {
  H2O: {
    name: "Water",
    formula: "H₂O",
    description: "A polar inorganic compound that is the main constituent of Earth's hydrosphere.",
    atoms: [
      { symbol: "O", pos: { x: 0, y: -6, z: 0 }, color: "#ef4444", size: 14 },
      { symbol: "H", pos: { x: -24, y: 14, z: 0 }, color: "#e2e8f0", size: 8 },
      { symbol: "H", pos: { x: 24, y: 14, z: 0 }, color: "#e2e8f0", size: 8 },
    ],
    edges: [
      { a: 0, b: 1, polar: true },
      { a: 0, b: 2, polar: true },
    ],
    steps: [
      { atomIndices: [0], description: "Place central Oxygen atom (6 valence electrons)" },
      { atomIndices: [1], description: "Attach first Hydrogen atom via single polar covalent bond" },
      { atomIndices: [2], description: "Attach second Hydrogen atom to complete H₂O molecule" },
    ]
  },
  CO2: {
    name: "Carbon Dioxide",
    formula: "CO₂",
    description: "An acidic colorless gas with a density about 53% higher than that of dry air.",
    atoms: [
      { symbol: "C", pos: { x: 0, y: 0, z: 0 }, color: "#475569", size: 12 },
      { symbol: "O", pos: { x: -32, y: 0, z: 0 }, color: "#ef4444", size: 14 },
      { symbol: "O", pos: { x: 32, y: 0, z: 0 }, color: "#ef4444", size: 14 },
    ],
    edges: [
      { a: 0, b: 1, double: true },
      { a: 0, b: 2, double: true },
    ],
    steps: [
      { atomIndices: [0], description: "Place central Carbon atom (4 valence electrons)" },
      { atomIndices: [1], description: "Attach left Oxygen atom sharing 4 electrons (Double Bond)" },
      { atomIndices: [2], description: "Attach right Oxygen atom to form linear CO₂" },
    ]
  },
  O2: {
    name: "Oxygen Gas",
    formula: "O₂",
    description: "A diatomic gas containing a stable O=O double bond, essential for respiration on Earth.",
    atoms: [
      { symbol: "O", pos: { x: -18, y: 0, z: 0 }, color: "#ef4444", size: 14 },
      { symbol: "O", pos: { x: 18, y: 0, z: 0 }, color: "#ef4444", size: 14 },
    ],
    edges: [
      { a: 0, b: 1, double: true },
    ],
    steps: [
      { atomIndices: [0], description: "Place the first Oxygen atom with 6 valence electrons" },
      { atomIndices: [1], description: "Attach second Oxygen atom, sharing two electron pairs (Double Covalent Bond)" },
    ]
  },
  N2: {
    name: "Nitrogen Gas",
    formula: "N₂",
    description: "An extremely stable diatomic gas forming 78% of Earth's atmosphere, held by a strong triple bond.",
    atoms: [
      { symbol: "N", pos: { x: -16, y: 0, z: 0 }, color: "#3b82f6", size: 13 },
      { symbol: "N", pos: { x: 16, y: 0, z: 0 }, color: "#3b82f6", size: 13 },
    ],
    edges: [
      { a: 0, b: 1, triple: true },
    ],
    steps: [
      { atomIndices: [0], description: "Place the first Nitrogen atom with 5 valence electrons" },
      { atomIndices: [1], description: "Attach second Nitrogen, sharing three electron pairs (Stable Triple Covalent Bond)" },
    ]
  },
  NaCl: {
    name: "Sodium Chloride",
    formula: "NaCl",
    description: "Classic table salt, demonstrating an ionic bond created by full valence electron transfer.",
    atoms: [
      { symbol: "Na", pos: { x: -22, y: 0, z: 0 }, color: "#a855f7", size: 15 },
      { symbol: "Cl", pos: { x: 22, y: 0, z: 0 }, color: "#22c55e", size: 13 },
    ],
    edges: [
      { a: 0, b: 1, ionic: true },
    ],
    steps: [
      { atomIndices: [0], description: "Place Sodium (1 valence electron) and Chlorine (7 valence electrons) side-by-side" },
      { atomIndices: [1], description: "Transfer Na's outer electron to Cl, generating Na⁺ & Cl⁻ electrostatic attraction" },
    ]
  },
  HCl: {
    name: "Hydrogen Chloride",
    formula: "HCl",
    description: "A polar covalent gas that forms hydrochloric acid when dissolved in water.",
    atoms: [
      { symbol: "H", pos: { x: -20, y: 0, z: 0 }, color: "#e2e8f0", size: 8 },
      { symbol: "Cl", pos: { x: 16, y: 0, z: 0 }, color: "#22c55e", size: 13 },
    ],
    edges: [
      { a: 0, b: 1, polar: true },
    ],
    steps: [
      { atomIndices: [0], description: "Place Hydrogen atom with 1 valence electron" },
      { atomIndices: [1], description: "Attach Chlorine (7 valence e⁻) to share a pair, forming a strongly polar covalent bond" },
    ]
  },
  NH3: {
    name: "Ammonia",
    formula: "NH₃",
    description: "A stable binary hydride and the simplest pnictogen hydride, with a pungent smell.",
    atoms: [
      { symbol: "N", pos: { x: 0, y: -6, z: 0 }, color: "#3b82f6", size: 13 },
      { symbol: "H", pos: { x: -22, y: 12, z: 12 }, color: "#e2e8f0", size: 8 },
      { symbol: "H", pos: { x: 22, y: 12, z: 12 }, color: "#e2e8f0", size: 8 },
      { symbol: "H", pos: { x: 0, y: 12, z: -24 }, color: "#e2e8f0", size: 8 },
    ],
    edges: [
      { a: 0, b: 1 },
      { a: 0, b: 2 },
      { a: 0, b: 3 },
    ],
    steps: [
      { atomIndices: [0], description: "Place central Nitrogen atom (trigonal pyramidal center)" },
      { atomIndices: [1], description: "Form first N-H single covalent bond" },
      { atomIndices: [2], description: "Form second N-H bond (107.8° bond angle)" },
      { atomIndices: [3], description: "Attach third Hydrogen to complete the Ammonia pyramid" },
    ]
  },
  CH4: {
    name: "Methane",
    formula: "CH₄",
    description: "The simplest alkane and the main constituent of natural gas.",
    atoms: [
      { symbol: "C", pos: { x: 0, y: 0, z: 0 }, color: "#475569", size: 12 },
      { symbol: "H", pos: { x: 22, y: 22, z: 22 }, color: "#e2e8f0", size: 8 },
      { symbol: "H", pos: { x: -22, y: -22, z: 22 }, color: "#e2e8f0", size: 8 },
      { symbol: "H", pos: { x: -22, y: 22, z: -22 }, color: "#e2e8f0", size: 8 },
      { symbol: "H", pos: { x: 22, y: -22, z: -22 }, color: "#e2e8f0", size: 8 },
    ],
    edges: [
      { a: 0, b: 1 },
      { a: 0, b: 2 },
      { a: 0, b: 3 },
      { a: 0, b: 4 },
    ],
    steps: [
      { atomIndices: [0], description: "Place central Carbon atom (sp³ hybridization)" },
      { atomIndices: [1], description: "Attach first Hydrogen atom" },
      { atomIndices: [2], description: "Attach second Hydrogen atom" },
      { atomIndices: [3], description: "Attach third Hydrogen atom" },
      { atomIndices: [4], description: "Attach fourth Hydrogen to complete the tetrahedral Methane" },
    ]
  },
  C2H4: {
    name: "Ethylene",
    formula: "C₂H₄",
    description: "The simplest alkene, containing a C=C double bond, used as a hormone to ripen fruits.",
    atoms: [
      { symbol: "C", pos: { x: -18, y: 0, z: 0 }, color: "#475569", size: 12 },
      { symbol: "C", pos: { x: 18, y: 0, z: 0 }, color: "#475569", size: 12 },
      { symbol: "H", pos: { x: -32, y: 18, z: 0 }, color: "#e2e8f0", size: 8 },
      { symbol: "H", pos: { x: -32, y: -18, z: 0 }, color: "#e2e8f0", size: 8 },
      { symbol: "H", pos: { x: 32, y: 18, z: 0 }, color: "#e2e8f0", size: 8 },
      { symbol: "H", pos: { x: 32, y: -18, z: 0 }, color: "#e2e8f0", size: 8 },
    ],
    edges: [
      { a: 0, b: 1, double: true },
      { a: 0, b: 2 },
      { a: 0, b: 3 },
      { a: 1, b: 4 },
      { a: 1, b: 5 },
    ],
    steps: [
      { atomIndices: [0, 1], description: "Link two Carbon centers with a Double Bond (C=C)" },
      { atomIndices: [2], description: "Add first Hydrogen to Carbon-1" },
      { atomIndices: [3], description: "Add second Hydrogen to Carbon-1" },
      { atomIndices: [4], description: "Add third Hydrogen to Carbon-2" },
      { atomIndices: [5], description: "Add fourth Hydrogen to complete the planar Ethylene" },
    ]
  },
  C2H2: {
    name: "Acetylene",
    formula: "C₂H₂",
    description: "The simplest alkyne, containing a C≡C triple bond, used in welding torches.",
    atoms: [
      { symbol: "C", pos: { x: -18, y: 0, z: 0 }, color: "#475569", size: 12 },
      { symbol: "C", pos: { x: 18, y: 0, z: 0 }, color: "#475569", size: 12 },
      { symbol: "H", pos: { x: -42, y: 0, z: 0 }, color: "#e2e8f0", size: 8 },
      { symbol: "H", pos: { x: 42, y: 0, z: 0 }, color: "#e2e8f0", size: 8 },
    ],
    edges: [
      { a: 0, b: 1, triple: true },
      { a: 0, b: 2 },
      { a: 1, b: 3 },
    ],
    steps: [
      { atomIndices: [0, 1], description: "Link two Carbon centers with a Triple Bond (C≡C)" },
      { atomIndices: [2], description: "Form C-H single bond on left Carbon" },
      { atomIndices: [3], description: "Form C-H single bond on right Carbon to form linear Acetylene" },
    ]
  },
  CCl4: {
    name: "Carbon Tetrachloride",
    formula: "CCl₄",
    description: "An inorganic compound, formerly widely used in fire extinguishers and as a cleaning agent.",
    atoms: [
      { symbol: "C", pos: { x: 0, y: 0, z: 0 }, color: "#475569", size: 11 },
      { symbol: "Cl", pos: { x: 24, y: 24, z: 24 }, color: "#22c55e", size: 13 },
      { symbol: "Cl", pos: { x: -24, y: -24, z: 24 }, color: "#22c55e", size: 13 },
      { symbol: "Cl", pos: { x: -24, y: 24, z: -24 }, color: "#22c55e", size: 13 },
      { symbol: "Cl", pos: { x: 24, y: -24, z: -24 }, color: "#22c55e", size: 13 },
    ],
    edges: [
      { a: 0, b: 1 },
      { a: 0, b: 2 },
      { a: 0, b: 3 },
      { a: 0, b: 4 },
    ],
    steps: [
      { atomIndices: [0], description: "Place central Carbon atom" },
      { atomIndices: [1], description: "Form first C-Cl polar bond" },
      { atomIndices: [2], description: "Form second C-Cl polar bond" },
      { atomIndices: [3], description: "Form third C-Cl polar bond" },
      { atomIndices: [4], description: "Form final C-Cl polar bond (symmetry cancels overall dipole)" },
    ]
  },
  H2O2: {
    name: "Hydrogen Peroxide",
    formula: "H₂O₂",
    description: "A non-planar molecule with a single O-O bond, commonly used as an oxidizer and bleach.",
    atoms: [
      { symbol: "O", pos: { x: -16, y: -8, z: -10 }, color: "#ef4444", size: 14 },
      { symbol: "O", pos: { x: 16, y: 8, z: -10 }, color: "#ef4444", size: 14 },
      { symbol: "H", pos: { x: -32, y: 8, z: 12 }, color: "#e2e8f0", size: 8 },
      { symbol: "H", pos: { x: 32, y: -8, z: 12 }, color: "#e2e8f0", size: 8 },
    ],
    edges: [
      { a: 0, b: 1 },
      { a: 0, b: 2, polar: true },
      { a: 1, b: 3, polar: true },
    ],
    steps: [
      { atomIndices: [0, 1], description: "Link two Oxygen atoms via covalent Peroxide single bond (O-O)" },
      { atomIndices: [2], description: "Attach Hydrogen atom to left Oxygen atom" },
      { atomIndices: [3], description: "Attach second Hydrogen to right Oxygen at a skew dihedral angle of 111.5°" },
    ]
  },
  CH3COOH: {
    name: "Acetic Acid",
    formula: "CH₃COOH",
    description: "The organic compound that gives vinegar its sour taste and pungent smell, containing a carboxyl group.",
    atoms: [
      { symbol: "C", pos: { x: -22, y: -4, z: 0 }, color: "#475569", size: 12 },
      { symbol: "C", pos: { x: 14, y: 4, z: 0 }, color: "#475569", size: 12 },
      { symbol: "O", pos: { x: 26, y: 24, z: -8 }, color: "#ef4444", size: 14 },
      { symbol: "O", pos: { x: 28, y: -18, z: 8 }, color: "#ef4444", size: 14 },
      { symbol: "H", pos: { x: 48, y: -18, z: 8 }, color: "#e2e8f0", size: 8 },
      { symbol: "H", pos: { x: -32, y: -24, z: 12 }, color: "#e2e8f0", size: 8 },
      { symbol: "H", pos: { x: -32, y: -4, z: -22 }, color: "#e2e8f0", size: 8 },
      { symbol: "H", pos: { x: -22, y: 16, z: 12 }, color: "#e2e8f0", size: 8 },
    ],
    edges: [
      { a: 0, b: 1 },
      { a: 1, b: 2, double: true },
      { a: 1, b: 3 },
      { a: 3, b: 4, polar: true },
      { a: 0, b: 5 },
      { a: 0, b: 6 },
      { a: 0, b: 7 },
    ],
    steps: [
      { atomIndices: [0, 1], description: "Form C-C single bond backbone linking methyl and carbonyl carbons" },
      { atomIndices: [2], description: "Form Carbon-Oxygen double bond (C=O carbonyl group)" },
      { atomIndices: [3], description: "Add single-bonded Oxygen (C-O single covalent link)" },
      { atomIndices: [4], description: "Attach Hydrogen to single-bonded Oxygen to complete the carboxyl group (-COOH)" },
      { atomIndices: [5, 6, 7], description: "Attach three Hydrogen atoms to the methyl Carbon to complete Acetic Acid" },
    ]
  },
  C6H6: {
    name: "Benzene",
    formula: "C₆H₆",
    description: "An organic chemical compound composed of six carbon atoms joined in a planar ring.",
    atoms: [
      { symbol: "C", pos: { x: Math.cos(0) * 26, y: Math.sin(0) * 26, z: 0 }, color: "#475569", size: 12 },
      { symbol: "C", pos: { x: Math.cos(Math.PI/3) * 26, y: Math.sin(Math.PI/3) * 26, z: 0 }, color: "#475569", size: 12 },
      { symbol: "C", pos: { x: Math.cos(2*Math.PI/3) * 26, y: Math.sin(2*Math.PI/3) * 26, z: 0 }, color: "#475569", size: 12 },
      { symbol: "C", pos: { x: Math.cos(Math.PI) * 26, y: Math.sin(Math.PI) * 26, z: 0 }, color: "#475569", size: 12 },
      { symbol: "C", pos: { x: Math.cos(4*Math.PI/3) * 26, y: Math.sin(4*Math.PI/3) * 26, z: 0 }, color: "#475569", size: 12 },
      { symbol: "C", pos: { x: Math.cos(5*Math.PI/3) * 26, y: Math.sin(5*Math.PI/3) * 26, z: 0 }, color: "#475569", size: 12 },
      { symbol: "H", pos: { x: Math.cos(0) * 44, y: Math.sin(0) * 44, z: 0 }, color: "#e2e8f0", size: 8 },
      { symbol: "H", pos: { x: Math.cos(Math.PI/3) * 44, y: Math.sin(Math.PI/3) * 44, z: 0 }, color: "#e2e8f0", size: 8 },
      { symbol: "H", pos: { x: Math.cos(2*Math.PI/3) * 44, y: Math.sin(2*Math.PI/3) * 44, z: 0 }, color: "#e2e8f0", size: 8 },
      { symbol: "H", pos: { x: Math.cos(Math.PI) * 44, y: Math.sin(Math.PI) * 44, z: 0 }, color: "#e2e8f0", size: 8 },
      { symbol: "H", pos: { x: Math.cos(4*Math.PI/3) * 44, y: Math.sin(4*Math.PI/3) * 44, z: 0 }, color: "#e2e8f0", size: 8 },
      { symbol: "H", pos: { x: Math.cos(5*Math.PI/3) * 44, y: Math.sin(5*Math.PI/3) * 44, z: 0 }, color: "#e2e8f0", size: 8 },
    ],
    edges: [
      { a: 0, b: 1, double: true },
      { a: 1, b: 2 },
      { a: 2, b: 3, double: true },
      { a: 3, b: 4 },
      { a: 4, b: 5, double: true },
      { a: 5, b: 0 },
      { a: 0, b: 6 },
      { a: 1, b: 7 },
      { a: 2, b: 8 },
      { a: 3, b: 9 },
      { a: 4, b: 10 },
      { a: 5, b: 11 },
    ],
    steps: [
      { atomIndices: [0], description: "Place Carbon-1" },
      { atomIndices: [1], description: "Attach Carbon-2" },
      { atomIndices: [2], description: "Attach Carbon-3" },
      { atomIndices: [3], description: "Attach Carbon-4" },
      { atomIndices: [4], description: "Attach Carbon-5" },
      { atomIndices: [5], description: "Attach Carbon-6 and close the resonant hexagonal ring" },
      { atomIndices: [6, 7, 8, 9, 10, 11], description: "Attach all outer Hydrogen atoms to complete Benzene (C₆H₆)" },
    ]
  },
  C2H5OH: {
    name: "Ethanol",
    formula: "C₂H₅OH",
    description: "Clear, colorless liquid and the principal ingredient in alcoholic beverages.",
    atoms: [
      { symbol: "C", pos: { x: -16, y: 0, z: 0 }, color: "#475569", size: 12 },
      { symbol: "C", pos: { x: 16, y: 6, z: 0 }, color: "#475569", size: 12 },
      { symbol: "O", pos: { x: 42, y: -8, z: 0 }, color: "#ef4444", size: 14 },
      { symbol: "H", pos: { x: 54, y: -2, z: 12 }, color: "#e2e8f0", size: 8 },
      { symbol: "H", pos: { x: -16, y: -16, z: -15 }, color: "#e2e8f0", size: 8 },
      { symbol: "H", pos: { x: -16, y: -16, z: 15 }, color: "#e2e8f0", size: 8 },
      { symbol: "H", pos: { x: -34, y: 10, z: 0 }, color: "#e2e8f0", size: 8 },
      { symbol: "H", pos: { x: 16, y: 22, z: -15 }, color: "#e2e8f0", size: 8 },
      { symbol: "H", pos: { x: 16, y: 22, z: 15 }, color: "#e2e8f0", size: 8 },
    ],
    edges: [
      { a: 0, b: 1 },
      { a: 1, b: 2 },
      { a: 2, b: 3, polar: true },
      { a: 0, b: 4 },
      { a: 0, b: 5 },
      { a: 0, b: 6 },
      { a: 1, b: 7 },
      { a: 1, b: 8 },
    ],
    steps: [
      { atomIndices: [0], description: "Place first Carbon atom" },
      { atomIndices: [1], description: "Form Carbon-Carbon single bond" },
      { atomIndices: [2], description: "Form Carbon-Oxygen polar single bond" },
      { atomIndices: [3], description: "Attach Hydrogen to Oxygen to form the Hydroxyl group (-OH)" },
      { atomIndices: [4, 5, 6], description: "Attach three Hydrogens to Carbon-1 to form the Methyl group (-CH₃)" },
      { atomIndices: [7, 8], description: "Attach two Hydrogens to Carbon-2 to complete Ethanol" },
    ]
  },
  O3: {
    name: "Ozone",
    formula: "O₃",
    description: "An inorganic bent triatomic gas, presenting resonant bonds, that shields Earth from solar UV radiation.",
    atoms: [
      { symbol: "O", pos: { x: 0, y: 10, z: 0 }, color: "#ef4444", size: 14 },
      { symbol: "O", pos: { x: -22, y: -10, z: 0 }, color: "#ef4444", size: 14 },
      { symbol: "O", pos: { x: 22, y: -10, z: 0 }, color: "#ef4444", size: 14 },
    ],
    edges: [
      { a: 0, b: 1, double: true },
      { a: 0, b: 2 },
    ],
    steps: [
      { atomIndices: [0], description: "Place central Oxygen atom" },
      { atomIndices: [1], description: "Attach left Oxygen atom via a double bond" },
      { atomIndices: [2], description: "Attach right Oxygen atom (117° bond angle, resonant structure)" },
    ]
  },
  SF6: {
    name: "Sulfur Hexafluoride",
    formula: "SF₆",
    description: "An inorganic, colorless, odorless, non-flammable, and extremely potent greenhouse gas with an octahedral shape.",
    atoms: [
      { symbol: "S", pos: { x: 0, y: 0, z: 0 }, color: "#eab308", size: 15 },
      { symbol: "F", pos: { x: 30, y: 0, z: 0 }, color: "#22c55e", size: 10 },
      { symbol: "F", pos: { x: -30, y: 0, z: 0 }, color: "#22c55e", size: 10 },
      { symbol: "F", pos: { x: 0, y: 30, z: 0 }, color: "#22c55e", size: 10 },
      { symbol: "F", pos: { x: 0, y: -30, z: 0 }, color: "#22c55e", size: 10 },
      { symbol: "F", pos: { x: 0, y: 0, z: 30 }, color: "#22c55e", size: 10 },
      { symbol: "F", pos: { x: 0, y: 0, z: -30 }, color: "#22c55e", size: 10 },
    ],
    edges: [
      { a: 0, b: 1 },
      { a: 0, b: 2 },
      { a: 0, b: 3 },
      { a: 0, b: 4 },
      { a: 0, b: 5 },
      { a: 0, b: 6 },
    ],
    steps: [
      { atomIndices: [0], description: "Place central Sulfur atom (sp³d² hybridization, expanded octet)" },
      { atomIndices: [1, 2], description: "Attach axial Fluorine atoms along the X-axis" },
      { atomIndices: [3, 4], description: "Attach equatorial Fluorine atoms along the Y-axis" },
      { atomIndices: [5, 6], description: "Attach Fluorines along the Z-axis to complete the octahedral SF₆" },
    ]
  },
  PCl5: {
    name: "Phosphorus Pentachloride",
    formula: "PCl₅",
    description: "A major chlorinating reagent in organic chemistry, exhibiting a trigonal bipyramidal geometry.",
    atoms: [
      { symbol: "P", pos: { x: 0, y: 0, z: 0 }, color: "#f97316", size: 14 },
      { symbol: "Cl", pos: { x: 30, y: 0, z: 0 }, color: "#22c55e", size: 13 },
      { symbol: "Cl", pos: { x: -15, y: 26, z: 0 }, color: "#22c55e", size: 13 },
      { symbol: "Cl", pos: { x: -15, y: -26, z: 0 }, color: "#22c55e", size: 13 },
      { symbol: "Cl", pos: { x: 0, y: 0, z: 32 }, color: "#22c55e", size: 13 },
      { symbol: "Cl", pos: { x: 0, y: 0, z: -32 }, color: "#22c55e", size: 13 },
    ],
    edges: [
      { a: 0, b: 1 },
      { a: 0, b: 2 },
      { a: 0, b: 3 },
      { a: 0, b: 4 },
      { a: 0, b: 5 },
    ],
    steps: [
      { atomIndices: [0], description: "Place central Phosphorus atom (sp³d hybridization)" },
      { atomIndices: [1, 2, 3], description: "Attach three Chlorine atoms in a flat equatorial plane (120° angles)" },
      { atomIndices: [4, 5], description: "Attach two axial Chlorine atoms perpendicular to the plane (90° angles)" },
    ]
  },
  H2SO4: {
    name: "Sulfuric Acid",
    formula: "H₂SO₄",
    description: "A highly corrosive strong mineral acid, historically known as oil of vitriol.",
    atoms: [
      { symbol: "S", pos: { x: 0, y: 0, z: 0 }, color: "#eab308", size: 15 },
      { symbol: "O", pos: { x: 0, y: 26, z: 16 }, color: "#ef4444", size: 14 },
      { symbol: "O", pos: { x: 0, y: -26, z: 16 }, color: "#ef4444", size: 14 },
      { symbol: "O", pos: { x: -24, y: 0, z: -16 }, color: "#ef4444", size: 14 },
      { symbol: "O", pos: { x: 24, y: 0, z: -16 }, color: "#ef4444", size: 14 },
      { symbol: "H", pos: { x: -42, y: 0, z: -8 }, color: "#e2e8f0", size: 8 },
      { symbol: "H", pos: { x: 42, y: 0, z: -8 }, color: "#e2e8f0", size: 8 },
    ],
    edges: [
      { a: 0, b: 1, double: true },
      { a: 0, b: 2, double: true },
      { a: 0, b: 3 },
      { a: 0, b: 4 },
      { a: 3, b: 5, polar: true },
      { a: 4, b: 6, polar: true },
    ],
    steps: [
      { atomIndices: [0], description: "Place central Sulfur atom" },
      { atomIndices: [1, 2], description: "Attach two double-bonded Oxygen atoms (carbonyl/oxo groups)" },
      { atomIndices: [3, 4], description: "Attach two single-bonded Oxygen atoms" },
      { atomIndices: [5, 6], description: "Attach Hydrogen atoms to the single-bonded Oxygens to form two -OH groups" },
    ]
  },
  CH3OH: {
    name: "Methanol",
    formula: "CH₃OH",
    description: "The simplest alcohol, a light, volatile, colorless, flammable liquid with a distinctive odor.",
    atoms: [
      { symbol: "C", pos: { x: -16, y: 0, z: 0 }, color: "#475569", size: 12 },
      { symbol: "O", pos: { x: 16, y: 0, z: 0 }, color: "#ef4444", size: 14 },
      { symbol: "H", pos: { x: 28, y: 16, z: 10 }, color: "#e2e8f0", size: 8 },
      { symbol: "H", pos: { x: -28, y: -14, z: 12 }, color: "#e2e8f0", size: 8 },
      { symbol: "H", pos: { x: -28, y: -14, z: -12 }, color: "#e2e8f0", size: 8 },
      { symbol: "H", pos: { x: -22, y: 22, z: 0 }, color: "#e2e8f0", size: 8 },
    ],
    edges: [
      { a: 0, b: 1 },
      { a: 1, b: 2, polar: true },
      { a: 0, b: 3 },
      { a: 0, b: 4 },
      { a: 0, b: 5 },
    ],
    steps: [
      { atomIndices: [0], description: "Place Carbon atom" },
      { atomIndices: [1], description: "Attach Oxygen atom via single covalent bond" },
      { atomIndices: [2], description: "Attach Hydrogen to Oxygen to form the hydroxyl group (-OH)" },
      { atomIndices: [3, 4, 5], description: "Attach three Hydrogen atoms to Carbon to complete the methyl group (-CH₃)" },
    ]
  },
  CO: {
    name: "Carbon Monoxide",
    formula: "CO",
    description: "A toxic, colorless, odorless, and tasteless gas, consisting of a Carbon and an Oxygen linked by a triple bond.",
    atoms: [
      { symbol: "C", pos: { x: -16, y: 0, z: 0 }, color: "#475569", size: 12 },
      { symbol: "O", pos: { x: 16, y: 0, z: 0 }, color: "#ef4444", size: 14 },
    ],
    edges: [
      { a: 0, b: 1, triple: true },
    ],
    steps: [
      { atomIndices: [0], description: "Place Carbon atom" },
      { atomIndices: [1], description: "Attach Oxygen atom sharing a triple covalent bond" },
    ]
  }
};

interface OrbitalDef {
  name: string;
  formula: string;
  description: string;
  type: "1s" | "2pz" | "3dz2" | "3dxy" | "4fz3";
}

const ORBITALS: Record<string, OrbitalDef> = {
  "1s": {
    name: "1s Hydrogen Subshell",
    formula: "ψ₁s",
    description: "Spherical symmetry representing the lowest ground state energy of a Hydrogen atom. Electron probability density is highest at the center.",
    type: "1s"
  },
  "2pz": {
    name: "2pz Dumbbell Orbital",
    formula: "ψ₂pz",
    description: "Two dumbbell lobes aligned along the vertical Z-axis. Node at the XY plane where electron probability is zero.",
    type: "2pz"
  },
  "3dz2": {
    name: "3dz² Clover/Torus Orbital",
    formula: "ψ₃dz²",
    description: "Two vertical dumbbell lobes along the Z-axis surrounded by a central torus ring (donut) in the XY plane. Expanded octet geometry element.",
    type: "3dz2"
  },
  "3dxy": {
    name: "3dxy Cloverleaf Orbital",
    formula: "ψ₃dxy",
    description: "Four planar lobes located in the quadrants between the X and Y axes, making it highly directional in transition metal bonding.",
    type: "3dxy"
  },
  "4fz3": {
    name: "4fz³ Octal Orbital",
    formula: "ψ₄fz³",
    description: "Complex wave symmetry with multiple lobes and ring nodes. Highly descriptive of lanthanide and actinide valence structures.",
    type: "4fz3"
  }
};

interface OrbitalPoint {
  x: number;
  y: number;
  z: number;
  phase: number;
}

const generateOrbitalPoints = (type: string): OrbitalPoint[] => {
  const pts: OrbitalPoint[] = [];
  const C = 44; 
  
  const stepsTheta = 22;
  const stepsPhi = 38;
  
  for (let i = 0; i <= stepsTheta; i++) {
    const theta = (i / stepsTheta) * Math.PI;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    
    for (let j = 0; j < stepsPhi; j++) {
      const phi = (j / stepsPhi) * Math.PI * 2;
      
      let r = 0;
      let phase = 1;
      
      if (type === "1s") {
        r = C * 1.1;
        phase = 1;
      } else if (type === "2pz") {
        const val = cosTheta;
        r = C * 1.4 * val;
        phase = val >= 0 ? 1 : -1;
      } else if (type === "3dz2") {
        const val = 3 * cosTheta * cosTheta - 1;
        r = C * 0.95 * val;
        phase = val >= 0 ? 1 : -1;
      } else if (type === "3dxy") {
        const val = sinTheta * sinTheta * Math.sin(2 * phi);
        r = C * 1.4 * val;
        phase = val >= 0 ? 1 : -1;
      } else if (type === "4fz3") {
        const val = cosTheta * (5 * cosTheta * cosTheta - 3);
        r = C * 1.25 * val;
        phase = val >= 0 ? 1 : -1;
      }
      
      const absR = Math.abs(r);
      if (absR < 0.05) continue;
      
      const x = absR * sinTheta * Math.cos(phi);
      const y = absR * sinTheta * Math.sin(phi);
      const z = absR * cosTheta;
      
      pts.push({ x, y, z, phase });
    }
  }
  return pts;
};

// ── Crystal Lattices ──────────────────────────────────────────────────────────
const LATTICES: Record<string, {
  name: string;
  formula: string;
  description: string;
  atoms: AtomDef[];
  edges: Edge[];
}> = {
  SC: {
    name: "Simple Cubic (SC)",
    formula: "Coord: 6",
    description: "The simplest crystal structure, with atoms placed only at the corners of a cube. Low packing density (52%), seen in Polonium.",
    atoms: [
      { symbol: "Po", pos: { x: -20, y: -20, z: -20 }, color: "#94a3b8", size: 12 },
      { symbol: "Po", pos: { x: 20, y: -20, z: -20 }, color: "#94a3b8", size: 12 },
      { symbol: "Po", pos: { x: 20, y: 20, z: -20 }, color: "#94a3b8", size: 12 },
      { symbol: "Po", pos: { x: -20, y: 20, z: -20 }, color: "#94a3b8", size: 12 },
      { symbol: "Po", pos: { x: -20, y: -20, z: 20 }, color: "#94a3b8", size: 12 },
      { symbol: "Po", pos: { x: 20, y: -20, z: 20 }, color: "#94a3b8", size: 12 },
      { symbol: "Po", pos: { x: 20, y: 20, z: 20 }, color: "#94a3b8", size: 12 },
      { symbol: "Po", pos: { x: -20, y: 20, z: 20 }, color: "#94a3b8", size: 12 },
    ],
    edges: [
      { a: 0, b: 1 }, { a: 1, b: 2 }, { a: 2, b: 3 }, { a: 3, b: 0 },
      { a: 4, b: 5 }, { a: 5, b: 6 }, { a: 6, b: 7 }, { a: 7, b: 4 },
      { a: 0, b: 4 }, { a: 1, b: 5 }, { a: 2, b: 6 }, { a: 3, b: 7 },
    ]
  },
  BCC: {
    name: "Body-Centered Cubic (BCC)",
    formula: "Coord: 8",
    description: "An atom sits in the center of a cube with 8 corner atoms. Packing efficiency of 68%. Common in metals like Iron (Fe) and Sodium (Na).",
    atoms: [
      { symbol: "Fe", pos: { x: -20, y: -20, z: -20 }, color: "#475569", size: 10 },
      { symbol: "Fe", pos: { x: 20, y: -20, z: -20 }, color: "#475569", size: 10 },
      { symbol: "Fe", pos: { x: 20, y: 20, z: -20 }, color: "#475569", size: 10 },
      { symbol: "Fe", pos: { x: -20, y: 20, z: -20 }, color: "#475569", size: 10 },
      { symbol: "Fe", pos: { x: -20, y: -20, z: 20 }, color: "#475569", size: 10 },
      { symbol: "Fe", pos: { x: 20, y: -20, z: 20 }, color: "#475569", size: 10 },
      { symbol: "Fe", pos: { x: 20, y: 20, z: 20 }, color: "#475569", size: 10 },
      { symbol: "Fe", pos: { x: -20, y: 20, z: 20 }, color: "#475569", size: 10 },
      { symbol: "Fe", pos: { x: 0, y: 0, z: 0 }, color: "#ef4444", size: 12 },
    ],
    edges: [
      { a: 0, b: 1 }, { a: 1, b: 2 }, { a: 2, b: 3 }, { a: 3, b: 0 },
      { a: 4, b: 5 }, { a: 5, b: 6 }, { a: 6, b: 7 }, { a: 7, b: 4 },
      { a: 0, b: 4 }, { a: 1, b: 5 }, { a: 2, b: 6 }, { a: 3, b: 7 },
      { a: 0, b: 8 }, { a: 1, b: 8 }, { a: 2, b: 8 }, { a: 3, b: 8 },
      { a: 4, b: 8 }, { a: 5, b: 8 }, { a: 6, b: 8 }, { a: 7, b: 8 },
    ]
  },
  FCC: {
    name: "Face-Centered Cubic (FCC)",
    formula: "Coord: 12",
    description: "Atoms at corners plus atoms in the centers of all six cube faces. Closest packing with 74% efficiency, seen in Copper (Cu) and Gold.",
    atoms: [
      { symbol: "Cu", pos: { x: -20, y: -20, z: -20 }, color: "#ea580c", size: 9 },
      { symbol: "Cu", pos: { x: 20, y: -20, z: -20 }, color: "#ea580c", size: 9 },
      { symbol: "Cu", pos: { x: 20, y: 20, z: -20 }, color: "#ea580c", size: 9 },
      { symbol: "Cu", pos: { x: -20, y: 20, z: -20 }, color: "#ea580c", size: 9 },
      { symbol: "Cu", pos: { x: -20, y: -20, z: 20 }, color: "#ea580c", size: 9 },
      { symbol: "Cu", pos: { x: 20, y: -20, z: 20 }, color: "#ea580c", size: 9 },
      { symbol: "Cu", pos: { x: 20, y: 20, z: 20 }, color: "#ea580c", size: 9 },
      { symbol: "Cu", pos: { x: -20, y: 20, z: 20 }, color: "#ea580c", size: 9 },
      { symbol: "Cu", pos: { x: 0, y: 0, z: -20 }, color: "#3b82f6", size: 10 },
      { symbol: "Cu", pos: { x: 0, y: 0, z: 20 }, color: "#3b82f6", size: 10 },
      { symbol: "Cu", pos: { x: -20, y: 0, z: 0 }, color: "#3b82f6", size: 10 },
      { symbol: "Cu", pos: { x: 20, y: 0, z: 0 }, color: "#3b82f6", size: 10 },
      { symbol: "Cu", pos: { x: 0, y: -20, z: 0 }, color: "#3b82f6", size: 10 },
      { symbol: "Cu", pos: { x: 0, y: 20, z: 0 }, color: "#3b82f6", size: 10 },
    ],
    edges: [
      { a: 0, b: 1 }, { a: 1, b: 2 }, { a: 2, b: 3 }, { a: 3, b: 0 },
      { a: 4, b: 5 }, { a: 5, b: 6 }, { a: 6, b: 7 }, { a: 7, b: 4 },
      { a: 0, b: 4 }, { a: 1, b: 5 }, { a: 2, b: 6 }, { a: 3, b: 7 },
      { a: 0, b: 8 }, { a: 1, b: 8 }, { a: 2, b: 8 }, { a: 3, b: 8 },
      { a: 4, b: 9 }, { a: 5, b: 9 }, { a: 6, b: 9 }, { a: 7, b: 9 },
      { a: 0, b: 10 }, { a: 3, b: 10 }, { a: 4, b: 10 }, { a: 7, b: 10 },
      { a: 1, b: 11 }, { a: 2, b: 11 }, { a: 5, b: 11 }, { a: 6, b: 11 },
      { a: 0, b: 12 }, { a: 1, b: 12 }, { a: 4, b: 12 }, { a: 5, b: 12 },
      { a: 2, b: 13 }, { a: 3, b: 13 }, { a: 6, b: 13 }, { a: 7, b: 13 },
    ]
  },
  NaCl: {
    name: "Halite (NaCl) Lattice",
    formula: "Coord: 6:6",
    description: "An interlocking Face-Centered Cubic lattice. Alternating Na⁺ (violet) and Cl⁻ (green) ions connected by electrostatic forces.",
    atoms: (() => {
      const atomsList: AtomDef[] = [];
      const coords = [-24, 0, 24];
      for (const x of coords) {
        for (const y of coords) {
          for (const z of coords) {
            const isNa = (Math.abs(x) + Math.abs(y) + Math.abs(z)) % 48 === 0;
            atomsList.push({
              symbol: isNa ? "Na" : "Cl",
              pos: { x, y, z },
              color: isNa ? "#a855f7" : "#22c55e",
              size: isNa ? 10 : 12,
            });
          }
        }
      }
      return atomsList;
    })(),
    edges: (() => {
      const edgesList: Edge[] = [];
      const coords = [-24, 0, 24];
      const getIndex = (x: number, y: number, z: number) => {
        const xi = coords.indexOf(x);
        const yi = coords.indexOf(y);
        const zi = coords.indexOf(z);
        return xi * 9 + yi * 3 + zi;
      };
      
      for (let xi = 0; xi < 3; xi++) {
        for (let yi = 0; yi < 3; yi++) {
          for (let zi = 0; zi < 3; zi++) {
            const idx = xi * 9 + yi * 3 + zi;
            if (xi < 2) edgesList.push({ a: idx, b: getIndex(coords[xi+1], coords[yi], coords[zi]), ionic: true });
            if (yi < 2) edgesList.push({ a: idx, b: getIndex(coords[xi], coords[yi+1], coords[zi]), ionic: true });
            if (zi < 2) edgesList.push({ a: idx, b: getIndex(coords[xi], coords[yi], coords[zi+1]), ionic: true });
          }
        }
      }
      return edgesList;
    })()
  },
  Diamond: {
    name: "Diamond Tetrahedral",
    formula: "Carbon sp³",
    description: "A tetrahedral covalent network of Carbon. Every atom is bonded to 4 others at 109.5° angles, making diamond the hardest natural material.",
    atoms: [
      { symbol: "C", pos: { x: 0, y: 0, z: 0 }, color: "#475569", size: 11 },
      { symbol: "C", pos: { x: 22, y: 22, z: 22 }, color: "#475569", size: 11 },
      { symbol: "C", pos: { x: -22, y: -22, z: 22 }, color: "#475569", size: 11 },
      { symbol: "C", pos: { x: -22, y: 22, z: -22 }, color: "#475569", size: 11 },
      { symbol: "C", pos: { x: 22, y: -22, z: -22 }, color: "#475569", size: 11 },
      { symbol: "C", pos: { x: 34, y: 34, z: 0 }, color: "#475569", size: 11 },
      { symbol: "C", pos: { x: -34, y: -34, z: 0 }, color: "#475569", size: 11 },
      { symbol: "C", pos: { x: -34, y: 0, z: -34 }, color: "#475569", size: 11 },
      { symbol: "C", pos: { x: 34, y: 0, z: -34 }, color: "#475569", size: 11 },
    ],
    edges: [
      { a: 0, b: 1 }, { a: 0, b: 2 }, { a: 0, b: 3 }, { a: 0, b: 4 },
      { a: 1, b: 5 }, { a: 2, b: 6 }, { a: 3, b: 7 }, { a: 4, b: 8 },
    ]
  },
  Graphite: {
    name: "Graphite Layers",
    formula: "Carbon sp²",
    description: "Parallel sheets of covalent carbon rings (graphene). Vertical dashed links show weak interlayer van der Waals forces which allow sheets to slide.",
    atoms: [
      { symbol: "C", pos: { x: Math.cos(0)*22, y: Math.sin(0)*22, z: -16 }, color: "#475569", size: 11 },
      { symbol: "C", pos: { x: Math.cos(Math.PI/3)*22, y: Math.sin(Math.PI/3)*22, z: -16 }, color: "#475569", size: 11 },
      { symbol: "C", pos: { x: Math.cos(2*Math.PI/3)*22, y: Math.sin(2*Math.PI/3)*22, z: -16 }, color: "#475569", size: 11 },
      { symbol: "C", pos: { x: Math.cos(Math.PI)*22, y: Math.sin(Math.PI)*22, z: -16 }, color: "#475569", size: 11 },
      { symbol: "C", pos: { x: Math.cos(4*Math.PI/3)*22, y: Math.sin(4*Math.PI/3)*22, z: -16 }, color: "#475569", size: 11 },
      { symbol: "C", pos: { x: Math.cos(5*Math.PI/3)*22, y: Math.sin(5*Math.PI/3)*22, z: -16 }, color: "#475569", size: 11 },
      { symbol: "C", pos: { x: Math.cos(0)*22, y: Math.sin(0)*22, z: 16 }, color: "#475569", size: 11 },
      { symbol: "C", pos: { x: Math.cos(Math.PI/3)*22, y: Math.sin(Math.PI/3)*22, z: 16 }, color: "#475569", size: 11 },
      { symbol: "C", pos: { x: Math.cos(2*Math.PI/3)*22, y: Math.sin(2*Math.PI/3)*22, z: 16 }, color: "#475569", size: 11 },
      { symbol: "C", pos: { x: Math.cos(Math.PI)*22, y: Math.sin(Math.PI)*22, z: 16 }, color: "#475569", size: 11 },
      { symbol: "C", pos: { x: Math.cos(4*Math.PI/3)*22, y: Math.sin(4*Math.PI/3)*22, z: 16 }, color: "#475569", size: 11 },
      { symbol: "C", pos: { x: Math.cos(5*Math.PI/3)*22, y: Math.sin(5*Math.PI/3)*22, z: 16 }, color: "#475569", size: 11 },
    ],
    edges: [
      { a: 0, b: 1 }, { a: 1, b: 2 }, { a: 2, b: 3 }, { a: 3, b: 4 }, { a: 4, b: 5 }, { a: 5, b: 0 },
      { a: 6, b: 7 }, { a: 7, b: 8 }, { a: 8, b: 9 }, { a: 9, b: 10 }, { a: 10, b: 11 }, { a: 11, b: 6 },
      { a: 0, b: 6, ionic: true },
      { a: 1, b: 7, ionic: true },
      { a: 2, b: 8, ionic: true },
      { a: 3, b: 9, ionic: true },
      { a: 4, b: 10, ionic: true },
      { a: 5, b: 11, ionic: true },
    ]
  }
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialMolecule?: string;
  initialTab?: "molecules" | "orbitals" | "lattices";
}

export default function MolecularBuilder({ isOpen, onClose, initialMolecule = "H2O", initialTab = "molecules" }: Props) {
  const [selectedKey, setSelectedKey] = useState<string>(initialMolecule);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);

  const [mounted, setMounted] = useState<boolean>(false);
  const theme: string = "light";
  const [activeTab, setActiveTab] = useState<"molecules" | "orbitals" | "lattices">(initialTab);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef({ rotX: -22, rotY: 30, isDragging: false, startX: 0, startY: 0 });

  const activeMol = MOLECULES[selectedKey] || MOLECULES.H2O;
  const activeOrb = ORBITALS[selectedKey] || ORBITALS["1s"];
  const activeLat = LATTICES[selectedKey] || LATTICES.SC;

  // Fly-in animation coordinate states
  const flyInAtomsRef = useRef<{ x: number; y: number; z: number }[]>([]);
  const flyInProgressRef = useRef<number[]>([]);
  const rippleWavesRef = useRef<{ x: number; y: number; size: number; max: number; opacity: number }[]>([]);

  // Setup mounted state for React Portals
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Reset modal state on open or change
  useEffect(() => {
    if (isOpen) {
      setSelectedKey(initialMolecule);
      setActiveTab(initialTab);
      setActiveStep(0);
      setIsPlaying(false);
      rippleWavesRef.current = [];
    }
  }, [isOpen, initialMolecule, initialTab]);

  // Handle active tab change defaults
  useEffect(() => {
    if (activeTab === "molecules") setSelectedKey("H2O");
    else if (activeTab === "orbitals") setSelectedKey("1s");
    else if (activeTab === "lattices") setSelectedKey("SC");
    setActiveStep(0);
    setIsPlaying(false);
  }, [activeTab]);

  useEffect(() => {
    synth.setMute(muted);
  }, [muted]);

  // Set up fly-in coordinates when step changes
  useEffect(() => {
    if (!isOpen) return;
    if (activeTab !== "molecules") return; // Lattices and Orbitals don't use guided fly-in

    const currentStepDef = activeMol.steps[activeStep];
    if (currentStepDef) {
      currentStepDef.atomIndices.forEach((atomIdx) => {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const dist = 190 + Math.random() * 60;
        
        flyInAtomsRef.current[atomIdx] = {
          x: dist * Math.sin(phi) * Math.cos(theta),
          y: dist * Math.sin(phi) * Math.sin(theta),
          z: dist * Math.cos(phi) * 0.5,
        };
        flyInProgressRef.current[atomIdx] = 0.0;
      });
    }
  }, [activeStep, activeMol, isOpen, activeTab]);

  // Auto-Play timer effect
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      if (activeStep < activeMol.steps.length - 1) {
        setActiveStep((s) => s + 1);
      } else {
        setIsPlaying(false);
        synth.playChime();
      }
    }, 2400);
    return () => clearInterval(interval);
  }, [isPlaying, activeStep, activeMol]);

  // Main Canvas Render Loop
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const wrapper = canvas.parentElement;
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      const width = Math.floor(rect.width || 380);
      const height = Math.floor(rect.height || 380);
      
      const dpr = window.devicePixelRatio || 1;
      
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);
      }

      // Draw background colors based on active theme
      if (theme === "dark") {
        ctx.clearRect(0, 0, width, height);
      } else {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
      }

      const centerX = width / 2;
      const centerY = height / 2;
      // 1.5x scaling multiplier applied to scaleBase
      const scaleBase = (Math.min(width, height) / 380) * 1.45;

      // Draw HUD grid
      ctx.strokeStyle = theme === "dark" ? "rgba(34, 211, 238, 0.025)" : "rgba(15, 23, 42, 0.045)";
      ctx.lineWidth = 0.8;
      const gridSpacing = 20;
      for (let i = gridSpacing; i < width; i += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = gridSpacing; i < height; i += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      // Render ripples (Molecules only)
      if (activeTab === "molecules") {
        rippleWavesRef.current = rippleWavesRef.current
          .map((wave) => ({
            ...wave,
            size: wave.size + 1.2,
            opacity: wave.opacity * 0.93,
          }))
          .filter((wave) => wave.opacity > 0.02);

        rippleWavesRef.current.forEach((wave) => {
          ctx.beginPath();
          ctx.arc(wave.x, wave.y, wave.size, 0, Math.PI * 2);
          ctx.strokeStyle = theme === "dark" 
            ? `rgba(34, 211, 238, ${wave.opacity})` 
            : `rgba(8, 145, 178, ${wave.opacity})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        });
      }

      // Slowly rotate molecule when not interacting
      if (!rotationRef.current.isDragging) {
        rotationRef.current.rotY += 0.25;
      }

      const rx = (rotationRef.current.rotX * Math.PI) / 180;
      const ry = (rotationRef.current.rotY * Math.PI) / 180;
      const perspective = 350;

      // Projection formula
      const project = (x: number, y: number, z: number) => {
        let x1 = x * Math.cos(ry) + z * Math.sin(ry);
        let z1 = -x * Math.sin(ry) + z * Math.cos(ry);
        let y2 = y * Math.cos(rx) - z1 * Math.sin(rx);
        let z2 = y * Math.sin(rx) + z1 * Math.cos(rx);
        const scale = perspective / (perspective + z2);
        return {
          px: centerX + x1 * scale * scaleBase,
          py: centerY + y2 * scale * scaleBase,
          pz: z2,
          scale: scale * scaleBase,
        };
      };

      // Render tab-specific objects
      if (activeTab === "orbitals") {
        // ── Render 3D Wavefunction Probability Point Cloud ──
        const orbitalPoints = generateOrbitalPoints(selectedKey);
        const projectedPoints = orbitalPoints.map((pt) => {
          const proj = project(pt.x, pt.y, pt.z);
          return {
            px: proj.px,
            py: proj.py,
            pz: proj.pz,
            scale: proj.scale,
            phase: pt.phase,
          };
        });

        // Painter's algorithm
        projectedPoints.sort((a, b) => b.pz - a.pz);

        projectedPoints.forEach((pt) => {
          ctx.beginPath();
          ctx.arc(pt.px, pt.py, 1.8 * pt.scale, 0, Math.PI * 2);
          if (pt.phase === 1) {
            ctx.fillStyle = theme === "dark" ? "rgba(34, 211, 238, 0.45)" : "rgba(8, 145, 178, 0.55)";
          } else {
            ctx.fillStyle = theme === "dark" ? "rgba(244, 63, 94, 0.45)" : "rgba(225, 29, 72, 0.55)";
          }
          ctx.fill();
        });
      } else {
        // ── Render Molecules or Crystal Lattices ──
        const isLatticeMode = activeTab === "lattices";
        const targetMol = (isLatticeMode ? activeLat : activeMol) as any;

        // Determine set of assembled atoms
        const assembledAtomIndices = new Set<number>();
        if (isLatticeMode) {
          // Lattices are fully pre-assembled
          targetMol.atoms.forEach((_: any, idx: number) => assembledAtomIndices.add(idx));
        } else {
          for (let s = 0; s <= activeStep; s++) {
            const stepDef = targetMol.steps[s];
            if (stepDef) {
              stepDef.atomIndices.forEach((idx: number) => assembledAtomIndices.add(idx));
            }
          }
        }

        // Interpolate coordinates for active incoming atoms (Cubic Ease-Out)
        const currentStepAtoms = isLatticeMode ? [] : (targetMol.steps[activeStep]?.atomIndices || []);
        const currentAtoms = targetMol.atoms.map((atom: any, idx: number) => {
          if (!assembledAtomIndices.has(idx)) return null;
          if (isLatticeMode) return { ...atom, pos: atom.pos, progress: 1.0, isAssembling: false };

          const target = atom.pos;
          const start = flyInAtomsRef.current[idx];

          if (start && currentStepAtoms.includes(idx)) {
            let prog = flyInProgressRef.current[idx] ?? 0.0;
            if (prog < 1.0) {
              prog += 0.022;
              if (prog >= 1.0) {
                prog = 1.0;
                synth.playSnap();
              }
              flyInProgressRef.current[idx] = prog;
            }

            const t = 1 - Math.pow(1 - prog, 3);
            const interpPos = {
              x: start.x + (target.x - start.x) * t,
              y: start.y + (target.y - start.y) * t,
              z: start.z + (target.z - start.z) * t,
            };
            return { ...atom, pos: interpPos, progress: prog, isAssembling: prog < 1.0 };
          }

          return { ...atom, pos: target, progress: 1.0, isAssembling: false };
        });

        // Render Trajectory Path Lines (Molecules only)
        if (!isLatticeMode) {
          currentStepAtoms.forEach((idx: number) => {
            const atom = currentAtoms[idx];
            const start = flyInAtomsRef.current[idx];
            if (!atom || !start || !atom.isAssembling) return;

            const ptStart = project(start.x, start.y, start.z);
            const targetPt = project(targetMol.atoms[idx].pos.x, targetMol.atoms[idx].pos.y, targetMol.atoms[idx].pos.z);
            ctx.beginPath();
            ctx.moveTo(ptStart.px, ptStart.py);
            ctx.lineTo(targetPt.px, targetPt.py);
            ctx.strokeStyle = theme === "dark" ? "rgba(34, 211, 238, 0.12)" : "rgba(8, 145, 178, 0.22)";
            ctx.lineWidth = 0.9;
            ctx.setLineDash([3, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
          });
        }

        // Draw Bonds (Edges)
        targetMol.edges.forEach((edge: any) => {
          const a = currentAtoms[edge.a];
          const b = currentAtoms[edge.b];
          if (!a || !b) return;

          const progress = Math.min(a.progress, b.progress);
          if (progress <= 0.05) return;

          const ptA = project(a.pos.x, a.pos.y, a.pos.z);
          let ptB = project(b.pos.x, b.pos.y, b.pos.z);

          // Dynamic Laser Bond Growth
          if (progress < 1.0) {
            const anchor = a.progress === 1.0 ? a : b.progress === 1.0 ? b : null;
            const targetAtom = anchor === a ? b : a;
            const startPt = anchor ? anchor.pos : { x: (a.pos.x + b.pos.x)/2, y: (a.pos.y + b.pos.y)/2, z: (a.pos.z + b.pos.z)/2 };
            
            const tipX = startPt.x + (targetAtom.pos.x - startPt.x) * progress;
            const tipY = startPt.y + (targetAtom.pos.y - startPt.y) * progress;
            const tipZ = startPt.z + (targetAtom.pos.z - startPt.z) * progress;
            ptB = project(tipX, tipY, tipZ);
          }

          const dx = ptB.px - ptA.px;
          const dy = ptB.py - ptA.py;
          const len = Math.sqrt(dx * dx + dy * dy);
          const px = (-dy / len) * 3 * ptA.scale;
          const py = (dx / len) * 3 * ptA.scale;

          ctx.strokeStyle = edge.ionic 
            ? (theme === "dark" ? "rgba(168, 85, 247, 0.45)" : "rgba(147, 51, 234, 0.55)")
            : (theme === "dark" ? "rgba(148, 163, 184, 0.85)" : "rgba(71, 85, 105, 0.90)");

          if (edge.triple) {
            ctx.lineWidth = 1.4 * ptA.scale;
            ctx.beginPath(); ctx.moveTo(ptA.px - px*1.5, ptA.py - py*1.5); ctx.lineTo(ptB.px - px*1.5, ptB.py - py*1.5); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(ptA.px, ptA.py); ctx.lineTo(ptB.px, ptB.py); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(ptA.px + px*1.5, ptA.py + py*1.5); ctx.lineTo(ptB.px + px*1.5, ptB.py + py*1.5); ctx.stroke();
          } else if (edge.double) {
            ctx.lineWidth = 1.8 * ptA.scale;
            ctx.beginPath(); ctx.moveTo(ptA.px - px, ptA.py - py); ctx.lineTo(ptB.px - px, ptB.py - py); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(ptA.px + px, ptA.py + py); ctx.lineTo(ptB.px + px, ptB.py + py); ctx.stroke();
          } else if (edge.ionic) {
            ctx.lineWidth = 1.2 * ptA.scale;
            ctx.setLineDash([4, 4]);
            ctx.beginPath(); ctx.moveTo(ptA.px, ptA.py); ctx.lineTo(ptB.px, ptB.py); ctx.stroke();
            ctx.setLineDash([]);
          } else {
            ctx.lineWidth = 2.8 * ptA.scale;
            ctx.beginPath(); ctx.moveTo(ptA.px, ptA.py); ctx.lineTo(ptB.px, ptB.py); ctx.stroke();
          }

          // Covalent Shared Electron Currents Animation
          if (progress === 1.0 && !edge.ionic) {
            const time = Date.now() / 1000;
            const osc = 0.5 + 0.5 * Math.sin(time * 6 + (edge.a * 2.5));
            ctx.fillStyle = theme === "dark" ? "rgba(34, 211, 238, 0.85)" : "rgba(8, 145, 178, 0.90)";

            if (edge.triple) {
              const ex1a = ptA.px - px * 1.5 + dx * osc; const ey1a = ptA.py - py * 1.5 + dy * osc;
              const ex1b = ptA.px - px * 1.5 + dx * (1 - osc); const ey1b = ptA.py - py * 1.5 + dy * (1 - osc);
              const ex2a = ptA.px + dx * osc; const ey2a = ptA.py + dy * osc;
              const ex2b = ptA.px + dx * (1 - osc); const ey2b = ptA.py + dy * (1 - osc);
              const ex3a = ptA.px + px * 1.5 + dx * osc; const ey3a = ptA.py + py * 1.5 + dy * osc;
              const ex3b = ptA.px + px * 1.5 + dx * (1 - osc); const ey3b = ptA.py + py * 1.5 + dy * (1 - osc);

              ctx.beginPath();
              ctx.arc(ex1a, ey1a, 1.2, 0, Math.PI * 2); ctx.arc(ex1b, ey1b, 1.2, 0, Math.PI * 2);
              ctx.arc(ex2a, ey2a, 1.2, 0, Math.PI * 2); ctx.arc(ex2b, ey2b, 1.2, 0, Math.PI * 2);
              ctx.arc(ex3a, ey3a, 1.2, 0, Math.PI * 2); ctx.arc(ex3b, ey3b, 1.2, 0, Math.PI * 2);
              ctx.fill();
            } else if (edge.double) {
              const ex1a = ptA.px - px + dx * osc; const ey1a = ptA.py - py + dy * osc;
              const ex1b = ptA.px - px + dx * (1 - osc); const ey1b = ptA.py - py + dy * (1 - osc);
              const ex2a = ptA.px + px + dx * osc; const ey2a = ptA.py + dy * osc;
              const ex2b = ptA.px + px + dx * (1 - osc); const ey2b = ptA.py + py + dy * (1 - osc);

              ctx.beginPath();
              ctx.arc(ex1a, ey1a, 1.4, 0, Math.PI * 2); ctx.arc(ex1b, ey1b, 1.4, 0, Math.PI * 2);
              ctx.arc(ex2a, ey2a, 1.4, 0, Math.PI * 2); ctx.arc(ex2b, ey2b, 1.4, 0, Math.PI * 2);
              ctx.fill();
            } else {
              const ex1 = ptA.px + dx * osc; const ey1 = ptA.py + dy * osc;
              const ex2 = ptA.px + dx * (1 - osc); const ey2 = ptA.py + dy * (1 - osc);

              ctx.beginPath();
              ctx.arc(ex1, ey1, 1.6, 0, Math.PI * 2); ctx.arc(ex2, ey2, 1.6, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        });

        // Special Ionic Electron Transfer Animation (NaCl Molecule step 2 only)
        if (selectedKey === "NaCl" && activeStep === 1 && activeTab === "molecules") {
          const naAtom = currentAtoms[0];
          const clAtom = currentAtoms[1];
          if (naAtom && clAtom) {
            const ptA = project(naAtom.pos.x, naAtom.pos.y, naAtom.pos.z);
            const ptB = project(clAtom.pos.x, clAtom.pos.y, clAtom.pos.z);
            const clProg = clAtom.progress;

            if (clProg < 1.0) {
              const ex = ptA.px + (ptB.px - ptA.px) * clProg;
              const ey = ptA.py + (ptB.py - ptA.py) * clProg;
              ctx.fillStyle = "#ffffff";
              ctx.strokeStyle = "#a855f7";
              ctx.lineWidth = 1.0;
              ctx.beginPath();
              ctx.arc(ex, ey, 2.5 * ptA.scale, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
            }
          }
        }

        // Render Atoms sorted by depth
        const spheresToRender: {
          px: number;
          py: number;
          pz: number;
          radius: number;
          color: string;
          symbol: string;
          scale: number;
          isAssembling: boolean;
          progress: number;
          idx: number;
        }[] = [];

        currentAtoms.forEach((atom: any, idx: number) => {
          if (!atom) return;
          const pt = project(atom.pos.x, atom.pos.y, atom.pos.z);
          // Scale base atom size slightly larger
          spheresToRender.push({
            px: pt.px,
            py: pt.py,
            pz: pt.pz,
            radius: atom.size * pt.scale * 1.05,
            color: atom.color,
            symbol: atom.symbol,
            scale: pt.scale,
            isAssembling: atom.isAssembling,
            progress: atom.progress,
            idx,
          });

          // Trigger particle sparks when arrival is complete
          const prog = flyInProgressRef.current[idx];
          if (atom.isAssembling && prog > 0.94 && Math.random() < 0.12) {
            rippleWavesRef.current.push({
              x: pt.px,
              y: pt.py,
              size: 2,
              max: 20,
              opacity: 0.8,
            });
          }
        });

        // Render Target Ghost Outlines (Molecules only)
        if (!isLatticeMode) {
          targetItemAtomsLoop:
          targetMol.atoms.forEach((atomDef: any, idx: number) => {
            if (assembledAtomIndices.has(idx) && !(currentStepAtoms.includes(idx) && (flyInProgressRef.current[idx] ?? 0) < 1.0)) {
              return;
            }

            const ptTarget = project(atomDef.pos.x, atomDef.pos.y, atomDef.pos.z);
            ctx.strokeStyle = theme === "dark" ? "rgba(148, 163, 184, 0.15)" : "rgba(71, 85, 105, 0.25)";
            ctx.lineWidth = 1.0;
            ctx.setLineDash([2, 3]);
            ctx.beginPath();
            ctx.arc(ptTarget.px, ptTarget.py, atomDef.size * ptTarget.scale, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            
            ctx.fillStyle = theme === "dark" ? "rgba(148, 163, 184, 0.08)" : "rgba(71, 85, 105, 0.15)";
            ctx.font = `bold ${Math.max(8, Math.floor(9 * ptTarget.scale))}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(atomDef.symbol, ptTarget.px, ptTarget.py);
          });
        }

        // Sort spheres by depth
        spheresToRender.sort((a, b) => b.pz - a.pz);

        spheresToRender.forEach((sph) => {
          ctx.beginPath();
          ctx.arc(sph.px, sph.py, sph.radius, 0, Math.PI * 2);

          // Spherical radial gradient shading
          const highlightColor = mixWithWhite(sph.color, 0.65);
          const midHighlight = mixWithWhite(sph.color, 0.18);
          const darkColor = darkenColor(sph.color, theme === "dark" ? 0.42 : 0.25);
          const radGrad = ctx.createRadialGradient(
            sph.px - sph.radius * 0.28,
            sph.py - sph.radius * 0.28,
            sph.radius * 0.05,
            sph.px,
            sph.py,
            sph.radius
          );

          radGrad.addColorStop(0, highlightColor);
          radGrad.addColorStop(0.12, midHighlight);
          radGrad.addColorStop(0.3, sph.color);
          radGrad.addColorStop(1, darkColor);

          ctx.fillStyle = radGrad;
          ctx.fill();

          // Highlight ring if currently fly-in
          if (sph.isAssembling) {
            ctx.strokeStyle = `rgba(34, 211, 238, ${1.0 - sph.progress})`;
            ctx.lineWidth = 1.8;
            ctx.stroke();
          }

          // Symbol label
          ctx.fillStyle = sph.color === "#e2e8f0" ? "#475569" : "#ffffff";
          ctx.font = `bold ${Math.max(9, Math.floor(10.5 * sph.scale))}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(sph.symbol, sph.px, sph.py + 0.5);

          // NaCl/Lattice ion charge labels overlay
          const isNaClLattice = selectedKey === "NaCl" && isLatticeMode;
          const isNaClMolecule = selectedKey === "NaCl" && activeTab === "molecules";
          if ((isNaClLattice || isNaClMolecule) && sph.progress === 1.0) {
            // Alternating charge based on symbol
            const isNa = sph.symbol === "Na";
            ctx.fillStyle = isNa ? "#a855f7" : "#10b981";
            ctx.font = `bold ${Math.max(8, Math.floor(9 * sph.scale))}px sans-serif`;
            ctx.fillText(isNa ? "+" : "−", sph.px + sph.radius * 0.6, sph.py - sph.radius * 0.6);
          }
        });
      }

      animId = requestAnimationFrame(render);
    };

    render();

    // Mouse drag controls
    const handleMouseDown = (e: MouseEvent) => {
      rotationRef.current.isDragging = true;
      rotationRef.current.startX = e.clientX;
      rotationRef.current.startY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!rotationRef.current.isDragging) return;
      const dx = e.clientX - rotationRef.current.startX;
      const dy = e.clientY - rotationRef.current.startY;
      rotationRef.current.rotY += dx * 0.5;
      rotationRef.current.rotX += dy * 0.5;
      rotationRef.current.startX = e.clientX;
      rotationRef.current.startY = e.clientY;
    };

    const handleMouseUp = () => {
      rotationRef.current.isDragging = false;
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isOpen, activeMol, activeStep, selectedKey, theme, activeTab, activeOrb, activeLat]);

  if (!isOpen || !mounted) return null;

  // Render modal content into document.body React Portal
  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md"
      style={{
        background: theme === "dark" ? "rgba(2, 6, 23, 0.82)" : "rgba(71, 85, 105, 0.40)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
        className="relative flex flex-col md:flex-row w-full max-w-4xl border rounded-3xl overflow-hidden shadow-2xl mx-4"
        style={{ 
          height: "min(600px, 90vh)",
          background: theme === "dark" ? "#0f172a" : "#f8fafc",
          borderColor: theme === "dark" ? "rgba(51,65,85,0.6)" : "rgba(203,213,225,0.8)",
          color: theme === "dark" ? "#f8fafc" : "#0f172a",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-600 opacity-90" />

        {/* ── Left Side: Interactive 3D Canvas ── */}
        <div 
          className="flex-1 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r"
          style={{
            background: theme === "dark" ? "rgba(15,23,42,0.4)" : "#ffffff",
            borderColor: theme === "dark" ? "#1e293b" : "#e2e8f0",
          }}
        >
          <div className="absolute top-6 left-6 flex items-center gap-2 z-10">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] font-black text-cyan-400 tracking-widest uppercase">3D STRUCTURE SCANNER</span>
          </div>

          <div className="absolute top-6 right-6 flex items-center gap-2 z-10">


            {/* Audio Toggle Button */}
            <button
              onClick={() => setMuted((m) => !m)}
              className="p-1.5 rounded-lg border transition-colors cursor-pointer"
              title={muted ? "Unmute Synthesizer" : "Mute Synthesizer"}
              style={{
                borderColor: theme === "dark" ? "rgba(148,163,184,0.12)" : "rgba(148,163,184,0.25)",
                background: theme === "dark" ? "rgba(30,41,59,0.3)" : "rgba(241,245,249,0.9)",
                color: theme === "dark" ? "#94a3b8" : "#475569",
              }}
            >
              {muted ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07"/>
                </svg>
              )}
            </button>
          </div>

          {/* Canvas Wrapper */}
          <div className="w-full h-full flex items-center justify-center overflow-hidden relative min-h-[260px] md:min-h-0" style={{ flex: "1 1 auto" }}>
            <canvas ref={canvasRef} style={{ display: "block" }} />
          </div>

          {/* Interactive hints */}
          <div className="absolute bottom-5 text-center px-4">
            <p className="text-[10px] text-slate-500 font-medium tracking-wide">
              {isPlaying ? "Simulating bonds step-by-step..." : "Drag to rotate in 3D space"}
            </p>
          </div>
        </div>

        {/* ── Right Side: Controls and Details ── */}
        <div 
          className="w-full md:w-[350px] flex flex-col justify-between p-6 md:p-8 overflow-y-auto"
          style={{
            background: theme === "dark" ? "#0f172a" : "#f8fafc",
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-black flex items-center gap-2.5" style={{ color: theme === "dark" ? "#f8fafc" : "#0f172a" }}>
                  3D Visualizer
                </h3>
                <p className="text-xs text-slate-400">Chemical structures & orbitals</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all font-semibold cursor-pointer"
                style={{
                  background: theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)",
                  color: theme === "dark" ? "#94a3b8" : "#475569",
                }}
                aria-label="Close molecular builder"
              >
                ✕
              </button>
            </div>

            {/* Tab selection */}
            <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: theme === "dark" ? "rgba(2, 6, 23, 0.4)" : "rgba(15, 23, 42, 0.06)" }}>
              {(["molecules", "orbitals", "lattices"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-1 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                  style={{
                    background: activeTab === tab ? "rgba(34,211,238,0.12)" : "transparent",
                    color: activeTab === tab ? "#22d3ee" : "#64748b",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Item select grid based on tab */}
            <div className="flex flex-col gap-1.5 mb-5">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Select Template</span>
              
              {activeTab === "molecules" && (
                <div className="grid grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {Object.entries(MOLECULES).map(([key, mol]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedKey(key);
                        setActiveStep(0);
                        setIsPlaying(false);
                      }}
                      className="px-2 py-1.5 text-left rounded-xl border transition-all text-xs font-semibold cursor-pointer"
                      style={{
                        background: selectedKey === key 
                          ? (theme === "dark" ? "rgba(34,211,238,0.08)" : "rgba(34,211,238,0.12)") 
                          : (theme === "dark" ? "rgba(30,41,59,0.30)" : "rgba(241,245,249,0.90)"),
                        borderColor: selectedKey === key ? "rgba(34,211,238,0.45)" : "rgba(148,163,184,0.12)",
                        color: selectedKey === key ? "#22d3ee" : "#94a3b8",
                      }}
                    >
                      <div className="font-bold truncate">{mol.name}</div>
                      <div className="text-[9px] opacity-75 font-mono mt-0.5">{mol.formula}</div>
                    </button>
                  ))}
                </div>
              )}

              {activeTab === "orbitals" && (
                <div className="grid grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {Object.entries(ORBITALS).map(([key, orb]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedKey(key);
                        setIsPlaying(false);
                      }}
                      className="px-2 py-1.5 text-left rounded-xl border transition-all text-xs font-semibold cursor-pointer"
                      style={{
                        background: selectedKey === key 
                          ? (theme === "dark" ? "rgba(34,211,238,0.08)" : "rgba(34,211,238,0.12)") 
                          : (theme === "dark" ? "rgba(30,41,59,0.30)" : "rgba(241,245,249,0.90)"),
                        borderColor: selectedKey === key ? "rgba(34,211,238,0.45)" : "rgba(148,163,184,0.12)",
                        color: selectedKey === key ? "#22d3ee" : "#94a3b8",
                      }}
                    >
                      <div className="font-bold truncate">{orb.name.split(" ")[0]}</div>
                      <div className="text-[9px] opacity-75 font-mono mt-0.5">{orb.formula}</div>
                    </button>
                  ))}
                </div>
              )}

              {activeTab === "lattices" && (
                <div className="grid grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {Object.entries(LATTICES).map(([key, lat]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedKey(key);
                        setIsPlaying(false);
                      }}
                      className="px-2 py-1.5 text-left rounded-xl border transition-all text-xs font-semibold cursor-pointer"
                      style={{
                        background: selectedKey === key 
                          ? (theme === "dark" ? "rgba(34,211,238,0.08)" : "rgba(34,211,238,0.12)") 
                          : (theme === "dark" ? "rgba(30,41,59,0.30)" : "rgba(241,245,249,0.90)"),
                        borderColor: selectedKey === key ? "rgba(34,211,238,0.45)" : "rgba(148,163,184,0.12)",
                        color: selectedKey === key ? "#22d3ee" : "#94a3b8",
                      }}
                    >
                      <div className="font-bold truncate">{lat.name.split(" ")[0]}</div>
                      <div className="text-[9px] opacity-75 font-mono mt-0.5">{lat.formula}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Compound Details */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + "_" + selectedKey}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="p-3.5 rounded-2xl bg-slate-950/20 border border-slate-800/60 mb-4"
              >
                {activeTab === "molecules" && (
                  <>
                    <div className="flex items-baseline gap-2 mb-1.5">
                      <span className="text-sm font-black truncate">{activeMol.name}</span>
                      <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-1.5 py-0.5 rounded-full">
                        {activeMol.formula}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{activeMol.description}</p>
                    
                    <div className="border-t border-slate-800 pt-2.5 mt-2.5">
                      <span className="text-[9px] font-black text-cyan-400 tracking-wider uppercase block mb-1">
                        Current Assembly Step ({activeStep + 1} / {activeMol.steps.length})
                      </span>
                      <p className="text-xs font-bold leading-relaxed min-h-[36px]">
                        {activeMol.steps[activeStep]?.description || "Loading..."}
                      </p>
                    </div>
                  </>
                )}

                {activeTab === "orbitals" && (
                  <>
                    <div className="flex items-baseline gap-2 mb-1.5">
                      <span className="text-sm font-black truncate">{activeOrb.name}</span>
                      <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-1.5 py-0.5 rounded-full">
                        {activeOrb.formula}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-1">{activeOrb.description}</p>
                  </>
                )}

                {activeTab === "lattices" && (
                  <>
                    <div className="flex items-baseline gap-2 mb-1.5">
                      <span className="text-sm font-black truncate">{activeLat.name}</span>
                      <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-1.5 py-0.5 rounded-full">
                        {activeLat.formula}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-1">{activeLat.description}</p>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom controls (Molecules Tab only) */}
          {activeTab === "molecules" ? (
            <div className="flex flex-col gap-3.5 border-t border-slate-800 pt-5">
              <div className="flex items-center justify-between gap-1.5">
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    if (activeStep > 0) setActiveStep((s) => s - 1);
                  }}
                  disabled={activeStep === 0}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 disabled:opacity-30 border border-slate-700/60 active:scale-95 disabled:scale-100 transition-all cursor-pointer"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setActiveStep(0);
                  }}
                  className="p-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700/60 active:scale-95 transition-all cursor-pointer"
                  title="Restart Assembly"
                >
                  ⟲
                </button>
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    if (activeStep < activeMol.steps.length - 1) setActiveStep((s) => s + 1);
                  }}
                  disabled={activeStep === activeMol.steps.length - 1}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 disabled:opacity-30 border border-slate-700/60 active:scale-95 disabled:scale-100 transition-all cursor-pointer"
                >
                  Next →
                </button>
              </div>

              <button
                onClick={() => {
                  if (activeStep === activeMol.steps.length - 1) {
                    setActiveStep(0);
                  }
                  setIsPlaying((p) => !p);
                }}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all active:scale-95 shadow-lg shadow-cyan-500/15 cursor-pointer"
              >
                {isPlaying ? "Pause Simulation" : activeStep === activeMol.steps.length - 1 ? "Replay Simulation" : "Auto-Play Simulation"}
              </button>
            </div>
          ) : (
            <div className="border-t border-slate-800 pt-5 text-center">
              <p className="text-[10px] text-slate-500 leading-relaxed font-semibold uppercase tracking-wider">
                Drag on the 3D model to rotate and inspect structure
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

function darkenColor(colorStr: string, percent: number): string {
  if (colorStr.startsWith("#")) {
    let color = colorStr.replace("#", "");
    if (color.length === 3) {
      color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
    }
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    const rDark = Math.max(0, Math.floor(r * (1 - percent)));
    const gDark = Math.max(0, Math.floor(g * (1 - percent)));
    const bDark = Math.max(0, Math.floor(b * (1 - percent)));
    const rHex = rDark.toString(16).padStart(2, "0");
    const gHex = gDark.toString(16).padStart(2, "0");
    const bHex = bDark.toString(16).padStart(2, "0");
    return `#${rHex}${gHex}${bHex}`;
  } else if (colorStr.startsWith("rgb")) {
    const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (match) {
      const r = parseInt(match[1], 10);
      const g = parseInt(match[2], 10);
      const b = parseInt(match[3], 10);
      const a = match[4] !== undefined ? parseFloat(match[4]) : 1;
      const rDark = Math.max(0, Math.floor(r * (1 - percent)));
      const gDark = Math.max(0, Math.floor(g * (1 - percent)));
      const bDark = Math.max(0, Math.floor(b * (1 - percent)));
      return `rgba(${rDark}, ${gDark}, ${bDark}, ${a})`;
    }
  }
  return colorStr;
}

function mixWithWhite(colorStr: string, ratio: number): string {
  if (colorStr.startsWith("#")) {
    let color = colorStr.replace("#", "");
    if (color.length === 3) {
      color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
    }
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    const rLight = Math.min(255, Math.floor(r + (255 - r) * ratio));
    const gLight = Math.min(255, Math.floor(g + (255 - g) * ratio));
    const bLight = Math.min(255, Math.floor(b + (255 - b) * ratio));
    const rHex = rLight.toString(16).padStart(2, "0");
    const gHex = gLight.toString(16).padStart(2, "0");
    const bHex = bLight.toString(16).padStart(2, "0");
    return `#${rHex}${gHex}${bHex}`;
  } else if (colorStr.startsWith("rgb")) {
    const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (match) {
      const r = parseInt(match[1], 10);
      const g = parseInt(match[2], 10);
      const b = parseInt(match[3], 10);
      const a = match[4] !== undefined ? parseFloat(match[4]) : 1;
      const rLight = Math.min(255, Math.floor(r + (255 - r) * ratio));
      const gLight = Math.min(255, Math.floor(g + (255 - g) * ratio));
      const bLight = Math.min(255, Math.floor(b + (255 - b) * ratio));
      return `rgba(${rLight}, ${gLight}, ${bLight}, ${a})`;
    }
  }
  return colorStr;
}
