/**
 * Shared Microscopic Chemistry Simulation Engine
 *
 * Implements particle dynamics, collision physics, Maxwell-Boltzmann thermal velocity
 * distribution, ion electromigration, and reaction events.
 */

export interface ChemistryParticle {
  id: string;
  type: string; // "H3O+", "OH-", "Na+", "Cl-", "Cu2+", "SO42-", "H2O", "H2", "O2", "Cl2", "Fe3+", "SCN-", "FeSCN2+", "Ca2+", "Mg2+", "EDTA", "EBT", "Mg-EBT", "Ca-EDTA", "Mg-EDTA", "He", "N2", "CO2", "H+"
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  mass: number;
  charge: number; // elementary charge
  energy?: number;
  isPlated?: boolean;
}

export class CollisionSystem {
  /** Bounce particles off rectangular box boundaries. */
  static checkWallCollisions(
    particles: ChemistryParticle[],
    width: number,
    height: number,
    restitution = 0.98
  ): { momentumTransfer: number } {
    let momentumTransfer = 0;
    for (const p of particles) {
      if (p.isPlated) continue;

      // Left wall
      if (p.x - p.radius < 0) {
        p.x = p.radius;
        momentumTransfer += Math.abs(p.vx * p.mass * 2);
        p.vx = -p.vx * restitution;
      }
      // Right wall
      else if (p.x + p.radius > width) {
        p.x = width - p.radius;
        momentumTransfer += Math.abs(p.vx * p.mass * 2);
        p.vx = -p.vx * restitution;
      }

      // Top wall
      if (p.y - p.radius < 0) {
        p.y = p.radius;
        momentumTransfer += Math.abs(p.vy * p.mass * 2);
        p.vy = -p.vy * restitution;
      }
      // Bottom wall
      else if (p.y + p.radius > height) {
        p.y = height - p.radius;
        momentumTransfer += Math.abs(p.vy * p.mass * 2);
        p.vy = -p.vy * restitution;
      }
    }
    return { momentumTransfer };
  }

  /** Handle elastic collisions between particles. */
  static checkParticleCollisions(particles: ChemistryParticle[], restitution = 1.0): void {
    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      if (p1.isPlated) continue;
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        if (p2.isPlated) continue;

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = p1.radius + p2.radius;

        if (dist < minDist) {
          // Resolve overlap
          const overlap = minDist - dist;
          const nx = dx / (dist || 1);
          const ny = dy / (dist || 1);

          p1.x -= nx * overlap * 0.5;
          p1.y -= ny * overlap * 0.5;
          p2.x += nx * overlap * 0.5;
          p2.y += ny * overlap * 0.5;

          // Elastic collision calculation
          const kx = p1.vx - p2.vx;
          const ky = p1.vy - p2.vy;
          const vn = kx * nx + ky * ny;

          if (vn > 0) {
            // Moving towards each other
            const impulse = (2 * vn) / (p1.mass + p2.mass);
            p1.vx -= impulse * p2.mass * nx * restitution;
            p1.vy -= impulse * p2.mass * ny * restitution;
            p2.vx += impulse * p1.mass * nx * restitution;
            p2.vy += impulse * p1.mass * ny * restitution;
          }
        }
      }
    }
  }
}

export class IonMigrationSystem {
  /** Applies electromigration forces to charged particles based on electric field E. */
  static applyElectricField(
    particles: ChemistryParticle[],
    voltage: number,
    width: number,
    electricFieldFactor = 0.05
  ): void {
    if (voltage === 0) return;
    // Anode (+) at x = width, Cathode (-) at x = 0
    // Electric field runs right-to-left. Positive ions drift left (-), negative drift right (+)
    const force = voltage * electricFieldFactor;
    for (const p of particles) {
      if (p.isPlated) continue;
      if (p.charge !== 0) {
        // Cation drifts left (towards x=0), Anion drifts right (towards x=width)
        p.vx -= p.charge * force;
      }
    }
  }
}

export class EnergyTransferSystem {
  /** Adjust velocities of particles based on temperature. */
  static applyTemperatureScaling(
    particles: ChemistryParticle[],
    tempKelvin: number,
    baseTemp = 298.15
  ): void {
    const ratio = Math.sqrt(tempKelvin / baseTemp);
    for (const p of particles) {
      if (p.isPlated) continue;
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > 1e-4) {
        const targetSpeed = speed * ratio;
        // Dampen fluctuations to align with target temperature
        const newSpeed = speed + (targetSpeed - speed) * 0.1;
        p.vx = (p.vx / speed) * newSpeed;
        p.vy = (p.vy / speed) * newSpeed;
      } else {
        // Thermal kick for static particles
        const angle = Math.random() * Math.PI * 2;
        const kick = Math.sqrt(tempKelvin) * 0.15;
        p.vx = Math.cos(angle) * kick;
        p.vy = Math.sin(angle) * kick;
      }
    }
  }

  /** Maxwell-Boltzmann random speed distribution kick. */
  static kickRandom(p: ChemistryParticle, tempKelvin: number): void {
    const speed = Math.sqrt(tempKelvin) * (0.5 + Math.random() * 0.8) * 0.1;
    const angle = Math.random() * Math.PI * 2;
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed;
  }
}

