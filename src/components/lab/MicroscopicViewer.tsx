"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ParticleEngine, type ChemistryParticle } from "@/lib/engine/micro-engine";

interface Props {
  experimentType: "titration" | "electrolysis" | "equilibrium" | "kinetics" | "water-hardness" | "gas-laws" | "calorimetry" | "crystallization" | "natural-indicators" | "acid-metal" | "acid-carbonate" | "states-of-matter" | "diffusion-liquids" | "separation-mixtures" | "double-displacement" | "decomposition" | "physical-chemical";
  temperatureK: number;
  voltage?: number;
  concentration?: number;
  pH?: number;
  volume?: number; // for gas laws
  pressure?: number; // for gas laws
  catalystActive?: boolean; // for kinetics
  isTriggered?: boolean; // generic trigger
  gasType?: "he" | "n2" | "co2" | "water" | "ethanol" | "wax";
  extraParam?: string; // used for custom configuration (like indicator name, metal name, state phase, etc.)
}

export default function MicroscopicViewer({
  experimentType,
  temperatureK,
  voltage = 0,
  concentration = 0.5,
  pH = 7,
  volume = 5.0,
  pressure = 1.0,
  catalystActive = false,
  isTriggered = false,
  gasType = "co2",
  extraParam = "",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ParticleEngine | null>(null);
  const [metrics, setMetrics] = useState({ particleCount: 0, collisionFreq: 0, reactions: 0 });
  const [isPending, startTransition] = useTransition();

  // Initialize engine once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    engineRef.current = new ParticleEngine(canvas.width, canvas.height);

    // Initialize particles based on experiment type
    const engine = engineRef.current;
    const initialParticles: ChemistryParticle[] = [];

    const spawnParticles = () => {
      engine.clear();
      if (experimentType === "titration") {
        // Spawn acid H3O+, Na+, Cl-
        const numAcid = Math.round(15 + concentration * 30);
        for (let i = 0; i < numAcid; i++) {
          engine.addParticle({
            id: `h3o-${i}`,
            type: "H3O+",
            x: Math.random() * engine.width,
            y: Math.random() * engine.height,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            radius: 5,
            color: "#ef4444", // red
            mass: 1.2,
            charge: 1,
          });
        }
        // Na+ and Cl- spectators
        for (let i = 0; i < 20; i++) {
          engine.addParticle({
            id: `na-${i}`,
            type: "Na+",
            x: Math.random() * engine.width,
            y: Math.random() * engine.height,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            radius: 4,
            color: "#94a3b8", // slate
            mass: 1.5,
            charge: 1,
          });
          engine.addParticle({
            id: `cl-${i}`,
            type: "Cl-",
            x: Math.random() * engine.width,
            y: Math.random() * engine.height,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            radius: 6,
            color: "#22c55e", // green
            mass: 2.0,
            charge: -1,
          });
        }
      }

      else if (experimentType === "electrolysis") {
        // Spawn ions based on voltage and concentration
        const ionCount = 35;
        for (let i = 0; i < ionCount; i++) {
          const type = Math.random() > 0.5 ? "Cu2+" : "SO42-";
          engine.addParticle({
            id: `ion-${i}`,
            type,
            x: Math.random() * engine.width,
            y: Math.random() * engine.height,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            radius: type === "Cu2+" ? 5 : 7,
            color: type === "Cu2+" ? "#0ea5e9" : "#f97316", // blue vs orange
            mass: type === "Cu2+" ? 2.5 : 3.5,
            charge: type === "Cu2+" ? 2 : -2,
          });
        }
      }

      else if (experimentType === "gas-laws") {
        const gasCount = 60;
        const selectedGas = gasType || "co2";
        let radius = 6;
        let color = "#f59e0b"; // orange for CO2
        let mass = 2.0;
        let speedMult = 4.5;
        if (selectedGas === "he") {
          radius = 3;
          color = "#ec4899"; // pink
          mass = 0.4;
          speedMult = 8.5;
        } else if (selectedGas === "n2") {
          radius = 4.8;
          color = "#3b82f6"; // blue
          mass = 1.4;
          speedMult = 6.0;
        }
        for (let i = 0; i < gasCount; i++) {
          engine.addParticle({
            id: `gas-${i}`,
            type: selectedGas === "he" ? "He" : selectedGas === "n2" ? "N2" : "CO2",
            x: Math.random() * (engine.width * 0.8),
            y: Math.random() * engine.height,
            vx: (Math.random() - 0.5) * speedMult,
            vy: (Math.random() - 0.5) * speedMult,
            radius,
            color,
            mass,
            charge: 0,
          });
        }
      }

      else if (experimentType === "equilibrium") {
        // Spawn Fe3+ (yellow), SCN- (white)
        const count = 25;
        for (let i = 0; i < count; i++) {
          engine.addParticle({
            id: `fe-${i}`,
            type: "Fe3+",
            x: Math.random() * engine.width,
            y: Math.random() * engine.height,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            radius: 5,
            color: "#fbbf24", // yellow
            mass: 2.2,
            charge: 3,
          });
          engine.addParticle({
            id: `scn-${i}`,
            type: "SCN-",
            x: Math.random() * engine.width,
            y: Math.random() * engine.height,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            radius: 4,
            color: "#e2e8f0", // white
            mass: 1.0,
            charge: -1,
          });
        }
      }

      else if (experimentType === "kinetics") {
        // CaCO3 solid lattice at bottom
        // Spawn H+ acid ions bouncing around
        const acidCount = Math.round(20 + concentration * 40);
        for (let i = 0; i < acidCount; i++) {
          engine.addParticle({
            id: `h-${i}`,
            type: "H+",
            x: Math.random() * engine.width,
            y: Math.random() * (engine.height * 0.7),
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            radius: 3,
            color: "#ec4899", // pink/red
            mass: 0.5,
            charge: 1,
          });
        }
      }

      else if (experimentType === "calorimetry") {
        // Left side cool, right side cool. Mix on trigger
        const count = 40;
        for (let i = 0; i < count; i++) {
          const isLeft = i < count / 2;
          engine.addParticle({
            id: `cal-${i}`,
            type: isLeft ? "H3O+" : "OH-",
            x: isLeft ? Math.random() * (engine.width * 0.45) : (engine.width * 0.55) + Math.random() * (engine.width * 0.45),
            y: Math.random() * engine.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            radius: 5,
            color: isLeft ? "#ef4444" : "#3b82f6",
            mass: 1.2,
            charge: isLeft ? 1 : -1,
          });
        }
      }

      else if (experimentType === "water-hardness") {
        // Spawn Mg2+, Ca2+ and free EBT (wine-red bound state)
        for (let i = 0; i < 15; i++) {
          engine.addParticle({
            id: `ca-${i}`,
            type: "Ca2+",
            x: Math.random() * engine.width,
            y: Math.random() * engine.height,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            radius: 5,
            color: "#60a5fa", // blueish Ca
            mass: 1.8,
            charge: 2,
          });
          engine.addParticle({
            id: `mgebt-${i}`,
            type: "Mg-EBT",
            x: Math.random() * engine.width,
            y: Math.random() * engine.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            radius: 7,
            color: "#9f1239", // wine red
            mass: 2.5,
            charge: 0,
          });
        }
      }

      else if (experimentType === "crystallization") {
        // Spawn solute CuSO4 ions
        const soluteCount = Math.round(15 + concentration * 30);
        for (let i = 0; i < soluteCount; i++) {
          engine.addParticle({
            id: `cu-${i}`,
            type: "Cu2+",
            x: Math.random() * engine.width,
            y: Math.random() * (engine.height * 0.7),
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            radius: 5,
            color: "#0ea5e9",
            mass: 2.0,
            charge: 2,
          });
          engine.addParticle({
            id: `so4-${i}`,
            type: "SO42-",
            x: Math.random() * engine.width,
            y: Math.random() * (engine.height * 0.7),
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            radius: 6,
            color: "#a5f3fc",
            mass: 3.0,
            charge: -2,
          });
        }
        // Spawn static seed particles at the bottom
        for (let i = 0; i < 8; i++) {
          engine.addParticle({
            id: `seed-${i}`,
            type: "seed",
            x: 30 + i * (engine.width - 60) / 7,
            y: engine.height - 15,
            vx: 0,
            vy: 0,
            radius: 7,
            color: "#1e3a8a",
            mass: 10.0,
            charge: 0,
            isPlated: true,
          });
        }
      }

      else if (experimentType === "natural-indicators") {
        const indType = extraParam || "cabbage";
        let indColor = "#8b5cf6";
        if (indType === "cabbage") {
          indColor = pH < 5.0 ? "#ef4444" : pH < 8.0 ? "#8b5cf6" : "#22c55e";
        } else if (indType === "turmeric") {
          indColor = pH < 8.0 ? "#eab308" : "#991b1b";
        } else if (indType === "rose") {
          indColor = pH < 5.0 ? "#ec4899" : pH < 8.0 ? "#fbcfe8" : "#15803d";
        }

        // Spawn large indicator pigment molecules
        for (let i = 0; i < 12; i++) {
          engine.addParticle({
            id: `ind-${i}`,
            type: `${indType.charAt(0).toUpperCase() + indType.slice(1)}-Ind`,
            x: Math.random() * engine.width,
            y: Math.random() * engine.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            radius: 8,
            color: indColor,
            mass: 5.0,
            charge: 0,
          });
        }

        // Spawn H+ or OH- depending on pH
        if (pH < 7) {
          const hCount = Math.round((7 - pH) * 5);
          for (let i = 0; i < hCount; i++) {
            engine.addParticle({
              id: `h-${i}`,
              type: "H+",
              x: Math.random() * engine.width,
              y: Math.random() * engine.height,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              radius: 3,
              color: "#f43f5e",
              mass: 0.5,
              charge: 1,
            });
          }
        } else if (pH > 7) {
          const ohCount = Math.round((pH - 7) * 5);
          for (let i = 0; i < ohCount; i++) {
            engine.addParticle({
              id: `oh-${i}`,
              type: "OH-",
              x: Math.random() * engine.width,
              y: Math.random() * engine.height,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              radius: 4,
              color: "#3b82f6",
              mass: 1.0,
              charge: -1,
            });
          }
        }
      }

      else if (experimentType === "acid-metal") {
        const metal = extraParam || "Mg";
        // Metal lattice at bottom
        for (let i = 0; i < 15; i++) {
          engine.addParticle({
            id: `metal-${i}`,
            type: metal,
            x: 15 + i * (engine.width - 30) / 14,
            y: engine.height - 15,
            vx: 0,
            vy: 0,
            radius: 8,
            color: "#94a3b8",
            mass: 4.0,
            charge: 0,
            isPlated: true,
          });
        }
        // Spawn H+ acid ions bouncing around
        const acidCount = Math.round(20 + concentration * 30);
        for (let i = 0; i < acidCount; i++) {
          engine.addParticle({
            id: `h-${i}`,
            type: "H+",
            x: Math.random() * engine.width,
            y: Math.random() * (engine.height * 0.6),
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            radius: 3,
            color: "#f43f5e",
            mass: 0.5,
            charge: 1,
          });
        }
      }

      else if (experimentType === "acid-carbonate") {
        const carb = extraParam || "CaCO3";
        // Carbonate lattice at bottom
        for (let i = 0; i < 15; i++) {
          engine.addParticle({
            id: `carb-${i}`,
            type: carb,
            x: 15 + i * (engine.width - 30) / 14,
            y: engine.height - 15,
            vx: 0,
            vy: 0,
            radius: 8,
            color: "#cbd5e1",
            mass: 5.0,
            charge: 0,
            isPlated: true,
          });
        }
        // Spawn H+ acid ions bouncing around
        const acidCount = Math.round(20 + concentration * 30);
        for (let i = 0; i < acidCount; i++) {
          engine.addParticle({
            id: `h-${i}`,
            type: "H+",
            x: Math.random() * engine.width,
            y: Math.random() * (engine.height * 0.6),
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            radius: 3,
            color: "#f43f5e",
            mass: 0.5,
            charge: 1,
          });
        }
      }

      else if (experimentType === "states-of-matter") {
        const phase = extraParam || "solid";
        const sub = gasType || "water";
        const particleColor = sub === "water" ? "#38bdf8" : sub === "ethanol" ? "#fb923c" : "#e2e8f0";

        if (phase === "solid") {
          const cols = 8;
          const rows = 4;
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              engine.addParticle({
                id: `solid-${r}-${c}`,
                type: "mol",
                x: 60 + c * 25,
                y: 110 + r * 20,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: 7,
                color: particleColor,
                mass: 2.0,
                charge: 0,
              });
            }
          }
        } else if (phase === "liquid" || phase === "solid-liquid") {
          const count = 35;
          for (let i = 0; i < count; i++) {
            engine.addParticle({
              id: `liquid-${i}`,
              type: "mol",
              x: 20 + Math.random() * (engine.width - 40),
              y: 80 + Math.random() * (engine.height - 100),
              vx: (Math.random() - 0.5) * 3,
              vy: (Math.random() - 0.5) * 3,
              radius: 6,
              color: particleColor,
              mass: 2.0,
              charge: 0,
            });
          }
        } else {
          const count = 20;
          for (let i = 0; i < count; i++) {
            engine.addParticle({
              id: `gas-${i}`,
              type: "mol",
              x: Math.random() * engine.width,
              y: Math.random() * engine.height,
              vx: (Math.random() - 0.5) * 7,
              vy: (Math.random() - 0.5) * 7,
              radius: 5,
              color: particleColor,
              mass: 2.0,
              charge: 0,
            });
          }
        }
      }

      else if (experimentType === "diffusion-liquids") {
        // Solvent H2O particles (light blue)
        for (let i = 0; i < 40; i++) {
          engine.addParticle({
            id: `h2o-${i}`,
            type: "H2O",
            x: Math.random() * engine.width,
            y: Math.random() * engine.height,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            radius: 4,
            color: "rgba(56, 189, 248, 0.2)",
            mass: 1.0,
            charge: 0,
          });
        }
        // Solute drops particles clustered at top center
        const solute = extraParam || "kmno4";
        const color = solute === "kmno4" ? "#8b5cf6" : solute === "dye" ? "#ef4444" : "#3b82f6";
        const count = isTriggered ? 25 : 0;
        for (let i = 0; i < count; i++) {
          engine.addParticle({
            id: `solute-${i}`,
            type: solute,
            x: engine.width / 2 + (Math.random() - 0.5) * 20,
            y: 30 + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 2,
            vy: Math.random() * 2 + 1.0, // starts moving downwards
            radius: solute === "kmno4" ? 4 : solute === "dye" ? 6 : 5,
            color,
            mass: solute === "kmno4" ? 1.5 : solute === "dye" ? 2.5 : 1.8,
            charge: 0,
          });
        }
      }

      else if (experimentType === "separation-mixtures") {
        // 12 Iron filings (black, heavy, solid)
        for (let i = 0; i < 12; i++) {
          engine.addParticle({
            id: `fe-${i}`,
            type: "Fe",
            x: 20 + Math.random() * (engine.width - 40),
            y: engine.height - 25 - Math.random() * 15,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: 5,
            color: "#334155",
            mass: 4.5,
            charge: 0,
          });
        }
        // 12 Sand particles (brown, large, solid)
        for (let i = 0; i < 12; i++) {
          engine.addParticle({
            id: `sand-${i}`,
            type: "sand",
            x: 20 + Math.random() * (engine.width - 40),
            y: engine.height - 25 - Math.random() * 15,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            radius: 7,
            color: "#b45309",
            mass: 6.0,
            charge: 0,
          });
        }
        // 12 Salt ions (white, soluble/free)
        const isWet = isTriggered; // isTriggered represents wet state
        for (let i = 0; i < 12; i++) {
          engine.addParticle({
            id: `salt-${i}`,
            type: "NaCl",
            x: 20 + Math.random() * (engine.width - 40),
            y: isWet 
              ? Math.random() * (engine.height - 40) 
              : engine.height - 25 - Math.random() * 10,
            vx: isWet ? (Math.random() - 0.5) * 4 : (Math.random() - 0.5) * 0.5,
            vy: isWet ? (Math.random() - 0.5) * 4 : (Math.random() - 0.5) * 0.5,
            radius: 4,
            color: "#e2e8f0",
            mass: 1.5,
            charge: 0,
          });
        }
      }

      else if (experimentType === "double-displacement") {
        const sys = extraParam || "agno3-nacl";
        const concFactor = Math.round(10 + concentration * 15);

        if (sys === "agno3-nacl") {
          // Ag+ ions & Cl- ions
          for (let i = 0; i < concFactor; i++) {
            engine.addParticle({
              id: `ag-${i}`,
              type: "Ag+",
              x: Math.random() * (engine.width / 2),
              y: Math.random() * engine.height,
              vx: (Math.random() - 0.5) * 3,
              vy: (Math.random() - 0.5) * 3,
              radius: 5,
              color: "#94a3b8", // silverish
              mass: 2.5,
              charge: 1,
            });
            engine.addParticle({
              id: `cl-${i}`,
              type: "Cl-",
              x: engine.width / 2 + Math.random() * (engine.width / 2),
              y: Math.random() * engine.height,
              vx: (Math.random() - 0.5) * 3,
              vy: (Math.random() - 0.5) * 3,
              radius: 5,
              color: "#22c55e", // green chloride
              mass: 1.5,
              charge: -1,
            });
          }
        } else if (sys === "pbno3-ki") {
          // Pb2+ ions & I- ions
          for (let i = 0; i < concFactor; i++) {
            engine.addParticle({
              id: `pb-${i}`,
              type: "Pb2+",
              x: Math.random() * (engine.width / 2),
              y: Math.random() * engine.height,
              vx: (Math.random() - 0.5) * 2.5,
              vy: (Math.random() - 0.5) * 2.5,
              radius: 6,
              color: "#64748b", // slate lead
              mass: 3.5,
              charge: 2,
            });
            engine.addParticle({
              id: `i-${i * 2}`,
              type: "I-",
              x: engine.width / 2 + Math.random() * (engine.width / 2),
              y: Math.random() * engine.height,
              vx: (Math.random() - 0.5) * 3.5,
              vy: (Math.random() - 0.5) * 3.5,
              radius: 5,
              color: "#800080", // purple iodide
              mass: 2.0,
              charge: -1,
            });
            engine.addParticle({
              id: `i-${i * 2 + 1}`,
              type: "I-",
              x: engine.width / 2 + Math.random() * (engine.width / 2),
              y: Math.random() * engine.height,
              vx: (Math.random() - 0.5) * 3.5,
              vy: (Math.random() - 0.5) * 3.5,
              radius: 5,
              color: "#800080",
              mass: 2.0,
              charge: -1,
            });
          }
        } else {
          // Ba2+ ions & SO42- ions
          for (let i = 0; i < concFactor; i++) {
            engine.addParticle({
              id: `ba-${i}`,
              type: "Ba2+",
              x: Math.random() * (engine.width / 2),
              y: Math.random() * engine.height,
              vx: (Math.random() - 0.5) * 3,
              vy: (Math.random() - 0.5) * 3,
              radius: 5,
              color: "#06b6d4", // cyan barium
              mass: 3.0,
              charge: 2,
            });
            engine.addParticle({
              id: `so4-${i}`,
              type: "SO42-",
              x: engine.width / 2 + Math.random() * (engine.width / 2),
              y: Math.random() * engine.height,
              vx: (Math.random() - 0.5) * 2.5,
              vy: (Math.random() - 0.5) * 2.5,
              radius: 6,
              color: "#eab308", // yellow sulfate
              mass: 3.5,
              charge: -2,
            });
          }
        }
      }

      else if (experimentType === "decomposition") {
        const reactant = extraParam || "caco3";
        if (reactant === "caco3") {
          // CaCO3 solid grid lattice
          const cols = 6;
          const rows = 4;
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              engine.addParticle({
                id: `caco3-${r}-${c}`,
                type: "CaCO3",
                x: 80 + c * 25,
                y: 110 + r * 20,
                vx: 0,
                vy: 0,
                radius: 7,
                color: "#e2e8f0",
                mass: 5.0,
                charge: 0,
                isPlated: true,
              });
            }
          }
        } else if (reactant === "kclo3") {
          // KClO3 solid grid lattice
          const cols = 6;
          const rows = 4;
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              engine.addParticle({
                id: `kclo3-${r}-${c}`,
                type: "KClO3",
                x: 80 + c * 25,
                y: 110 + r * 20,
                vx: 0,
                vy: 0,
                radius: 7,
                color: "#cbd5e1",
                mass: 5.5,
                charge: 0,
                isPlated: true,
              });
            }
          }
        } else {
          // H2O2 liquid solution molecules
          for (let i = 0; i < 30; i++) {
            engine.addParticle({
              id: `h2o2-${i}`,
              type: "H2O2",
              x: 20 + Math.random() * (engine.width - 40),
              y: 80 + Math.random() * (engine.height - 100),
              vx: (Math.random() - 0.5) * 3,
              vy: (Math.random() - 0.5) * 3,
              radius: 6,
              color: "rgba(191, 219, 254, 0.7)",
              mass: 2.0,
              charge: 0,
            });
          }
        }
      }

      else if (experimentType === "physical-chemical") {
        const proc = extraParam || "melting-wax";
        if (proc === "melting-wax") {
          // Solid wax lattice
          const cols = 7;
          const rows = 3;
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              engine.addParticle({
                id: `wax-${r}-${c}`,
                type: "wax",
                x: 70 + c * 25,
                y: 120 + r * 18,
                vx: 0,
                vy: 0,
                radius: 7,
                color: "#f8fafc",
                mass: 3.0,
                charge: 0,
                isPlated: true, // solid
              });
            }
          }
        } else if (proc === "freezing-water") {
          // Liquid water molecules
          for (let i = 0; i < 30; i++) {
            engine.addParticle({
              id: `h2o-${i}`,
              type: "H2O",
              x: 20 + Math.random() * (engine.width - 40),
              y: 40 + Math.random() * (engine.height - 60),
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              radius: 5,
              color: "#38bdf8",
              mass: 1.5,
              charge: 0,
            });
          }
        } else if (proc === "dissolving-sugar") {
          // Sugar solid grid on the left
          const cols = 4;
          const rows = 4;
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              engine.addParticle({
                id: `sugar-${r}-${c}`,
                type: "sugar",
                x: 40 + c * 18,
                y: 90 + r * 18,
                vx: 0,
                vy: 0,
                radius: 6,
                color: "#ffffff",
                mass: 4.0,
                charge: 0,
                isPlated: true,
              });
            }
          }
          // Solvent molecules
          for (let i = 0; i < 20; i++) {
            engine.addParticle({
              id: `h2o-${i}`,
              type: "H2O",
              x: 120 + Math.random() * (engine.width - 140),
              y: 40 + Math.random() * (engine.height - 60),
              vx: (Math.random() - 0.5) * 3,
              vy: (Math.random() - 0.5) * 3,
              radius: 4,
              color: "rgba(56, 189, 248, 0.2)",
              mass: 1.5,
              charge: 0,
            });
          }
        } else if (proc === "burning-paper") {
          // Paper carbon grid at bottom
          const cols = 8;
          const rows = 3;
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              engine.addParticle({
                id: `c-${r}-${c}`,
                type: "C",
                x: 60 + c * 22,
                y: engine.height - 15 - r * 15,
                vx: 0,
                vy: 0,
                radius: 6,
                color: "#cbd5e1", // white paper
                mass: 2.0,
                charge: 0,
                isPlated: true,
              });
            }
          }
          // Free O2 gas particles bouncing around
          for (let i = 0; i < 15; i++) {
            engine.addParticle({
              id: `o2-${i}`,
              type: "O2",
              x: Math.random() * engine.width,
              y: Math.random() * (engine.height - 60),
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              radius: 4,
              color: "#fb7185", // red oxygen
              mass: 2.0,
              charge: 0,
            });
          }
        } else if (proc === "rusting-iron") {
          // Solid Fe filings layer at bottom
          for (let i = 0; i < 15; i++) {
            engine.addParticle({
              id: `fe-${i}`,
              type: "Fe",
              x: 15 + i * (engine.width - 30) / 14,
              y: engine.height - 15,
              vx: 0,
              vy: 0,
              radius: 7,
              color: "#64748b", // steel grey
              mass: 3.5,
              charge: 0,
              isPlated: true,
            });
          }
          // Oxygen gas particles
          for (let i = 0; i < 12; i++) {
            engine.addParticle({
              id: `o2-${i}`,
              type: "O2",
              x: Math.random() * engine.width,
              y: Math.random() * (engine.height - 40),
              vx: (Math.random() - 0.5) * 3,
              vy: (Math.random() - 0.5) * 3,
              radius: 4,
              color: "#fb7185",
              mass: 2.0,
              charge: 0,
            });
          }
        } else if (proc === "neutralization") {
          // H3O+ and OH- ions
          for (let i = 0; i < 15; i++) {
            engine.addParticle({
              id: `h3o-${i}`,
              type: "H3O+",
              x: Math.random() * (engine.width / 2),
              y: Math.random() * engine.height,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              radius: 4,
              color: "#f43f5e",
              mass: 1.0,
              charge: 1,
            });
            engine.addParticle({
              id: `oh-${i}`,
              type: "OH-",
              x: engine.width / 2 + Math.random() * (engine.width / 2),
              y: Math.random() * engine.height,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              radius: 4,
              color: "#3b82f6",
              mass: 1.0,
              charge: -1,
            });
          }
        }
      }
    };

    spawnParticles();

    // Loop
    let lastTime = performance.now();
    let animationId = 0;
    let collisionsSum = 0;
    let secondsCounter = 0;
    let totalReactions = 0;

    const tick = (now: number) => {
      const deltaSec = Math.min(0.03, (now - lastTime) / 1000);
      lastTime = now;

      // Limit x-boundary dynamically to represent piston volume
      if (experimentType === "gas-laws") {
        const pistonX = Math.round(50 + (volume / 12) * (engine.width - 70));
        engine.width = pistonX;
      }

      // ─── Custom Forces for Separation Mixtures ───
      if (experimentType === "separation-mixtures") {
        if (extraParam === "magnet") {
          // Attract Fe filings to top-center magnet (width / 2, 10)
          for (const p of engine.particles) {
            if (p.type === "Fe") {
              const dx = engine.width / 2 - p.x;
              const dy = 10 - p.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist > 6) {
                p.vx += (dx / dist) * 0.4;
                p.vy += (dy / dist) * 0.4;
              } else {
                p.vx = 0;
                p.vy = 0;
                p.isPlated = true; // stick to magnet
              }
            }
          }
        } else if (extraParam === "filter") {
          // Block sand at y = height - 55
          for (const p of engine.particles) {
            if (p.type === "sand" && p.y > engine.height - 55) {
              p.y = engine.height - 55;
              p.vy = -Math.abs(p.vy) * 0.3;
            }
          }
        } else if (extraParam === "evaporate") {
          // Settle NaCl crystals to bottom
          for (const p of engine.particles) {
            if (p.type === "NaCl") {
              if (p.y < engine.height - 12) {
                p.vy += 0.25; // gravity pull
              } else {
                p.vx = 0;
                p.vy = 0;
                p.isPlated = true;
              }
            }
          }
        }
      }

      const outcome = engine.update(deltaSec, temperatureK, voltage, {
        experimentType,
        pH,
        equilibriumConstant: keqAtTempK(temperatureK),
        activationEnergy: catalystActive ? 38000 : 58000,
        catalystActive,
        restitution: 0.98
      });

      collisionsSum += outcome.momentumTransfer;
      totalReactions += outcome.reactionsCount;
      secondsCounter += deltaSec;

      if (secondsCounter >= 1.0) {
        const cFreq = Math.round(collisionsSum * 10);
        collisionsSum = 0;
        secondsCounter = 0;
        startTransition(() => {
          setMetrics({
            particleCount: engine.particles.length,
            collisionFreq: cFreq,
            reactions: totalReactions,
          });
        });
      }

      // Draw canvas
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background structure based on experiment
        if (experimentType === "electrolysis") {
          // Draw electrodes
          ctx.fillStyle = "rgba(71,85,105,0.8)"; // Anode (+) grey metal
          ctx.fillRect(canvas.width - 25, 10, 15, canvas.height - 20);
          ctx.fillStyle = "rgba(180,83,9,0.8)"; // Cathode (-) plated metal copper
          ctx.fillRect(10, 10, 15, canvas.height - 20);

          // Labels
          ctx.fillStyle = "#0f172a";
          ctx.font = "bold 9px sans-serif";
          ctx.fillText("ANODE (+)", canvas.width - 75, 25);
          ctx.fillText("CATHODE (-)", 35, 25);
        }

        else if (experimentType === "gas-laws") {
          // Draw Piston
          const pistonX = Math.round(50 + (volume / 12) * (canvas.width - 70));
          ctx.fillStyle = "rgba(100,116,139,0.9)";
          ctx.fillRect(pistonX, 0, canvas.width - pistonX, canvas.height);
          ctx.strokeStyle = "rgba(148,163,184,0.8)";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(pistonX, 0);
          ctx.lineTo(pistonX, canvas.height);
          ctx.stroke();
        }

        else if (experimentType === "kinetics") {
          // Draw solid CaCO3 lattice at the bottom
          ctx.fillStyle = "#cbd5e1";
          const rows = 3;
          const cols = 15;
          const cellSize = 20;
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              ctx.fillRect(c * cellSize + 5, canvas.height - (r * cellSize) - 15, cellSize - 2, cellSize - 2);
            }
          }
          ctx.fillStyle = "#64748b";
          ctx.font = "8px monospace";
          ctx.fillText("Calcium Carbonate Solid CaCO3", 10, canvas.height - 4);
        }

        else if (experimentType === "acid-metal") {
          ctx.fillStyle = "rgba(148,163,184,0.15)";
          ctx.fillRect(0, canvas.height - 25, canvas.width, 25);
          ctx.fillStyle = "#475569";
          ctx.font = "bold 8px sans-serif";
          ctx.fillText(`METAL REACTANT: ${extraParam || "Mg"}`, 10, canvas.height - 8);
        }

        else if (experimentType === "acid-carbonate") {
          ctx.fillStyle = "rgba(203,213,225,0.15)";
          ctx.fillRect(0, canvas.height - 25, canvas.width, 25);
          ctx.fillStyle = "#64748b";
          ctx.font = "bold 8px sans-serif";
          ctx.fillText(`CARBONATE: ${extraParam || "CaCO3"}`, 10, canvas.height - 8);
        }

        else if (experimentType === "crystallization") {
          ctx.fillStyle = "rgba(30,58,138,0.15)";
          ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
          ctx.fillStyle = "#1d4ed8";
          ctx.font = "bold 8px sans-serif";
          ctx.fillText("CRYSTAL SEED NUCLEATION LAYER", 10, canvas.height - 6);
        }

        else if (experimentType === "diffusion-liquids") {
          ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
          ctx.lineWidth = 2;
          ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
          ctx.fillStyle = "rgba(56,189,248,0.06)";
          ctx.fillRect(2, 2, canvas.width - 4, canvas.height - 4);
        }

        else if (experimentType === "separation-mixtures") {
          if (extraParam === "filter") {
            // Draw filter mesh funnel line
            ctx.strokeStyle = "#64748b";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(10, 30);
            ctx.lineTo(canvas.width / 2, canvas.height - 50);
            ctx.lineTo(canvas.width - 10, 30);
            ctx.stroke();
          } else if (extraParam === "magnet") {
            // Draw magnet at top
            ctx.fillStyle = "#ef4444";
            ctx.fillRect(canvas.width / 2 - 20, 2, 20, 10);
            ctx.fillStyle = "#64748b";
            ctx.fillRect(canvas.width / 2, 2, 20, 10);
          }
        }

        else if (experimentType === "decomposition") {
          if (isTriggered && extraParam !== "h2o2") {
            ctx.fillStyle = "rgba(239, 68, 68, 0.15)";
            ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
            ctx.fillStyle = "#ef4444";
            ctx.font = "bold 8px sans-serif";
            ctx.fillText("THERMAL DECOMPOSITION ACTIVE", 10, canvas.height - 6);
          }
        }

        else if (experimentType === "physical-chemical") {
          if (isTriggered && ["melting-wax", "burning-paper"].includes(extraParam)) {
            ctx.fillStyle = "rgba(239, 68, 68, 0.12)";
            ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
          }
        }

        // Draw particles
        for (const p of engine.particles) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
          ctx.strokeStyle = "rgba(15, 23, 42, 0.15)";
          ctx.lineWidth = 1;
          ctx.stroke();

          // Charge sign decoration
          if (p.charge !== 0 && p.radius > 4) {
            ctx.fillStyle = "#ffffff";
            ctx.font = "8px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(p.charge > 0 ? "+" : "-", p.x, p.y);
          }
        }
      }

      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [experimentType, temperatureK, voltage, concentration, pH, volume, pressure, catalystActive, isTriggered, gasType]);

  const addReactantDrop = () => {
    const engine = engineRef.current;
    if (!engine) return;

    if (experimentType === "titration") {
      // Drop OH- and Na+ from the top
      for (let i = 0; i < 5; i++) {
        engine.addParticle({
          id: Math.random().toString(),
          type: "OH-",
          x: engine.width / 2 + (Math.random() - 0.5) * 30,
          y: 5 + Math.random() * 10,
          vx: (Math.random() - 0.5) * 1.5,
          vy: 2 + Math.random() * 3,
          radius: 5,
          color: "#3b82f6", // blue
          mass: 1.2,
          charge: -1,
        });
        engine.addParticle({
          id: Math.random().toString(),
          type: "Na+",
          x: engine.width / 2 + (Math.random() - 0.5) * 30,
          y: 5 + Math.random() * 10,
          vx: (Math.random() - 0.5) * 1.5,
          vy: 2 + Math.random() * 3,
          radius: 4,
          color: "#94a3b8", // slate
          mass: 1.5,
          charge: 1,
        });
      }
    }

    else if (experimentType === "water-hardness") {
      // Add green EDTA particles
      for (let i = 0; i < 4; i++) {
        engine.addParticle({
          id: Math.random().toString(),
          type: "EDTA",
          x: engine.width / 2 + (Math.random() - 0.5) * 50,
          y: 10,
          vx: (Math.random() - 0.5) * 2,
          vy: 3 + Math.random() * 3,
          radius: 6,
          color: "#10b981", // green chelate claws
          mass: 3.0,
          charge: -4,
        });
      }
    }

    else if (experimentType === "acid-metal" || experimentType === "acid-carbonate") {
      // Add H+ acid particles from the top
      for (let i = 0; i < 6; i++) {
        engine.addParticle({
          id: Math.random().toString(),
          type: "H+",
          x: engine.width / 2 + (Math.random() - 0.5) * 80,
          y: 10,
          vx: (Math.random() - 0.5) * 2,
          vy: 2 + Math.random() * 3,
          radius: 3,
          color: "#f43f5e",
          mass: 0.5,
          charge: 1,
        });
      }
    }
  };

  return (
    <div
      className="flex flex-col gap-3 p-3.5 rounded-2xl"
      style={{
        background: "var(--lab-glass)",
        border: "1px solid var(--lab-glass-border)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
        width: "100%",
      }}
    >
      <div className="flex justify-between items-center">
        <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569]">
          ⚛ Microscopic Chemistry View
        </h4>
        { (experimentType === "titration" || experimentType === "water-hardness" || experimentType === "acid-metal" || experimentType === "acid-carbonate") && (
          <button
            onClick={addReactantDrop}
            className="px-2.5 py-1 text-[10px] font-bold text-white rounded-lg hover:opacity-90 active:scale-95 transition-all"
            style={{
              background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
            }}
          >
            {experimentType === "water-hardness" ? "Add EDTA Drop" : 
             (experimentType === "acid-metal" || experimentType === "acid-carbonate") ? "Add Acid Drop" : "Add Drop from Burette"}
          </button>
        )}
      </div>

      <div
        className="relative overflow-hidden rounded-xl"
        style={{
          border: "1px solid rgba(148,163,184,0.25)",
          background: "#f8fafc", // Sleek light space grid
        }}
      >
        {/* Particle Canvas */}
        <canvas
          ref={canvasRef}
          width={300}
          height={200}
          className="w-full h-auto block"
        />
      </div>

      {/* Physics / Chemistry Metrics */}
      <div className="grid grid-cols-3 gap-2 text-[10px] font-mono p-2.5 rounded-lg"
           style={{ background: "rgba(15,23,42,0.05)", border: "1px solid rgba(15,23,42,0.08)" }}>
        <div className="flex flex-col">
          <span className="text-[#64748b]">Particles</span>
          <span className="font-extrabold text-[#1e293b]">{metrics.particleCount}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[#64748b]">Collision Freq</span>
          <span className="font-extrabold text-[#1e293b]">{metrics.collisionFreq} Hz</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[#64748b]">Reaction Events</span>
          <span className="font-extrabold text-[#2563eb]">{metrics.reactions}</span>
        </div>
      </div>
    </div>
  );
}

function keqAtTempK(tempK: number): number {
  const DELTA_H_J = -20000;
  const R = 8.314;
  const T_REF = 298;
  const KEQ_298 = 1100;
  const exponent = (-DELTA_H_J / R) * (1 / tempK - 1 / T_REF);
  return KEQ_298 * Math.exp(exponent);
}
