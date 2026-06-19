"use client";

import { useState, useMemo, useEffect, startTransition } from "react";
import LabPageShell from "@/components/lab/LabPageShell";
import StatusBar from "@/components/lab/StatusBar";
import ObservationPanel from "@/components/lab/ObservationPanel";
import MolecularViewerWorkspace, { MoleculeData } from "./MolecularViewerWorkspace";
import { MOLECULES_DB, ExtendedMoleculeData } from "./molecules-data";

export default function MolecularViewerPage() {
  const [activeTab, setActiveTab] = useState<
    "vibrations" | "vsepr" | "conformations" | "orbitals" | "symmetry" | "reactions" | "solidstate" | "nanostructures" | "sandbox"
  >("vibrations");

  const [selectedId, setSelectedId] = useState<string>("water");
  const [activeModeIndex, setActiveModeIndex] = useState<number>(0);
  const [vibrationActive, setVibrationActive] = useState<boolean>(true);
  const [vibrationScale, setVibrationScale] = useState<number>(1.0);
  const [vibrationSpeed, setVibrationSpeed] = useState<number>(1.0);
  
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [showAxes, setShowAxes] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [conformationState, setConformationState] = useState<string>("staggered");
  const [showSymmetry, setShowSymmetry] = useState<boolean>(true);
  const [showLatticeOutline, setShowLatticeOutline] = useState<boolean>(true);
  const [reactionCoord, setReactionCoord] = useState<number>(0.0);

  // ── Sandbox Builder State ──
  const [sandboxCentral, setSandboxCentral] = useState<string>("C");
  const [sandboxLigands, setSandboxLigands] = useState<number>(4);
  const [sandboxLonePairs, setSandboxLonePairs] = useState<number>(0);
  const [sandboxTerm, setSandboxTerm] = useState<string>("H");

  // Sync default selectors when category tab changes
  useEffect(() => {
    if (activeTab === "vibrations") {
      setSelectedId("water");
      setActiveModeIndex(0);
      setVibrationActive(true);
    } else if (activeTab === "vsepr") {
      setSelectedId("bf3");
    } else if (activeTab === "conformations") {
      setSelectedId("ethane");
      setConformationState("staggered");
      setAutoRotate(false);
    } else if (activeTab === "orbitals") {
      setSelectedId("2pz");
    } else if (activeTab === "symmetry") {
      setSelectedId("sym_water");
      setShowSymmetry(true);
    } else if (activeTab === "reactions") {
      setSelectedId("rxn_sn2");
      setReactionCoord(0.0);
      setVibrationActive(false);
      setAutoRotate(false);
    } else if (activeTab === "solidstate") {
      setSelectedId("solid_bcc");
      setShowLatticeOutline(true);
    } else if (activeTab === "nanostructures") {
      setSelectedId("nano_c60");
    }
  }, [activeTab]);

  // Adjust default term atom and lone pairs depending on sandbox central atom selection
  useEffect(() => {
    if (sandboxCentral === "C" || sandboxCentral === "N" || sandboxCentral === "O") {
      setSandboxTerm("H");
    } else if (sandboxCentral === "Be" || sandboxCentral === "P") {
      setSandboxTerm("Cl");
    } else {
      setSandboxTerm("F");
    }

    // Default lone pairs for common elements
    if (sandboxCentral === "C") { setSandboxLigands(4); setSandboxLonePairs(0); }
    else if (sandboxCentral === "N") { setSandboxLigands(3); setSandboxLonePairs(1); }
    else if (sandboxCentral === "O") { setSandboxLigands(2); setSandboxLonePairs(2); }
    else if (sandboxCentral === "S") { setSandboxLigands(6); setSandboxLonePairs(0); }
    else if (sandboxCentral === "Xe") { setSandboxLigands(4); setSandboxLonePairs(2); }
    else if (sandboxCentral === "B") { setSandboxLigands(3); setSandboxLonePairs(0); }
    else if (sandboxCentral === "Be") { setSandboxLigands(2); setSandboxLonePairs(0); }
    else if (sandboxCentral === "P") { setSandboxLigands(5); setSandboxLonePairs(0); }
    else if (sandboxCentral === "Br") { setSandboxLigands(5); setSandboxLonePairs(1); }
  }, [sandboxCentral]);

  // ── VSEPR Coordinate Generator ──
  const sandboxMolecule = useMemo(() => {
    const n = sandboxLigands;
    const m = sandboxLonePairs;
    const SN = n + m;

    if (SN > 6 || SN < 2) return null;

    // Standard direction templates
    let directions: [number, number, number][] = [];
    let lonePairIndices: number[] = [];

    if (SN === 2) {
      directions = [[0, 0, 1.45], [0, 0, -1.45]];
      // m is typically 0
    } else if (SN === 3) {
      directions = [
        [0, 1.45, 0],
        [1.255, -0.725, 0],
        [-1.255, -0.725, 0]
      ];
      if (m === 1) lonePairIndices = [0];
      else if (m === 2) lonePairIndices = [0, 1];
    } else if (SN === 4) {
      directions = [
        [0, 0, 1.45],
        [1.368, 0, -0.483],
        [-0.684, 1.185, -0.483],
        [-0.684, -1.185, -0.483]
      ];
      if (m === 1) lonePairIndices = [0];
      else if (m === 2) lonePairIndices = [0, 1];
      else if (m === 3) lonePairIndices = [0, 1, 2];
    } else if (SN === 5) {
      directions = [
        [0, 0, 1.55],   // Axial 1
        [0, 0, -1.55],  // Axial 2
        [0, 1.45, 0],   // Equatorial 1
        [1.255, -0.725, 0], // Equatorial 2
        [-1.255, -0.725, 0] // Equatorial 3
      ];
      // Equatorial positions first for lone pairs to minimize axial repulsion
      if (m === 1) lonePairIndices = [2];
      else if (m === 2) lonePairIndices = [3, 4];
      else if (m === 3) lonePairIndices = [2, 3, 4];
    } else if (SN === 6) {
      directions = [
        [0, 0, 1.55],   // Axial 1
        [0, 0, -1.55],  // Axial 2
        [1.55, 0, 0],   // Equatorial 1
        [-1.55, 0, 0],  // Equatorial 2
        [0, 1.55, 0],   // Equatorial 3
        [0, -1.55, 0]   // Equatorial 4
      ];
      if (m === 1) lonePairIndices = [1];
      else if (m === 2) lonePairIndices = [0, 1]; // Trans axial arrangement
      else if (m === 3) lonePairIndices = [0, 1, 2];
    }

    const atoms: { element: string; pos: [number, number, number]; name?: string }[] = [];
    const bonds: [number, number][] = [];
    const orbitalLobes: { type: "positive" | "negative" | "lonepair"; pos: [number, number, number]; scale: [number, number, number] }[] = [];

    // Central Atom
    atoms.push({ element: sandboxCentral, pos: [0, 0, 0], name: sandboxCentral });

    let ligandCount = 0;
    directions.forEach((dir, idx) => {
      const isLonePair = lonePairIndices.includes(idx);
      if (isLonePair) {
        // Render as lone pair orbital lobe
        orbitalLobes.push({
          type: "lonepair",
          pos: [dir[0] * 0.78, dir[1] * 0.78, dir[2] * 0.78],
          scale: [0.65, 0.65, 0.95]
        });
      } else {
        // Render as standard ligand atom
        ligandCount++;
        const atomIdx = atoms.length;
        atoms.push({
          element: sandboxTerm,
          pos: dir,
          name: `${sandboxTerm}${ligandCount}`
        });
        bonds.push([0, atomIdx]);
      }
    });

    // Determine VSEPR Geometry Name
    let geometryName = "Unknown";
    let desc = "";
    let hybrid = "";
    let angles = "";

    if (SN === 2) {
      geometryName = "Linear";
      hybrid = "sp";
      angles = "180°";
      desc = "Two bonding pairs pointing in opposite directions to minimize steric repulsion.";
    } else if (SN === 3) {
      hybrid = "sp²";
      if (m === 0) { geometryName = "Trigonal Planar"; angles = "120°"; desc = "Three symmetric bonding pairs repelling equally in a single plane."; }
      else { geometryName = "Bent"; angles = "< 120°"; desc = "Lone pair repulsion compresses the adjacent bond angles below the ideal 120°."; }
    } else if (SN === 4) {
      hybrid = "sp³";
      if (m === 0) { geometryName = "Tetrahedral"; angles = "109.5°"; desc = "Four symmetric bonding pairs arranged at the vertices of a regular tetrahedron."; }
      else if (m === 1) { geometryName = "Trigonal Pyramidal"; angles = "107°"; desc = "One lone pair compresses the three bonding pairs downward, creating a pyramid."; }
      else { geometryName = "Bent"; angles = "104.5°"; desc = "Two lone pairs exert strong electrostatic repulsion, compressing the bond angle significantly."; }
    } else if (SN === 5) {
      hybrid = "sp³d";
      if (m === 0) { geometryName = "Trigonal Bipyramidal"; angles = "90° (axial), 120° (equatorial)"; desc = "Three equatorial and two axial ligand bonding positions."; }
      else if (m === 1) { geometryName = "Seesaw"; angles = "< 90°, < 120°"; desc = "A single equatorial lone pair compresses both axial and equatorial bond angles."; }
      else if (m === 2) { geometryName = "T-shaped"; angles = "< 90°"; desc = "Two equatorial lone pairs compress the remaining three bonds into a T shape."; }
      else { geometryName = "Linear"; angles = "180°"; desc = "Three equatorial lone pairs repel each other at 120° angles, leaving axial bonds linear."; }
    } else if (SN === 6) {
      hybrid = "sp³d²";
      if (m === 0) { geometryName = "Octahedral"; angles = "90°, 180°"; desc = "Six bonding pairs arranged symmetrically at the vertices of a regular octahedron."; }
      else if (m === 1) { geometryName = "Square Pyramidal"; angles = "< 90°"; desc = "One axial lone pair compresses the equatorial bonds slightly upward."; }
      else { geometryName = "Square Planar"; angles = "90°, 180°"; desc = "Two lone pairs occupy opposing axial positions, leaving 4 bonds in a planar square."; }
    }

    return {
      id: "sandbox_custom",
      name: `${sandboxCentral}${sandboxTerm}${n === 1 ? "" : n}${m > 0 ? `E${m}` : ""}`,
      formula: `AX${n}${m > 0 ? `E${m}` : ""}`,
      category: "sandbox" as const,
      description: `${desc} (Steric Number: ${SN})`,
      symmetryGroup: hybrid.toUpperCase(),
      atoms,
      bonds,
      orbitalLobes,
      hybridization: hybrid,
      idealAngles: angles
    };
  }, [sandboxCentral, sandboxLigands, sandboxLonePairs, sandboxTerm]);

  // ── Reaction Coordinate Linear Interpolator ──
  const reactionMolecule = useMemo(() => {
    const rxn = MOLECULES_DB.rxn_sn2;
    if (!rxn.reactionSteps) return rxn;

    const t = reactionCoord;
    // Find matching bracket steps
    const steps = rxn.reactionSteps;
    let stepA = steps[0];
    let stepB = steps[steps.length - 1];

    for (let i = 0; i < steps.length - 1; i++) {
      if (steps[i].t <= t && steps[i + 1].t >= t) {
        stepA = steps[i];
        stepB = steps[i + 1];
        break;
      }
    }

    const tDiff = stepB.t - stepA.t;
    const f = tDiff === 0 ? 0 : (t - stepA.t) / tDiff;

    // Interpolate positions
    const interpAtoms = stepA.atoms.map((atomA, idx) => {
      const atomB = stepB.atoms[idx];
      const pos: [number, number, number] = [
        atomA.pos[0] + f * (atomB.pos[0] - atomA.pos[0]),
        atomA.pos[1] + f * (atomB.pos[1] - atomA.pos[1]),
        atomA.pos[2] + f * (atomB.pos[2] - atomA.pos[2])
      ];
      return {
        ...atomA,
        pos
      };
    });

    // Calculate dynamic bonds based on interpolated atom distances
    const interpBonds: [number, number][] = [];
    for (let i = 0; i < interpAtoms.length; i++) {
      for (let j = i + 1; j < interpAtoms.length; j++) {
        const el1 = interpAtoms[i].element;
        const el2 = interpAtoms[j].element;
        const dx = interpAtoms[i].pos[0] - interpAtoms[j].pos[0];
        const dy = interpAtoms[i].pos[1] - interpAtoms[j].pos[1];
        const dz = interpAtoms[i].pos[2] - interpAtoms[j].pos[2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        let limit = 1.6;
        if ((el1 === "C" && el2 === "F") || (el1 === "F" && el2 === "C")) {
          limit = 2.05; // C-Br bond stretch threshold
        }
        if (dist < limit) {
          interpBonds.push([i, j]);
        }
      }
    }

    return {
      ...rxn,
      atoms: interpAtoms,
      bonds: interpBonds
    };
  }, [reactionCoord]);

  // Load correct molecule object
  const activeMolecule = useMemo(() => {
    if (activeTab === "sandbox") {
      return sandboxMolecule || MOLECULES_DB.water;
    }
    if (activeTab === "reactions" && selectedId === "rxn_sn2") {
      return reactionMolecule;
    }
    return MOLECULES_DB[selectedId] || MOLECULES_DB.water;
  }, [activeTab, selectedId, sandboxMolecule, reactionMolecule]);

  // ── Layout rendering ──
  const statusBar = (
    <StatusBar
      status="ready"
      error={null}
      metrics={[
        { label: "Active System", value: activeMolecule.name },
        { label: "Formula / Mode", value: activeMolecule.formula },
        { label: "Symmetry Group", value: activeMolecule.symmetryGroup }
      ]}
    />
  );

  const workspace = (
    <div className="w-full h-full relative bg-slate-950 flex flex-col items-stretch overflow-hidden rounded-xl border border-slate-800/80 shadow-2xl">
      <div className="flex-1 min-h-0 relative">
        <MolecularViewerWorkspace
          molecule={activeMolecule}
          activeModeIndex={activeModeIndex}
          vibrationActive={vibrationActive}
          vibrationScale={vibrationScale}
          vibrationSpeed={vibrationSpeed}
          showGrid={showGrid}
          showAxes={showAxes}
          autoRotate={autoRotate}
          conformationState={conformationState}
          showSymmetry={showSymmetry}
          showLatticeOutline={showLatticeOutline}
        />
      </div>

      {/* Visual Controls Overlay HUD */}
      <div className="p-3 bg-slate-900/95 border-t border-slate-800/60 flex items-center justify-between gap-3 text-xs z-10 font-mono">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-2.5 py-1 rounded border text-[10px] uppercase font-bold tracking-wider transition-all duration-200 ${
              autoRotate
                ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40"
                : "bg-slate-800/50 text-slate-400 border-slate-700/60 hover:bg-slate-800"
            }`}
          >
            Auto Rotate: {autoRotate ? "ON" : "OFF"}
          </button>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2.5 py-1 rounded border text-[10px] uppercase font-bold tracking-wider transition-all duration-200 ${
              showGrid
                ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40"
                : "bg-slate-800/50 text-slate-400 border-slate-700/60 hover:bg-slate-800"
            }`}
          >
            Grid: {showGrid ? "SHOWN" : "HIDDEN"}
          </button>
          <button
            onClick={() => setShowAxes(!showAxes)}
            className={`px-2.5 py-1 rounded border text-[10px] uppercase font-bold tracking-wider transition-all duration-200 ${
              showAxes
                ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40"
                : "bg-slate-800/50 text-slate-400 border-slate-700/60 hover:bg-slate-800"
            }`}
          >
            Axes: {showAxes ? "SHOWN" : "HIDDEN"}
          </button>
        </div>
        
        <div className="text-[10px] text-slate-500 tracking-wider">
          POINT GROUP: <span className="text-cyan-400 font-bold">{activeMolecule.symmetryGroup}</span>
        </div>
      </div>
    </div>
  );

  // ── Render Category Specific Controls ──
  const controls = (
    <div className="space-y-5">
      {/* Category Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900/60 border border-slate-800/40 rounded-lg">
        {[
          { id: "vibrations", label: "Spectroscopy" },
          { id: "vsepr", label: "VSEPR Shapes" },
          { id: "conformations", label: "Conformers" },
          { id: "orbitals", label: "Orbitals" },
          { id: "symmetry", label: "Symmetry" },
          { id: "reactions", label: "Reactions" },
          { id: "solidstate", label: "Lattices" },
          { id: "nanostructures", label: "Nanotech" },
          { id: "sandbox", label: "Sandbox" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => startTransition(() => setActiveTab(tab.id as any))}
            className={`py-1.5 rounded text-[10px] font-bold tracking-wider uppercase transition-all duration-150 ${
              activeTab === tab.id
                ? "bg-cyan-500/20 text-cyan-300 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. Vibrations Tab */}
      {activeTab === "vibrations" && (
        <div className="space-y-4">
          <div className="lab-ctrl-section">
            <h4 className="lab-ctrl-section-hdr-title mb-2.5">Select Molecule</h4>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "water", name: "Water" },
                { id: "co2", name: "Carbon Dioxide" },
                { id: "formaldehyde", name: "Formaldehyde" }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setSelectedId(m.id); setActiveModeIndex(0); }}
                  className={`py-2 rounded border text-xs font-semibold transition-all duration-200 ${
                    selectedId === m.id
                      ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/40"
                      : "bg-slate-900/40 text-slate-400 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80"
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Wavenumber IR Spectrograph HUD */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 shadow-lg relative overflow-hidden">
            <h4 className="text-[10px] font-black tracking-widest text-cyan-400/80 uppercase mb-3">
              IR Absorption Spectrograph HUD
            </h4>
            
            {/* SVG line graph representing simulated peaks */}
            <div className="h-28 w-full bg-slate-900/30 border border-slate-900/80 rounded relative flex items-stretch">
              <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                {/* Horizontal Baseline Transmittance */}
                <line x1="0" y1="20" x2="300" y2="20" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
                
                {/* Grid vertical lines */}
                {[50, 100, 150, 200, 250].map((x, idx) => (
                  <line key={idx} x1={x} y1="0" x2={x} y2="100" stroke="#0f172a" strokeWidth="1" />
                ))}

                {/* Absorbance Spectrum Curve */}
                <path
                  d={
                    selectedId === "water"
                      ? "M0,15 L100,15 Q110,15 115,85 Q120,85 130,15 L230,15 Q240,15 245,90 Q250,90 260,15 Q265,15 270,92 Q275,92 285,15 L300,15"
                      : selectedId === "co2"
                      ? "M0,15 L80,15 Q90,15 95,95 Q100,95 110,15 L210,15 Q220,15 225,92 Q230,92 240,15 L300,15"
                      : "M0,15 L120,15 Q130,15 135,90 Q140,90 150,15 L170,15 Q175,15 180,88 Q185,88 195,15 L220,15 Q225,15 230,92 Q235,92 245,15 L255,15 Q260,15 265,92 Q270,92 280,15 L300,15"
                  }
                  fill="none"
                  stroke="var(--lab-cyan-500)"
                  strokeWidth="2.2"
                />

                {/* Clickable peak dots */}
                {selectedId === "water" && (
                  <>
                    <circle cx="120" cy="85" r="4.5" className="fill-cyan-400 hover:fill-red-500 cursor-pointer transition" onClick={() => setActiveModeIndex(1)} />
                    <circle cx="247" cy="90" r="4.5" className="fill-cyan-400 hover:fill-red-500 cursor-pointer transition" onClick={() => setActiveModeIndex(0)} />
                    <circle cx="272" cy="92" r="4.5" className="fill-cyan-400 hover:fill-red-500 cursor-pointer transition" onClick={() => setActiveModeIndex(2)} />
                  </>
                )}
                {selectedId === "co2" && (
                  <>
                    <circle cx="97" cy="95" r="4.5" className="fill-cyan-400 hover:fill-red-500 cursor-pointer transition" onClick={() => setActiveModeIndex(1)} />
                    <circle cx="227" cy="92" r="4.5" className="fill-cyan-400 hover:fill-red-500 cursor-pointer transition" onClick={() => setActiveModeIndex(2)} />
                  </>
                )}
                {selectedId === "formaldehyde" && (
                  <>
                    <circle cx="137" cy="90" r="4.5" className="fill-cyan-400 hover:fill-red-500 cursor-pointer transition" onClick={() => setActiveModeIndex(2)} />
                    <circle cx="182" cy="88" r="4.5" className="fill-cyan-400 hover:fill-red-500 cursor-pointer transition" onClick={() => setActiveModeIndex(0)} />
                    <circle cx="232" cy="92" r="4.5" className="fill-cyan-400 hover:fill-red-500 cursor-pointer transition" onClick={() => setActiveModeIndex(1)} />
                    <circle cx="267" cy="92" r="4.5" className="fill-cyan-400 hover:fill-red-500 cursor-pointer transition" onClick={() => setActiveModeIndex(3)} />
                  </>
                )}
              </svg>
              
              <div className="absolute bottom-1 left-2 text-[8px] text-slate-500">4000 cm⁻¹</div>
              <div className="absolute bottom-1 right-2 text-[8px] text-slate-500">400 cm⁻¹</div>
            </div>
            <p className="text-[9px] text-slate-400 mt-2 leading-relaxed text-center">
              Click the highlighted peak nodes on the IR curve to toggle and examine their corresponding vibrational normal modes.
            </p>
          </div>

          {/* Normal Modes List */}
          <div className="lab-ctrl-section">
            <h4 className="lab-ctrl-section-hdr-title mb-2.5">Normal Modes of Vibration</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {(activeMolecule as any).modes?.map((mode: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => { setActiveModeIndex(idx); setVibrationActive(true); }}
                  className={`w-full p-2.5 rounded border text-left flex items-start justify-between gap-3 transition-all duration-200 ${
                    activeModeIndex === idx && vibrationActive
                      ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-200"
                      : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold">{mode.name}</div>
                    <div className="text-[10px] text-slate-500 leading-normal">{mode.description}</div>
                  </div>
                  <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-900/20 font-mono">
                    {mode.frequency}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Animation Parameters */}
          <div className="lab-ctrl-section space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Vibration Toggle</span>
              <button
                onClick={() => setVibrationActive(!vibrationActive)}
                className={`px-4 py-1.5 rounded text-xs font-bold transition-all duration-200 ${
                  vibrationActive
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-slate-800 text-slate-500 border border-slate-700"
                }`}
              >
                {vibrationActive ? "Active" : "Paused"}
              </button>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>AMPLITUDE (SCALE)</span>
                <span>{vibrationScale.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.1"
                value={vibrationScale}
                onChange={(e) => setVibrationScale(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>VIBRATIONAL FREQUENCY (SPEED)</span>
                <span>{vibrationSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.1"
                value={vibrationSpeed}
                onChange={(e) => setVibrationSpeed(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. VSEPR Shapes Tab */}
      {activeTab === "vsepr" && (
        <div className="space-y-4">
          <div className="lab-ctrl-section">
            <h4 className="lab-ctrl-section-hdr-title mb-2.5">Select VSEPR Geometry</h4>
            <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
              {[
                { id: "becl2", name: "BeCl₂ (AX₂)", shape: "Linear" },
                { id: "bf3", name: "BF₃ (AX₃)", shape: "Trigonal Planar" },
                { id: "water", name: "H₂O (AX₂E₂)", shape: "Bent" },
                { id: "sf6", name: "SF₆ (AX₆)", shape: "Octahedral" }
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedId(v.id)}
                  className={`p-2.5 rounded border text-left flex flex-col gap-0.5 transition-all duration-200 ${
                    selectedId === v.id
                      ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/40"
                      : "bg-slate-900/40 text-slate-400 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <span className="text-xs font-bold">{v.name}</span>
                  <span className="text-[10px] text-slate-500">{v.shape}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
            <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              Steric Geometry Metadata
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="bg-slate-950/60 p-2 rounded border border-slate-900">
                <span className="block text-slate-500">HYBRIDIZATION</span>
                <span className="text-cyan-400 font-bold text-xs">{(activeMolecule as any).hybridization || "sp³"}</span>
              </div>
              <div className="bg-slate-950/60 p-2 rounded border border-slate-900">
                <span className="block text-slate-500">IDEAL ANGLES</span>
                <span className="text-cyan-400 font-bold text-xs">{(activeMolecule as any).idealAngles || "109.5°"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Conformations Tab */}
      {activeTab === "conformations" && (
        <div className="space-y-4">
          <div className="lab-ctrl-section">
            <h4 className="lab-ctrl-section-hdr-title mb-2.5">Select System</h4>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "ethane", name: "Ethane" },
                { id: "cyclohexane", name: "Cyclohexane" },
                { id: "butane", name: "Butane" }
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedId(c.id);
                    setConformationState(c.id === "ethane" ? "staggered" : c.id === "cyclohexane" ? "chair" : "anti");
                  }}
                  className={`py-2 rounded border text-xs font-semibold transition-all duration-200 ${
                    selectedId === c.id
                      ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/40"
                      : "bg-slate-900/40 text-slate-400 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Conformer Toggle buttons */}
          <div className="lab-ctrl-section">
            <h4 className="lab-ctrl-section-hdr-title mb-2.5">Conformer Toggle</h4>
            <div className="grid grid-cols-2 gap-2">
              {selectedId === "ethane" && (
                <>
                  <button
                    onClick={() => setConformationState("staggered")}
                    className={`py-2 rounded border text-xs font-semibold transition ${
                      conformationState === "staggered"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-slate-900/30 border-slate-800 text-slate-400"
                    }`}
                  >
                    Staggered (Min)
                  </button>
                  <button
                    onClick={() => setConformationState("eclipsed")}
                    className={`py-2 rounded border text-xs font-semibold transition ${
                      conformationState === "eclipsed"
                        ? "bg-red-500/10 text-red-400 border-red-500/30"
                        : "bg-slate-900/30 border-slate-800 text-slate-400"
                    }`}
                  >
                    Eclipsed (Max)
                  </button>
                </>
              )}
              {selectedId === "cyclohexane" && (
                <>
                  <button
                    onClick={() => setConformationState("chair")}
                    className={`py-2 rounded border text-xs font-semibold transition ${
                      conformationState === "chair"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-slate-900/30 border-slate-800 text-slate-400"
                    }`}
                  >
                    Chair (Min)
                  </button>
                  <button
                    onClick={() => setConformationState("boat")}
                    className={`py-2 rounded border text-xs font-semibold transition ${
                      conformationState === "boat"
                        ? "bg-red-500/10 text-red-400 border-red-500/30"
                        : "bg-slate-900/30 border-slate-800 text-slate-400"
                    }`}
                  >
                    Boat (Max)
                  </button>
                </>
              )}
              {selectedId === "butane" && (
                <div className="col-span-2 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setConformationState("anti")}
                    className={`py-2 rounded border text-xs font-semibold transition ${
                      conformationState === "anti"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-slate-900/30 border-slate-800 text-slate-400"
                    }`}
                  >
                    Anti (Global Min)
                  </button>
                  <button
                    onClick={() => setConformationState("gauche")}
                    className={`py-2 rounded border text-xs font-semibold transition ${
                      conformationState === "gauche"
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                        : "bg-slate-900/30 border-slate-800 text-slate-400"
                    }`}
                  >
                    Gauche (Local Min)
                  </button>
                  <button
                    onClick={() => setConformationState("eclipsed")}
                    className={`py-2 rounded border text-xs font-semibold transition ${
                      conformationState === "eclipsed"
                        ? "bg-red-500/10 text-red-400 border-red-500/30"
                        : "bg-slate-900/30 border-slate-800 text-slate-400"
                    }`}
                  >
                    Eclipsed (Max)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Conformational Torsional Energy Diagram */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 shadow-lg relative overflow-hidden">
            <h4 className="text-[10px] font-black tracking-widest text-cyan-400/80 uppercase mb-3">
              Torsional Potential Energy Curve
            </h4>

            {/* SVG line graph representing torsional energy profile */}
            <div className="h-28 w-full bg-slate-900/30 border border-slate-900/80 rounded relative flex items-stretch">
              <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                {/* Grid horizontal markers */}
                <line x1="0" y1="20" x2="300" y2="20" stroke="#0f172a" strokeWidth="1" />
                <line x1="0" y1="50" x2="300" y2="50" stroke="#0f172a" strokeWidth="1" />
                <line x1="0" y1="80" x2="300" y2="80" stroke="#0f172a" strokeWidth="1" />

                {/* Plot the energy curve path depending on molecule selected */}
                <path
                  d={
                    selectedId === "ethane"
                      ? "M0,20 Q25,20 50,85 Q75,85 100,20 Q125,20 150,85 Q175,85 200,20 Q225,20 250,85 Q275,85 300,20"
                      : selectedId === "cyclohexane"
                      ? "M0,80 Q75,80 150,25 Q225,80 300,80"
                      : "M0,20 Q25,20 50,65 Q75,65 100,50 Q125,50 150,85 Q175,85 200,50 Q225,50 250,65 Q275,65 300,20" // Butane curve
                  }
                  fill="none"
                  stroke="var(--lab-cyan-500)"
                  strokeWidth="2.2"
                />

                {/* Highlight current state dot dynamically */}
                {selectedId === "ethane" && (
                  conformationState === "staggered" ? (
                    <circle cx="50" cy="85" r="5" fill="#10b981" />
                  ) : (
                    <circle cx="100" cy="20" r="5" fill="#ef4444" />
                  )
                )}
                {selectedId === "cyclohexane" && (
                  conformationState === "chair" ? (
                    <circle cx="0" cy="80" r="5" fill="#10b981" />
                  ) : (
                    <circle cx="150" cy="25" r="5" fill="#ef4444" />
                  )
                )}
                {selectedId === "butane" && (
                  conformationState === "anti" ? (
                    <circle cx="150" cy="85" r="5" fill="#10b981" />
                  ) : conformationState === "gauche" ? (
                    <circle cx="100" cy="50" r="5" fill="#3b82f6" />
                  ) : (
                    <circle cx="0" cy="20" r="5" fill="#ef4444" />
                  )
                )}
              </svg>
              
              <div className="absolute top-1 left-2 text-[7px] text-slate-500">PE MAX</div>
              <div className="absolute bottom-1 left-2 text-[7px] text-slate-500">PE MIN</div>
            </div>
            <p className="text-[9px] text-slate-400 mt-2 leading-relaxed text-center">
              Current Conformation Strain state: <span className="text-cyan-400 font-bold uppercase">{conformationState}</span>
            </p>
          </div>
        </div>
      )}

      {/* 4. Orbitals Tab */}
      {activeTab === "orbitals" && (
        <div className="space-y-4">
          <div className="lab-ctrl-section">
            <h4 className="lab-ctrl-section-hdr-title mb-2.5">Select Orbital</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "1s", name: "1s (AO)" },
                { id: "2pz", name: "2p_z (AO)" },
                { id: "3dz2", name: "3d_z² (AO)" },
                { id: "3dx2-y2", name: "3d_x²-y² (AO)" },
                { id: "sp3-hybrid", name: "sp³ Hybrid Lobe" }
              ].map((o) => (
                <button
                  key={o.id}
                  onClick={() => setSelectedId(o.id)}
                  className={`py-2 rounded border text-xs font-semibold transition-all duration-200 ${
                    selectedId === o.id
                      ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/40"
                      : "bg-slate-900/40 text-slate-400 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {o.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
            <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              Wavefunction Probability Phase Code
            </h4>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 height-3 rounded bg-red-500 inline-block border border-red-400/35" style={{ height: "12px" }} />
                <span className="text-slate-400 font-medium">Positive Phase (+)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 height-3 rounded bg-blue-500 inline-block border border-blue-400/35" style={{ height: "12px" }} />
                <span className="text-slate-400 font-medium">Negative Phase (-)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Symmetry Tab */}
      {activeTab === "symmetry" && (
        <div className="space-y-4">
          <div className="lab-ctrl-section">
            <h4 className="lab-ctrl-section-hdr-title mb-2.5">Select Molecule</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "sym_water", name: "Water (C₂v)" },
                { id: "sym_nh3", name: "Ammonia (C₃v)" }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className={`py-2 rounded border text-xs font-semibold transition-all duration-200 ${
                    selectedId === s.id
                      ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/40"
                      : "bg-slate-900/40 text-slate-400 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="lab-ctrl-section space-y-3">
            <h4 className="lab-ctrl-section-hdr-title">Symmetry Overlays</h4>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Show Rotation Axes & Mirror Planes</span>
              <button
                onClick={() => setShowSymmetry(!showSymmetry)}
                className={`px-4 py-1.5 rounded text-xs font-bold transition-all duration-200 ${
                  showSymmetry
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-slate-800 text-slate-500 border border-slate-700"
                }`}
              >
                {showSymmetry ? "SHOWN" : "HIDDEN"}
              </button>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
            <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              Symmetry Element Legend
            </h4>
            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-6 h-0.5 bg-cyan-400 border-t border-cyan-300 border-dashed" />
                <span>Rotation Axes (C_n dashed line)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-3 bg-emerald-500/25 border border-emerald-400/40 rounded" />
                <span>Mirror planes of symmetry (σ_v glass panels)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Organic Reactions Tab */}
      {activeTab === "reactions" && (
        <div className="space-y-4">
          <div className="lab-ctrl-section">
            <h4 className="lab-ctrl-section-hdr-title mb-2.5">Select Reaction Mechanism</h4>
            <button
              className="w-full p-2.5 rounded border text-left flex flex-col gap-0.5 bg-cyan-500/10 text-cyan-300 border-cyan-500/40"
            >
              <span className="text-xs font-bold">SN2 Backside Attack</span>
              <span className="text-[10px] text-slate-500">CH₃Br + OH⁻ → CH₃OH + Br⁻</span>
            </button>
          </div>

          {/* Reaction timeline coordinate slider */}
          <div className="lab-ctrl-section space-y-3">
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>REACTION COORDINATE</span>
              <span>{Math.round(reactionCoord * 100)}%</span>
            </div>
            
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.01"
              value={reactionCoord}
              onChange={(e) => setReactionCoord(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />

            <div className="flex justify-between text-[8px] text-slate-500 font-mono">
              <span>REACTANTS</span>
              <span className="text-cyan-500">TRANSITION STATE</span>
              <span>PRODUCTS</span>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3.5 space-y-1.5 text-xs text-slate-400">
            <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1.5">
              Concerted Mechanism Notes
            </h4>
            <p className="leading-relaxed">
              At <span className="text-cyan-400 font-bold">50% transition state</span>, notice the planar Carbon sp² hybridization, forming temporary stretched bonds with both OH⁻ oxygen and Br⁻.
            </p>
          </div>
        </div>
      )}

      {/* 7. Solid State Lattices Tab */}
      {activeTab === "solidstate" && (
        <div className="space-y-4">
          <div className="lab-ctrl-section">
            <h4 className="lab-ctrl-section-hdr-title mb-2.5">Select Crystal Structure</h4>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "solid_sc", name: "Simple Cubic" },
                { id: "solid_bcc", name: "BCC" },
                { id: "solid_nacl", name: "NaCl Salt" }
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`py-2 rounded border text-xs font-semibold transition-all duration-200 ${
                    selectedId === c.id
                      ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/40"
                      : "bg-slate-900/40 text-slate-400 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="lab-ctrl-section space-y-3">
            <h4 className="lab-ctrl-section-hdr-title">Lattice Elements</h4>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Show Unit Cell Boundary Box</span>
              <button
                onClick={() => setShowLatticeOutline(!showLatticeOutline)}
                className={`px-4 py-1.5 rounded text-xs font-bold transition-all duration-200 ${
                  showLatticeOutline
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-slate-800 text-slate-500 border border-slate-700"
                }`}
              >
                {showLatticeOutline ? "SHOWN" : "HIDDEN"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Nanostructures Tab */}
      {activeTab === "nanostructures" && (
        <div className="space-y-4">
          <div className="lab-ctrl-section">
            <h4 className="lab-ctrl-section-hdr-title mb-2.5">Select Nanotech Shape</h4>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "nano_c60", name: "C₆₀ Fullerene" },
                { id: "nano_graphene", name: "Graphene" },
                { id: "nano_cnt", name: "Nanotube" }
              ].map((n) => (
                <button
                  key={n.id}
                  onClick={() => setSelectedId(n.id)}
                  className={`py-2 rounded border text-[10px] font-bold transition-all duration-200 ${
                    selectedId === n.id
                      ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/40"
                      : "bg-slate-900/40 text-slate-400 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {n.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 9. VSEPR Sandbox Tab */}
      {activeTab === "sandbox" && (
        <div className="space-y-4">
          <div className="lab-ctrl-section space-y-3">
            <h4 className="lab-ctrl-section-hdr-title">VSEPR Molecular Builder</h4>
            
            {/* Central Atom Select */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Central Atom (A)</span>
              <div className="grid grid-cols-5 gap-1">
                {["Be", "B", "C", "N", "O", "P", "S", "Cl", "Xe", "Br"].map((atom) => (
                  <button
                    key={atom}
                    onClick={() => setSandboxCentral(atom)}
                    className={`py-1.5 rounded text-[10px] font-bold border ${
                      sandboxCentral === atom
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                        : "bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    {atom}
                  </button>
                ))}
              </div>
            </div>

            {/* Ligands Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>BONDING LIGANDS (X)</span>
                <span>{sandboxLigands} atoms</span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                step="1"
                value={sandboxLigands}
                onChange={(e) => setSandboxLigands(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            {/* Lone Pairs Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>LONE PAIRS (E)</span>
                <span>{sandboxLonePairs} pairs</span>
              </div>
              <input
                type="range"
                min="0"
                max="3"
                step="1"
                value={sandboxLonePairs}
                onChange={(e) => setSandboxLonePairs(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
            
            <div className="text-[10px] text-slate-500 leading-normal text-center mt-1">
              Terminal atoms are set to <span className="text-cyan-400 font-bold">{sandboxTerm}</span> based on central group stability rules.
            </div>
          </div>

          {sandboxMolecule ? (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
              <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                Sandbox Geometry
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="bg-slate-950/60 p-2 rounded border border-slate-900">
                  <span className="block text-slate-500">VSEPR CLASS</span>
                  <span className="text-cyan-400 font-bold text-xs">{sandboxMolecule.formula}</span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded border border-slate-900">
                  <span className="block text-slate-500">HYBRIDIZATION</span>
                  <span className="text-cyan-400 font-bold text-xs">{sandboxMolecule.hybridization}</span>
                </div>
                <div className="col-span-2 bg-slate-950/60 p-2 rounded border border-slate-900">
                  <span className="block text-slate-500">IDEAL ANGLES</span>
                  <span className="text-cyan-400 font-bold text-xs">{sandboxMolecule.idealAngles}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 text-xs leading-normal text-center">
              ⚠️ Invalid VSEPR configuration. Total steric number (Ligands + Lone Pairs) must be between 2 and 6.
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <LabPageShell
      mode="free"
      onSetMode={() => {}}
      statusBar={statusBar}
      workspace={workspace}
      controls={controls}
      observations={<ObservationPanel observations={[]} />}
      education={{
        aim: "Analyze molecular structures, electronic orbitals, symmetry point groups, vibrational spectroscopy, and lattices in 3D.",
        theory: "Visualizes structural and physical properties of molecules. Demonstrates VSEPR molecular geometry, atomic orbitals, point group symmetry elements, vibrational normal modes, carbon nanostructures, and solid-state crystal packings.",
        apparatus: ["3D WebGL Canvas", "IR Spectrograph HUD", "VSEPR Builder UI"],
        chemicals: [],
        procedure: ["Toggle categories", "Select presets", "Observe normal modes", "Build custom VSEPR structures"],
        safetyNotes: ["Ensure WebGL acceleration is enabled."],
        keyEquation: "\\text{Steric Number} = \\text{Bonding Ligands} + \\text{Lone Pairs}"
      }}
    />
  );
}