export class ReactionEventSystem {
  /** Handles reactions between colliding particles. */
  static processReactions(
    particles: ChemistryParticle[],
    experimentType: "titration" | "electrolysis" | "equilibrium" | "kinetics" | "water-hardness" | "gas-laws" | "calorimetry" | "crystallization" | "natural-indicators" | "acid-metal" | "acid-carbonate" | "states-of-matter" | "diffusion-liquids" | "separation-mixtures" | "double-displacement" | "decomposition" | "physical-chemical",
    params: {
      pH?: number;
      equilibriumConstant?: number;
      activationEnergy?: number;
      catalystActive?: boolean;
    } = {}
  ): { reactionsCount: number; newPlatedMassG?: number } {
    let reactionsCount = 0;
    const newPlatedMassG = 0;

    if (experimentType === "titration") {
      // Neutralization: H3O+ + OH- -> 2H2O
      // We look for H3O+ colliding with OH-
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        if (p1.type !== "H3O+") continue;
        for (let j = 0; j < particles.length; j++) {
          const p2 = particles[j];
          if (p2.type !== "OH-") continue;

          // Check if colliding
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < p1.radius + p2.radius + 3) {
            // Neutralize! Transform p1 and p2 into H2O molecules
            p1.type = "H2O";
            p1.color = "rgba(186,230,253,0.3)";
            p1.charge = 0;
            p1.radius = 4;

            p2.type = "H2O";
            p2.color = "rgba(186,230,253,0.3)";
            p2.charge = 0;
            p2.radius = 4;
            reactionsCount++;
            break;
          }
        }
      }
    }

    else if (experimentType === "crystallization") {
      // Free CuSO4 ions collide with static crystals or seed particles and crystallize (become static)
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        if (p1.isPlated) continue; // already crystallized
        if (p1.type !== "Cu2+" && p1.type !== "SO42-") continue;

        for (let j = 0; j < particles.length; j++) {
          const p2 = particles[j];
          if (!p2.isPlated && p2.type !== "seed") continue;

          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < p1.radius + p2.radius + 3) {
            // Crystallize if temperature is low enough (e.g. cooling, let's say we check inside viewer)
            p1.isPlated = true;
            p1.vx = 0;
            p1.vy = 0;
            p1.color = p1.type === "Cu2+" ? "#1e3a8a" : "#2563eb"; // Crystalline blues
            reactionsCount++;
            break;
          }
        }
      }
    }

    else if (experimentType === "natural-indicators") {
      // H+ protonates indicator (making it acidic color)
      // OH- deprotonates indicator (making it basic color)
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        if (!p1.type.endsWith("-Ind")) continue;

        for (let j = 0; j < particles.length; j++) {
          const p2 = particles[j];
          if (p2.type === "H+" || p2.type === "H3O+") {
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < p1.radius + p2.radius + 2) {
              // Protonate!
              if (p1.type.startsWith("Cabbage")) {
                p1.color = "#ef4444"; // Cabbage acidic (red)
              } else if (p1.type.startsWith("Turmeric")) {
                p1.color = "#eab308"; // Turmeric acidic (yellow)
              } else if (p1.type.startsWith("Rose")) {
                p1.color = "#ec4899"; // China Rose acidic (magenta)
              }
              particles.splice(j, 1); // Consume the H+
              reactionsCount++;
              break;
            }
          } else if (p2.type === "OH-") {
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < p1.radius + p2.radius + 2) {
              // Deprotonate!
              if (p1.type.startsWith("Cabbage")) {
                p1.color = "#22c55e"; // Cabbage basic (green/yellow)
              } else if (p1.type.startsWith("Turmeric")) {
                p1.color = "#991b1b"; // Turmeric basic (red/orange)
              } else if (p1.type.startsWith("Rose")) {
                p1.color = "#15803d"; // China Rose basic (green)
              }
              particles.splice(j, 1); // Consume the OH-
              reactionsCount++;
              break;
            }
          }
        }
      }
    }

    else if (experimentType === "acid-metal") {
      // H+ collides with metal atoms at the bottom and reacts
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        if (p1.isPlated) continue; // dissolved or already reacted
        if (p1.type !== "Mg" && p1.type !== "Zn" && p1.type !== "Fe" && p1.type !== "Cu") continue;

        for (let j = 0; j < particles.length; j++) {
          const p2 = particles[j];
          if (p2.type !== "H+" && p2.type !== "H3O+") continue;

          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < p1.radius + p2.radius + 2) {
            // Reactivity factor: Mg (0.4), Zn (0.15), Fe (0.05), Cu (0.0)
            const prob = p1.type === "Mg" ? 0.4 : p1.type === "Zn" ? 0.15 : p1.type === "Fe" ? 0.05 : 0.0;
            if (Math.random() < prob) {
              // Dissolve metal: make it float around as cation
              p1.isPlated = true; // no longer stationary
              p1.type = `${p1.type}2+`;
              p1.color = "#cbd5e1"; // slate metal ion color
              p1.vx = (Math.random() - 0.5) * 4;
              p1.vy = -2 - Math.random() * 2; // floats up initially

              // Convert H+ into H2 gas molecule rising to the top
              p2.type = "H2";
              p2.color = "#ffffff";
              p2.radius = 4;
              p2.charge = 0;
              p2.vy = -3 - Math.random() * 3; // rises up rapidly

              reactionsCount++;
              break;
            }
          }
        }
      }
    }

    else if (experimentType === "acid-carbonate") {
      // H+ collides with CaCO3/Na2CO3 at the bottom and reacts
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        if (p1.isPlated) continue; // already dissolved
        if (p1.type !== "CaCO3" && p1.type !== "Na2CO3") continue;

        for (let j = 0; j < particles.length; j++) {
          const p2 = particles[j];
          if (p2.type !== "H+" && p2.type !== "H3O+") continue;

          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < p1.radius + p2.radius + 2) {
            const prob = p1.type === "Na2CO3" ? 0.5 : 0.15; // Na2CO3 is faster than CaCO3
            if (Math.random() < prob) {
              // Dissolve carbonate into Ca2+/Na+ cation
              p1.isPlated = true;
              p1.type = p1.type === "CaCO3" ? "Ca2+" : "Na+";
              p1.color = "#60a5fa";
              p1.vx = (Math.random() - 0.5) * 3;
              p1.vy = -2 - Math.random() * 2;

              // Convert H+ into CO2 gas bubble rising to the top
              p2.type = "CO2";
              p2.color = "#f59e0b"; // orange CO2
              p2.radius = 5;
              p2.charge = 0;
              p2.vy = -3 - Math.random() * 3; // rises up rapidly

              reactionsCount++;
              break;
            }
          }
        }
      }
    }

    else if (experimentType === "equilibrium") {
      // Fe3+ (yellow) + SCN- (white) <-> FeSCN2+ (red)
      // Forward: Fe3+ + SCN- -> FeSCN2+ on collision
      // Reverse: FeSCN2+ -> Fe3+ + SCN- spontaneously based on Keq
      const Keq = params.equilibriumConstant ?? 1100;
      const kReverseProb = 0.002; // Base spontaneous dissociation probability per frame
      const kForwardProb = 0.3; // Collision reaction probability

      // 1. Spontaneous Dissociation
      for (const p of particles) {
        if (p.type === "FeSCN2+" && Math.random() < kReverseProb) {
          p.type = "Fe3+";
          p.color = "#fbbf24"; // yellow
          p.charge = 3;
          p.radius = 5;

          // Spawn a new SCN- particle nearby
          const angle = Math.random() * Math.PI * 2;
          const scn: ChemistryParticle = {
            id: Math.random().toString(36).slice(2, 9),
            type: "SCN-",
            x: p.x + Math.cos(angle) * 15,
            y: p.y + Math.sin(angle) * 15,
            vx: -p.vx * 0.8,
            vy: -p.vy * 0.8,
            radius: 4,
            color: "#e2e8f0", // white
            mass: 1.0,
            charge: -1
          };
          particles.push(scn);
          reactionsCount++;
        }
      }

      // 2. Collision Association
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        if (p1.type !== "Fe3+") continue;
        for (let j = 0; j < particles.length; j++) {
          const p2 = particles[j];
          if (p2.type !== "SCN-") continue;

          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < p1.radius + p2.radius + 2) {
            if (Math.random() < kForwardProb) {
              // Convert p1 to FeSCN2+ and remove p2
              p1.type = "FeSCN2+";
              p1.color = "#dc2626"; // blood red
              p1.charge = 2;
              p1.radius = 6;
              particles.splice(j, 1);
              reactionsCount++;
              break;
            }
          }
        }
      }
    }

    else if (experimentType === "water-hardness") {
      // EDTA + Ca2+/Mg2+ -> Ca-EDTA / Mg-EDTA (chelating cage)
      // EBT + Mg2+ -> Mg-EBT (wine-red), EDTA outcompetes and displaces EBT (restoring EBT to blue)
      const kComplexationProb = 0.5;

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        if (p1.type !== "EDTA") continue;
        for (let j = 0; j < particles.length; j++) {
          const p2 = particles[j];
          
          if (p2.type === "Ca2+" || p2.type === "Mg2+") {
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < p1.radius + p2.radius + 3 && Math.random() < kComplexationProb) {
              // Chelate! Wrap metal ion in EDTA cage
              p1.type = p2.type === "Ca2+" ? "Ca-EDTA" : "Mg-EDTA";
              p1.color = "rgba(71,85,105,0.7)"; // slate cage color
              p1.radius = 8;
              p1.charge = 0;
              particles.splice(j, 1);
              reactionsCount++;
              break;
            }
          }

          else if (p2.type === "Mg-EBT") {
            // EDTA out-competes Mg-EBT complex
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < p1.radius + p2.radius + 3 && Math.random() < kComplexationProb) {
              // EDTA steals Mg2+ from indicator, displacing EBT back to blue
              p1.type = "Mg-EDTA";
              p1.color = "rgba(71,85,105,0.7)";
              p1.radius = 8;
              p1.charge = 0;

              // Displace EBT to free blue dye state
              p2.type = "EBT";
              p2.color = "#2563eb"; // blue
              p2.radius = 5;
              p2.charge = -3;
              reactionsCount++;
              break;
            }
          }
        }
      }

      // Re-complexation of free metals by free EBT if they meet
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        if (p1.type !== "EBT") continue;
        for (let j = 0; j < particles.length; j++) {
          const p2 = particles[j];
          if (p2.type === "Mg2+") {
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < p1.radius + p2.radius + 2 && Math.random() < 0.4) {
              p1.type = "Mg-EBT";
              p1.color = "#9f1239"; // wine-red
              p1.radius = 6;
              particles.splice(j, 1);
              break;
            }
          }
        }
      }
    }

    else if (experimentType === "double-displacement") {
      // 1. Ag+ + Cl- -> AgCl (white precipitate, static)
      // 2. Pb2+ + 2I- -> PbI2 (yellow precipitate, static)
      // 3. Ba2+ + SO42- -> BaSO4 (white precipitate, static)
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        if (p1.isPlated) continue;

        for (let j = 0; j < particles.length; j++) {
          const p2 = particles[j];
          if (p2.isPlated || i === j) continue;

          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < p1.radius + p2.radius + 3) {
            // Check AgNO3 + NaCl
            if ((p1.type === "Ag+" && p2.type === "Cl-") || (p1.type === "Cl-" && p2.type === "Ag+")) {
              p1.type = "AgCl";
              p1.color = "#ffffff";
              p1.charge = 0;
              p1.radius = 6;
              p1.isPlated = true;
              p1.vx = 0;
              p1.vy = 0;
              particles.splice(j, 1);
              reactionsCount++;
              break;
            }
            // Check Pb(NO3)2 + KI
            else if ((p1.type === "Pb2+" && p2.type === "I-") || (p1.type === "I-" && p2.type === "Pb2+")) {
              p1.type = "PbI2";
              p1.color = "#fbbf24"; // vibrant yellow
              p1.charge = 0;
              p1.radius = 6;
              p1.isPlated = true;
              p1.vx = 0;
              p1.vy = 0;
              particles.splice(j, 1);
              reactionsCount++;
              break;
            }
            // Check BaCl2 + Na2SO4
            else if ((p1.type === "Ba2+" && p2.type === "SO42-") || (p1.type === "SO42-" && p2.type === "Ba2+")) {
              p1.type = "BaSO4";
              p1.color = "#e2e8f0"; // off-white
              p1.charge = 0;
              p1.radius = 6;
              p1.isPlated = true;
              p1.vx = 0;
              p1.vy = 0;
              particles.splice(j, 1);
              reactionsCount++;
              break;
            }
          }
        }
      }
    }

    else if (experimentType === "decomposition") {
      // 1. H2O2 -> H2O + O2 (gas bubbles) when MnO2 catalyst is active
      if (params.catalystActive) {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          if (p.type === "H2O2" && Math.random() < 0.08) {
            p.type = "H2O";
            p.color = "rgba(147,197,253,0.3)";
            p.radius = 4;
            p.charge = 0;

            // Release oxygen gas bubble particle
            const angle = Math.random() * Math.PI * 2;
            const speed = 2.0;
            particles.push({
              id: Math.random().toString(36).substring(2, 9),
              type: "O2",
              x: p.x,
              y: p.y - 5,
              vx: Math.cos(angle) * speed,
              vy: -Math.abs(Math.sin(angle) * speed) - 1.5, // floats up
              radius: 5,
              color: "#fb7185", // oxygen color
              mass: 1.4,
              charge: 0,
            });
            reactionsCount++;
          }
        }
      }
    }

    else if (experimentType === "physical-chemical") {
      // 1. Rusting: Fe solid (plated) + free O2 gas collide -> Fe2O3 (brown, plated)
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        if (p1.type !== "Fe") continue;

        for (let j = 0; j < particles.length; j++) {
          const p2 = particles[j];
          if (p2.type !== "O2") continue;

          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < p1.radius + p2.radius + 3 && Math.random() < 0.2) {
            p1.type = "Fe2O3";
            p1.color = "#78350f"; // rust brown
            p1.isPlated = true;
            p1.vx = 0;
            p1.vy = 0;
            particles.splice(j, 1); // oxygen consumed
            reactionsCount++;
            break;
          }
        }
      }

      // 2. Burning paper: C solid (plated) + free O2 gas -> CO2 gas
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        if (p1.type !== "C") continue;

        for (let j = 0; j < particles.length; j++) {
          const p2 = particles[j];
          if (p2.type !== "O2") continue;

          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < p1.radius + p2.radius + 3 && Math.random() < 0.25) {
            // Convert carbon to gaseous CO2 which rises up
            p1.type = "CO2";
            p1.color = "#475569"; // grey smoke
            p1.isPlated = false;
            p1.radius = 5;
            p1.vx = (Math.random() - 0.5) * 2;
            p1.vy = -Math.random() * 2 - 1.0;
            particles.splice(j, 1); // consume oxygen
            reactionsCount++;
            break;
          }
        }
      }
    }

    return { reactionsCount, newPlatedMassG };
  }
}

export class ParticleEngine {
  particles: ChemistryParticle[] = [];
  width = 300;
  height = 200;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  setParticles(particles: ChemistryParticle[]): void {
    this.particles = particles;
  }

  addParticle(p: ChemistryParticle): void {
    this.particles.push(p);
  }

  clear(): void {
    this.particles = [];
  }

  update(
    deltaSec: number,
    tempK: number,
    voltage = 0,
    options: {
      experimentType?: "titration" | "electrolysis" | "equilibrium" | "kinetics" | "water-hardness" | "gas-laws" | "calorimetry" | "crystallization" | "natural-indicators" | "acid-metal" | "acid-carbonate" | "states-of-matter" | "diffusion-liquids" | "separation-mixtures" | "double-displacement" | "decomposition" | "physical-chemical";
      pH?: number;
      equilibriumConstant?: number;
      activationEnergy?: number;
      catalystActive?: boolean;
      restitution?: number;
    } = {}
  ): { momentumTransfer: number; reactionsCount: number } {
    // 1. Move particles
    for (const p of this.particles) {
      if (p.isPlated) continue;
      p.x += p.vx * deltaSec * 35; // velocity scaling factor
      p.y += p.vy * deltaSec * 35;
    }

    // 2. Electromigration if voltage > 0 (electrolysis)
    if (voltage > 0) {
      IonMigrationSystem.applyElectricField(this.particles, voltage, this.width);
    }

    // 3. Thermal velocity scaling
    EnergyTransferSystem.applyTemperatureScaling(this.particles, tempK);

    // 4. Elastic collisions with boundaries
    const { momentumTransfer } = CollisionSystem.checkWallCollisions(
      this.particles,
      this.width,
      this.height,
      options.restitution ?? 0.98
    );

    // 5. Elastic collisions between particles
    CollisionSystem.checkParticleCollisions(this.particles, options.restitution ?? 1.0);

    // 6. Process chemical reactions
    let reactionsCount = 0;
    if (options.experimentType) {
      const rx = ReactionEventSystem.processReactions(this.particles, options.experimentType, {
        pH: options.pH,
        equilibriumConstant: options.equilibriumConstant,
        activationEnergy: options.activationEnergy,
        catalystActive: options.catalystActive
      });
      reactionsCount = rx.reactionsCount;
    }

    return { momentumTransfer, reactionsCount };
  }
}
