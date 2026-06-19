import { MoleculeData, StudyCategory } from "./MolecularViewerWorkspace";

export interface SymmetryAxis {
  dir: [number, number, number];
  label: string;
}

export interface SymmetryPlane {
  normal: [number, number, number];
  label: string;
}

export interface ExtendedMoleculeData extends MoleculeData {
  category: StudyCategory | "symmetry" | "reactions" | "solidstate" | "nanostructures";
  hybridization?: string;
  idealAngles?: string;
  reactionSteps?: {
    t: number;
    atoms: { element: string; pos: [number, number, number]; name?: string }[];
  }[];
  symmetryAxes?: SymmetryAxis[];
  symmetryPlanes?: SymmetryPlane[];
}

// ── Truncated Icosahedron (C60) Coordinate Generator ──
function generateC60(): { atoms: { element: string; pos: [number, number, number]; name?: string }[]; bonds: [number, number][] } {
  const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
  const vertices: [number, number, number][] = [];

  // Permutations for (0, +/-1, +/-3phi)
  const addPerm1 = (x: number, y: number, z: number) => {
    vertices.push([x, y, z]);
    vertices.push([x, -y, z]);
    vertices.push([x, y, -z]);
    vertices.push([x, -y, -z]);
    vertices.push([z, x, y]);
    vertices.push([z, x, -y]);
    vertices.push([-z, x, y]);
    vertices.push([-z, x, -y]);
    vertices.push([y, z, x]);
    vertices.push([-y, z, x]);
    vertices.push([y, -z, x]);
    vertices.push([-y, -z, x]);
  };

  // Permutations for (+/-1, +/-(2+phi), +/-2phi)
  const addPerm2 = (x: number, y: number, z: number) => {
    vertices.push([x, y, z]);
    vertices.push([x, -y, z]);
    vertices.push([x, y, -z]);
    vertices.push([x, -y, -z]);
    vertices.push([-x, y, z]);
    vertices.push([-x, -y, z]);
    vertices.push([-x, y, -z]);
    vertices.push([-x, -y, -z]);

    vertices.push([y, z, x]);
    vertices.push([y, -z, x]);
    vertices.push([y, z, -x]);
    vertices.push([y, -z, -x]);
    vertices.push([-y, z, x]);
    vertices.push([-y, -z, x]);
    vertices.push([-y, z, -x]);
    vertices.push([-y, -z, -x]);

    vertices.push([z, x, y]);
    vertices.push([-z, x, y]);
    vertices.push([z, -x, y]);
    vertices.push([z, x, -y]);
    vertices.push([-z, -x, y]);
    vertices.push([-z, x, -y]);
    vertices.push([z, -x, -y]);
    vertices.push([-z, -x, -y]);
  };

  // Permutations for (+/-phi, +/-2, +/-(2phi+1))
  const addPerm3 = (x: number, y: number, z: number) => {
    vertices.push([x, y, z]);
    vertices.push([x, -y, z]);
    vertices.push([x, y, -z]);
    vertices.push([x, -y, -z]);
    vertices.push([-x, y, z]);
    vertices.push([-x, -y, z]);
    vertices.push([-x, y, -z]);
    vertices.push([-x, -y, -z]);

    vertices.push([y, z, x]);
    vertices.push([y, -z, x]);
    vertices.push([y, z, -x]);
    vertices.push([y, -z, -x]);
    vertices.push([-y, z, x]);
    vertices.push([-y, -z, x]);
    vertices.push([-y, z, -x]);
    vertices.push([-y, -z, -x]);

    vertices.push([z, x, y]);
    vertices.push([-z, x, y]);
    vertices.push([z, -x, y]);
    vertices.push([z, x, -y]);
    vertices.push([-z, -x, y]);
    vertices.push([-z, x, -y]);
    vertices.push([z, -x, -y]);
    vertices.push([-z, -x, -y]);
  };

  addPerm1(0, 1, 3 * phi);
  addPerm2(1, 2 + phi, 2 * phi);
  addPerm3(phi, 2, 2 * phi + 1);

  // Remove duplicate coordinates that can occur from 0 permutations
  const uniqueVertices: [number, number, number][] = [];
  const seen = new Set<string>();
  vertices.forEach(([x, y, z]) => {
    const key = `${x.toFixed(4)},${y.toFixed(4)},${z.toFixed(4)}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueVertices.push([x, y, z]);
    }
  });

  // Scale down so it fits nicely in the scene (radius around 2.2 Å)
  const scale = 0.55;
  const atoms = uniqueVertices.slice(0, 60).map((pos, idx) => ({
    element: "C",
    pos: [pos[0] * scale, pos[1] * scale, pos[2] * scale] as [number, number, number],
    name: `C${idx + 1}`
  }));

  // Build bonds based on distance
  const bonds: [number, number][] = [];
  const distCutoff = 1.6 * scale; // standard CC bond is 1.4 Å
  for (let i = 0; i < atoms.length; i++) {
    for (let j = i + 1; j < atoms.length; j++) {
      const dx = atoms[i].pos[0] - atoms[j].pos[0];
      const dy = atoms[i].pos[1] - atoms[j].pos[1];
      const dz = atoms[i].pos[2] - atoms[j].pos[2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < distCutoff) {
        bonds.push([i, j]);
      }
    }
  }

  return { atoms, bonds };
}

// ── Graphene Coordinate Generator ──
function generateGraphene(): { atoms: { element: string; pos: [number, number, number] }[]; bonds: [number, number][] } {
  const atoms: { element: string; pos: [number, number, number] }[] = [];
  const bonds: [number, number][] = [];
  
  const ccDist = 1.42; // C-C bond length
  const w = 4;
  const h = 4;
  
  for (let r = 0; r < w; r++) {
    for (let c = 0; c < h; c++) {
      // Basis coordinates for honeycomb grid
      const xOffset = r * ccDist * Math.sqrt(3);
      const yOffset = c * ccDist * 3;
      
      const p1: [number, number, number] = [xOffset, yOffset, 0];
      const p2: [number, number, number] = [xOffset + ccDist * Math.sqrt(3) / 2, yOffset + ccDist / 2, 0];
      const p3: [number, number, number] = [xOffset + ccDist * Math.sqrt(3) / 2, yOffset + ccDist * 1.5, 0];
      const p4: [number, number, number] = [xOffset, yOffset + ccDist * 2, 0];
      
      atoms.push({ element: "C", pos: p1 });
      atoms.push({ element: "C", pos: p2 });
      atoms.push({ element: "C", pos: p3 });
      atoms.push({ element: "C", pos: p4 });
    }
  }

  // Remove overlapping atoms
  const uniqueAtoms: { element: string; pos: [number, number, number] }[] = [];
  const seen = new Set<string>();
  atoms.forEach((atom) => {
    const key = `${atom.pos[0].toFixed(2)},${atom.pos[1].toFixed(2)},${atom.pos[2].toFixed(2)}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueAtoms.push(atom);
    }
  });

  // Center the graphene sheet
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  uniqueAtoms.forEach(a => {
    minX = Math.min(minX, a.pos[0]);
    maxX = Math.max(maxX, a.pos[0]);
    minY = Math.min(minY, a.pos[1]);
    maxY = Math.max(maxY, a.pos[1]);
  });
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  uniqueAtoms.forEach(a => {
    a.pos[0] -= cx;
    a.pos[1] -= cy;
  });

  // Calculate bonds
  const bondCutoff = 1.55;
  for (let i = 0; i < uniqueAtoms.length; i++) {
    for (let j = i + 1; j < uniqueAtoms.length; j++) {
      const dx = uniqueAtoms[i].pos[0] - uniqueAtoms[j].pos[0];
      const dy = uniqueAtoms[i].pos[1] - uniqueAtoms[j].pos[1];
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < bondCutoff) {
        bonds.push([i, j]);
      }
    }
  }

  return { atoms: uniqueAtoms, bonds };
}

// ── Carbon Nanotube Coordinate Generator ──
function generateCNT(): { atoms: { element: string; pos: [number, number, number] }[]; bonds: [number, number][] } {
  const atoms: { element: string; pos: [number, number, number] }[] = [];
  const bonds: [number, number][] = [];
  
  const R = 1.6; // radius
  const rings = 7;
  const atomsPerRing = 10;
  const ringSpacing = 0.75;
  
  for (let j = 0; j < rings; j++) {
    const z = (j - rings / 2) * ringSpacing;
    const isOdd = j % 2 !== 0;
    
    for (let i = 0; i < atomsPerRing; i++) {
      const theta = ((i + (isOdd ? 0.5 : 0)) / atomsPerRing) * 2 * Math.PI;
      const x = R * Math.cos(theta);
      const y = R * Math.sin(theta);
      
      atoms.push({ element: "C", pos: [x, y, z] });
    }
  }

  // Calculate bonds based on distance
  const bondCutoff = 1.55;
  for (let i = 0; i < atoms.length; i++) {
    for (let j = i + 1; j < atoms.length; j++) {
      const dx = atoms[i].pos[0] - atoms[j].pos[0];
      const dy = atoms[i].pos[1] - atoms[j].pos[1];
      const dz = atoms[i].pos[2] - atoms[j].pos[2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < bondCutoff) {
        bonds.push([i, j]);
      }
    }
  }

  return { atoms, bonds };
}

const c60Data = generateC60();
const grapheneData = generateGraphene();
const cntData = generateCNT();

export const MOLECULES_DB: Record<string, ExtendedMoleculeData> = {
  // ── Vibrational Spectroscopy ──
  water: {
    id: "water",
    name: "Water",
    formula: "H₂O",
    category: "vibrations",
    symmetryGroup: "C₂v",
    description: "Water has two bonding pairs and two lone pairs forming a bent geometry. It has 3 normal modes of vibration, all of which are IR-active.",
    atoms: [
      { element: "O", pos: [0, 0, 0.12], name: "O" },
      { element: "H", pos: [0, 0.76, -0.48], name: "H1" },
      { element: "H", pos: [0, -0.76, -0.48], name: "H2" }
    ],
    bonds: [[0, 1], [0, 2]],
    modes: [
      {
        name: "Symmetric Stretch (ν₁)",
        frequency: "3657 cm⁻¹",
        description: "Both O-H bonds stretch and contract in phase. The molecular dipole moment changes along the vertical symmetry axis, making this mode IR-active.",
        displacements: [[0, 0, 0.05], [0, 0.45, -0.32], [0, -0.45, -0.32]]
      },
      {
        name: "Bending / Scissoring (ν₂)",
        frequency: "1595 cm⁻¹",
        description: "The H-O-H bond angle opens and closes. This changes the dipole moment along the vertical axis and is a key IR-active mode.",
        displacements: [[0, 0, -0.07], [0, -0.38, -0.22], [0, 0.38, -0.22]]
      },
      {
        name: "Asymmetric Stretch (ν₃)",
        frequency: "3756 cm⁻¹",
        description: "One O-H bond stretches while the other contracts. The dipole moment changes horizontally, creating a strong IR absorption peak.",
        displacements: [[0, 0.04, 0], [0, 0.48, 0.30], [0, 0.48, -0.30]]
      }
    ]
  },
  
  co2: {
    id: "co2",
    name: "Carbon Dioxide",
    formula: "CO₂",
    category: "vibrations",
    symmetryGroup: "D∞h",
    description: "A linear triatomic molecule. The symmetric stretch causes no change in net dipole moment and is IR-inactive (Raman active). The asymmetric stretch and bend are IR-active.",
    atoms: [
      { element: "C", pos: [0, 0, 0], name: "C" },
      { element: "O", pos: [-1.16, 0, 0], name: "O1" },
      { element: "O", pos: [1.16, 0, 0], name: "O2" }
    ],
    bonds: [[0, 1], [0, 2]],
    modes: [
      {
        name: "Symmetric Stretch (ν₁)",
        frequency: "1388 cm⁻¹",
        description: "Both oxygen atoms vibrate outward in opposite directions. The net dipole moment remains zero at all points; hence, this mode is IR-inactive.",
        displacements: [[0, 0, 0], [-0.35, 0, 0], [0.35, 0, 0]]
      },
      {
        name: "Degenerate Bending (ν₂)",
        frequency: "667 cm⁻¹",
        description: "The molecule bends vertically (or horizontally). This creates an oscillating perpendicular dipole moment, absorbing strongly in the infrared.",
        displacements: [[0, 0.45, 0], [0, -0.22, 0], [0, -0.22, 0]]
      },
      {
        name: "Asymmetric Stretch (ν₃)",
        frequency: "2349 cm⁻¹",
        description: "The carbon atom vibrates in one direction while both oxygens vibrate in the opposite direction. This produces a massive change in dipole moment.",
        displacements: [[0.35, 0, 0], [-0.175, 0, 0], [-0.175, 0, 0]]
      }
    ]
  },

  formaldehyde: {
    id: "formaldehyde",
    name: "Formaldehyde",
    formula: "H₂CO",
    category: "vibrations",
    symmetryGroup: "C₂v",
    description: "Planar organic molecule with strong carbonyl stretching and C-H vibrations.",
    atoms: [
      { element: "C", pos: [0, 0, -0.15], name: "C" },
      { element: "O", pos: [0, 0, 1.05], name: "O" },
      { element: "H", pos: [0, 0.94, -0.70], name: "H1" },
      { element: "H", pos: [0, -0.94, -0.70], name: "H2" }
    ],
    bonds: [[0, 1], [0, 2], [0, 3]],
    modes: [
      {
        name: "Carbonyl C=O Stretch",
        frequency: "1746 cm⁻¹",
        description: "The carbon-oxygen double bond stretches. Highly characteristic organic IR fingerprint peak.",
        displacements: [[0, 0, -0.15], [0, 0, 0.40], [0, 0, -0.1], [0, 0, -0.1]]
      },
      {
        name: "C-H Symmetric Stretch",
        frequency: "2780 cm⁻¹",
        description: "Both C-H bonds stretch outward simultaneously.",
        displacements: [[0, 0, 0.05], [0, 0, -0.02], [0, 0.40, -0.28], [0, -0.40, -0.28]]
      },
      {
        name: "CH₂ Scissoring Bending",
        frequency: "1500 cm⁻¹",
        description: "The H-C-H angle closes, resembling scissors.",
        displacements: [[0, 0, -0.05], [0, 0, 0], [0, -0.36, -0.1], [0, 0.36, -0.1]]
      },
      {
        name: "CH₂ Asymmetric Stretch",
        frequency: "2843 cm⁻¹",
        description: "One C-H stretches while the other contracts.",
        displacements: [[0, 0, 0], [0, 0, 0], [0, 0.42, 0.28], [0, 0.42, -0.28]]
      }
    ]
  },

  // ── VSEPR Presets ──
  becl2: {
    id: "becl2",
    name: "Beryllium Chloride",
    formula: "BeCl₂",
    category: "vsepr",
    symmetryGroup: "D∞h",
    hybridization: "sp",
    idealAngles: "180°",
    description: "AX₂ geometry. Beryllium has two valence electrons forming two single bonds with no lone pairs, placing ligands in opposite directions.",
    atoms: [
      { element: "Be", pos: [0, 0, 0] },
      { element: "Cl", pos: [0, 0, 1.4] },
      { element: "Cl", pos: [0, 0, -1.4] }
    ],
    bonds: [[0, 1], [0, 2]]
  },

  bf3: {
    id: "bf3",
    name: "Boron Trifluoride",
    formula: "BF₃",
    category: "vsepr",
    symmetryGroup: "D₃h",
    hybridization: "sp²",
    idealAngles: "120°",
    description: "AX₃ geometry. Three bonding pairs repelling each other equally in a single plane, creating trigonal planar geometry.",
    atoms: [
      { element: "B", pos: [0, 0, 0] },
      { element: "F", pos: [0, 1.4, 0] },
      { element: "F", pos: [1.21, -0.7, 0] },
      { element: "F", pos: [-1.21, -0.7, 0] }
    ],
    bonds: [[0, 1], [0, 2], [0, 3]]
  },

  sf6: {
    id: "sf6",
    name: "Sulfur Hexafluoride",
    formula: "SF₆",
    category: "vsepr",
    symmetryGroup: "Oh",
    hybridization: "sp³d²",
    idealAngles: "90°",
    description: "AX₆ geometry. Six fluorine ligands symmetrically arranged at the corners of an octahedron around the sulfur atom.",
    atoms: [
      { element: "S", pos: [0, 0, 0] },
      { element: "F", pos: [0, 0, 1.45] },
      { element: "F", pos: [0, 0, -1.45] },
      { element: "F", pos: [1.45, 0, 0] },
      { element: "F", pos: [-1.45, 0, 0] },
      { element: "F", pos: [0, 1.45, 0] },
      { element: "F", pos: [0, -1.45, 0] }
    ],
    bonds: [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6]]
  },

  // ── Conformations ──
  ethane: {
    id: "ethane",
    name: "Ethane",
    formula: "C₂H₆",
    category: "conformations",
    symmetryGroup: "D₃d",
    description: "Toggle between staggered (lowest energy, dihedral angle = 60°) and eclipsed (highest energy due to torsional strain, dihedral angle = 0°) conformations.",
    atoms: [
      { element: "C", pos: [-0.77, 0, 0], name: "C1" },
      { element: "C", pos: [0.77, 0, 0], name: "C2" },
      { element: "H", pos: [-1.15, 0, 1.01], name: "H1a" },
      { element: "H", pos: [-1.15, 0.87, -0.51], name: "H1b" },
      { element: "H", pos: [-1.15, -0.87, -0.51], name: "H1c" },
      { element: "H", pos: [1.15, 0, -1.01], name: "H2a" },
      { element: "H", pos: [1.15, -0.87, 0.51], name: "H2b" },
      { element: "H", pos: [1.15, 0.87, 0.51], name: "H2c" }
    ],
    bonds: [[0, 1], [0, 2], [0, 3], [0, 4], [1, 5], [1, 6], [1, 7]]
  },

  cyclohexane: {
    id: "cyclohexane",
    name: "Cyclohexane",
    formula: "C₆H₁₂",
    category: "conformations",
    symmetryGroup: "D₃d",
    description: "Studies ring strain. The chair conformation is steric strain-free, whereas the boat conformation suffers from flagpole steric interaction.",
    atoms: [
      { element: "C", pos: [0, 0.7, 0.4], name: "C1" },
      { element: "C", pos: [1.2, 0.35, -0.2], name: "C2" },
      { element: "C", pos: [1.2, -0.35, 0.2], name: "C3" },
      { element: "C", pos: [0, -0.7, -0.4], name: "C4" },
      { element: "C", pos: [-1.2, -0.35, 0.2], name: "C5" },
      { element: "C", pos: [-1.2, 0.35, -0.2], name: "C6" },
      // Hydrogens (flagged as H1 for dynamic boat deformation)
      { element: "H", pos: [0, 1.4, 0.4], name: "H1a" },
      { element: "H", pos: [0, 0.7, 1.2], name: "H1b" },
      { element: "H", pos: [1.9, 0.7, -0.2], name: "H2a" },
      { element: "H", pos: [1.2, 0.35, -1.0], name: "H2b" },
      { element: "H", pos: [1.9, -0.7, 0.2], name: "H3a" },
      { element: "H", pos: [1.2, -0.35, 1.0], name: "H3b" },
      { element: "H", pos: [0, -1.4, -0.4], name: "H4a" },
      { element: "H", pos: [0, -0.7, -1.2], name: "H4b" },
      { element: "H", pos: [-1.9, -0.7, 0.2], name: "H5a" },
      { element: "H", pos: [-1.2, -0.35, 1.0], name: "H5b" },
      { element: "H", pos: [-1.9, 0.7, -0.2], name: "H6a" },
      { element: "H", pos: [-1.2, 0.35, -1.0], name: "H6b" }
    ],
    bonds: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
      [0, 6], [0, 7], [1, 8], [1, 9], [2, 10], [2, 11],
      [3, 12], [3, 13], [4, 14], [4, 15], [5, 16], [5, 17]
    ]
  },

  butane: {
    id: "butane",
    name: "Butane",
    formula: "C₄H₁₀",
    category: "conformations",
    symmetryGroup: "C₂h",
    description: "Study anti, gauche, and eclipsed conformations. Torsional energy changes as the methyl group rotates around the central carbon-carbon bond.",
    atoms: [
      { element: "C", pos: [-2.1, 0.8, 0], name: "C1" },
      { element: "C", pos: [-0.7, 0, 0], name: "C2" },
      { element: "C", pos: [0.7, 0, 0], name: "C3" },
      { element: "C", pos: [2.1, -0.8, 0], name: "C4" },
      // H-atoms
      { element: "H", pos: [-2.1, 1.4, 0.8], name: "H1a" },
      { element: "H", pos: [-2.1, 1.4, -0.8], name: "H1b" },
      { element: "H", pos: [-2.9, 0.2, 0], name: "H1c" },
      { element: "H", pos: [-0.7, -0.6, 0.8], name: "H2a" },
      { element: "H", pos: [-0.7, -0.6, -0.8], name: "H2b" },
      { element: "H", pos: [0.7, 0.6, 0.8], name: "H3a" },
      { element: "H", pos: [0.7, 0.6, -0.8], name: "H3b" },
      { element: "H", pos: [2.1, -1.4, 0.8], name: "H4a" },
      { element: "H", pos: [2.1, -1.4, -0.8], name: "H4b" },
      { element: "H", pos: [2.9, -0.2, 0], name: "H4c" }
    ],
    bonds: [
      [0, 1], [1, 2], [2, 3],
      [0, 4], [0, 5], [0, 6],
      [1, 7], [1, 8],
      [2, 9], [2, 10],
      [3, 11], [3, 12], [3, 13]
    ]
  },

  // ── Electronic Structure: Atomic Orbitals (AOs) ──
  "1s": {
    id: "1s",
    name: "1s Orbital",
    formula: "ψ₁₀₀",
    category: "orbitals",
    symmetryGroup: "Kh",
    description: "Spherically symmetric s-orbital. Zero nodes, constant sign phase wavefunction throughout.",
    atoms: [{ element: "BE", pos: [0, 0, 0], name: "Nucleus" }],
    bonds: [],
    orbitalLobes: [
      { type: "positive", pos: [0, 0, 0], scale: [1.6, 1.6, 1.6] }
    ]
  },

  "2pz": {
    id: "2pz",
    name: "2pz Orbital",
    formula: "ψ₂₁₀",
    category: "orbitals",
    symmetryGroup: "D∞h",
    description: "Dumbbell-shaped p-orbital aligned along the z-axis. The xy plane is a planar nodal surface separating positive and negative phases.",
    atoms: [{ element: "BE", pos: [0, 0, 0], name: "Nucleus" }],
    bonds: [],
    orbitalLobes: [
      { type: "positive", pos: [0, 0, 0.85], scale: [0.85, 0.85, 1.25] },
      { type: "negative", pos: [0, 0, -0.85], scale: [0.85, 0.85, 1.25] }
    ]
  },

  "3dz2": {
    id: "3dz2",
    name: "3dz² Orbital",
    formula: "ψ₃₂₀",
    category: "orbitals",
    symmetryGroup: "D∞h",
    description: "Aligns along the z-axis, with a torus-shaped nodal ring in the xy plane.",
    atoms: [{ element: "BE", pos: [0, 0, 0], name: "Nucleus" }],
    bonds: [],
    orbitalLobes: [
      { type: "positive", pos: [0, 0, 0.95], scale: [0.75, 0.75, 1.15] },
      { type: "positive", pos: [0, 0, -0.95], scale: [0.75, 0.75, 1.15] },
      // Ring lobes (representing the torus donut)
      { type: "negative", pos: [0.55, 0, 0], scale: [0.45, 0.45, 0.45] },
      { type: "negative", pos: [-0.55, 0, 0], scale: [0.45, 0.45, 0.45] },
      { type: "negative", pos: [0, 0.55, 0], scale: [0.45, 0.45, 0.45] },
      { type: "negative", pos: [0, -0.55, 0], scale: [0.45, 0.45, 0.45] }
    ]
  },

  "3dx2-y2": {
    id: "3dx2-y2",
    name: "3dx²-y² Orbital",
    formula: "ψ₃₂₂",
    category: "orbitals",
    symmetryGroup: "D₄h",
    description: "Four lobes lying in the xy plane, aligned along the x (positive phase) and y (negative phase) axes.",
    atoms: [{ element: "BE", pos: [0, 0, 0], name: "Nucleus" }],
    bonds: [],
    orbitalLobes: [
      { type: "positive", pos: [0.85, 0, 0], scale: [1.15, 0.75, 0.75] },
      { type: "positive", pos: [-0.85, 0, 0], scale: [1.15, 0.75, 0.75] },
      { type: "negative", pos: [0, 0.85, 0], scale: [0.75, 1.15, 0.75] },
      { type: "negative", pos: [0, -0.85, 0], scale: [0.75, 1.15, 0.75] }
    ]
  },

  "sp3-hybrid": {
    id: "sp3-hybrid",
    name: "sp³ Hybrid Lobe",
    formula: "s + px + py + pz",
    category: "orbitals",
    symmetryGroup: "C₃v",
    description: "Asymmetric hybrid orbital resulting from mathematical mixing of one s and three p orbitals, allowing tetrahedral bonding directions.",
    atoms: [{ element: "BE", pos: [0, 0, 0], name: "Carbon" }],
    bonds: [],
    orbitalLobes: [
      { type: "positive", pos: [0.5, 0.5, 0.5], scale: [0.7, 1.0, 1.0] },
      { type: "negative", pos: [-0.25, -0.25, -0.25], scale: [0.4, 0.4, 0.4] }
    ]
  },

  // ── Molecular Symmetry & Point Groups ──
  sym_water: {
    id: "sym_water",
    name: "Water Symmetry (C₂v)",
    formula: "H₂O",
    category: "symmetry",
    symmetryGroup: "C₂v",
    description: "Water contains a C₂ principal axis of rotation and two perpendicular vertical mirror planes σ_v(xz) and σ_v(yz).",
    atoms: [
      { element: "O", pos: [0, 0, 0.12], name: "O" },
      { element: "H", pos: [0, 0.76, -0.48], name: "H1" },
      { element: "H", pos: [0, -0.76, -0.48], name: "H2" }
    ],
    bonds: [[0, 1], [0, 2]],
    symmetryAxes: [
      { dir: [0, 0, 1], label: "C₂ Axis" }
    ],
    symmetryPlanes: [
      { normal: [1, 0, 0], label: "σ_v (yz)" },
      { normal: [0, 1, 0], label: "σ_v (xz)" }
    ]
  },

  sym_nh3: {
    id: "sym_nh3",
    name: "Ammonia Symmetry (C₃v)",
    formula: "NH₃",
    category: "symmetry",
    symmetryGroup: "C₃v",
    description: "Ammonia belongs to the C₃v point group. It contains a C₃ rotational axis and three vertical planes of symmetry matching each N-H bond.",
    atoms: [
      { element: "N", pos: [0, 0, 0.38], name: "N" },
      { element: "H", pos: [0, 0.94, -0.13], name: "H1" },
      { element: "H", pos: [-0.81, -0.47, -0.13], name: "H2" },
      { element: "H", pos: [0.81, -0.47, -0.13], name: "H3" }
    ],
    bonds: [[0, 1], [0, 2], [0, 3]],
    symmetryAxes: [
      { dir: [0, 0, 1], label: "C₃ Axis" }
    ],
    symmetryPlanes: [
      { normal: [1, 0, 0], label: "σ_v (1)" },
      { normal: [-0.5, 0.866, 0], label: "σ_v (2)" },
      { normal: [-0.5, -0.866, 0], label: "σ_v (3)" }
    ]
  },

  // ── Solid State Lattices ──
  solid_sc: {
    id: "solid_sc",
    name: "Simple Cubic (SC)",
    formula: "Polonium lattice",
    category: "solidstate",
    symmetryGroup: "Pm3m",
    description: "One atom at each of the 8 corners of the cubic unit cell. Coordination number = 6. Atom share packing density = 52%.",
    atoms: [
      { element: "NA", pos: [-1, -1, -1], name: "Corner" },
      { element: "NA", pos: [-1, -1, 1], name: "Corner" },
      { element: "NA", pos: [-1, 1, -1], name: "Corner" },
      { element: "NA", pos: [-1, 1, 1], name: "Corner" },
      { element: "NA", pos: [1, -1, -1], name: "Corner" },
      { element: "NA", pos: [1, -1, 1], name: "Corner" },
      { element: "NA", pos: [1, 1, -1], name: "Corner" },
      { element: "NA", pos: [1, 1, 1], name: "Corner" }
    ],
    bonds: [
      [0, 1], [0, 2], [0, 4], [1, 3], [1, 5],
      [2, 3], [2, 6], [3, 7], [4, 5], [4, 6], [5, 7], [6, 7]
    ]
  },

  solid_bcc: {
    id: "solid_bcc",
    name: "Body-Centered Cubic (BCC)",
    formula: "Fe / W lattice",
    category: "solidstate",
    symmetryGroup: "Im3m",
    description: "Atoms at each of the 8 corners of the cube plus one atom at the center. Coordination number = 8. Packing density = 68%.",
    atoms: [
      { element: "C", pos: [0, 0, 0], name: "Center" }, // Color atom differently
      { element: "NA", pos: [-1, -1, -1], name: "Corner" },
      { element: "NA", pos: [-1, -1, 1], name: "Corner" },
      { element: "NA", pos: [-1, 1, -1], name: "Corner" },
      { element: "NA", pos: [-1, 1, 1], name: "Corner" },
      { element: "NA", pos: [1, -1, -1], name: "Corner" },
      { element: "NA", pos: [1, -1, 1], name: "Corner" },
      { element: "NA", pos: [1, 1, -1], name: "Corner" },
      { element: "NA", pos: [1, 1, 1], name: "Corner" }
    ],
    bonds: [
      [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8],
      [1, 2], [1, 3], [1, 5], [2, 4], [2, 6], [3, 4], [3, 7], [4, 8],
      [5, 6], [5, 7], [6, 8], [7, 8]
    ]
  },

  solid_nacl: {
    id: "solid_nacl",
    name: "Sodium Chloride Lattice (NaCl)",
    formula: "NaCl",
    category: "solidstate",
    symmetryGroup: "Fm3m",
    description: "A 3D chess-board grid showing alternating Na⁺ (purple) and Cl⁻ (green) ions. Interlocking Face-Centered Cubic (FCC) lattices.",
    atoms: (() => {
      const atomsList: { element: string; pos: [number, number, number]; name: string }[] = [];
      // Generate 3x3x3 grid
      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          for (let z = -1; z <= 1; z++) {
            const isNa = (x + y + z) % 2 === 0;
            atomsList.push({
              element: isNa ? "NA" : "CL",
              pos: [x * 1.2, y * 1.2, z * 1.2],
              name: isNa ? "Na+" : "Cl-"
            });
          }
        }
      }
      return atomsList;
    })(),
    bonds: (() => {
      const bondsList: [number, number][] = [];
      // Connect immediate neighbors (distance exactly 1.2 Å)
      for (let i = 0; i < 27; i++) {
        for (let j = i + 1; j < 27; j++) {
          // Calculate distance squared in grid coordinates
          const dx = Math.round(Math.abs(i % 3 - j % 3));
          const dy = Math.round(Math.abs(Math.floor(i / 3) % 3 - Math.floor(j / 3) % 3));
          const dz = Math.round(Math.abs(Math.floor(i / 9) - Math.floor(j / 9)));
          if (dx + dy + dz === 1) {
            bondsList.push([i, j]);
          }
        }
      }
      return bondsList;
    })()
  },

  // ── Nanostructures ──
  nano_c60: {
    id: "nano_c60",
    name: "Buckminsterfullerene (C₆₀)",
    formula: "C₆₀",
    category: "nanostructures",
    symmetryGroup: "Ih",
    description: "A spherical fullerene molecule with 60 carbon atoms forming pentagonal and hexagonal faces, closely resembling a soccer ball structure.",
    atoms: c60Data.atoms,
    bonds: c60Data.bonds
  },

  nano_graphene: {
    id: "nano_graphene",
    name: "Graphene Sheet",
    formula: "C_n",
    category: "nanostructures",
    symmetryGroup: "D₆h",
    description: "A single 2D layer of carbon atoms tightly bound in a hexagonal honeycomb lattice. Exceptionally thin, strong, and highly conductive.",
    atoms: grapheneData.atoms,
    bonds: grapheneData.bonds
  },

  nano_cnt: {
    id: "nano_cnt",
    name: "Carbon Nanotube (CNT)",
    formula: "C_n",
    category: "nanostructures",
    symmetryGroup: "D₅d",
    description: "Cylindrical fullerene structure with carbon atoms arranged in an armchair pattern, showcasing high aspect ratio and tensile strength.",
    atoms: cntData.atoms,
    bonds: cntData.bonds
  },

  // ── Organic Chemistry Reactions (SN2 Mechanism) ──
  rxn_sn2: {
    id: "rxn_sn2",
    name: "SN2 Nucleophilic Substitution",
    formula: "CH₃Br + OH⁻ → CH₃OH + Br⁻",
    category: "reactions",
    symmetryGroup: "C₃v",
    description: "Simulates the concerted SN2 mechanism. A backside attack by hydroxide (OH⁻) triggers carbon inversion (umbrella inversion) and bromide (Br⁻) departure.",
    atoms: [
      // Substrate CH3Br (at t=0)
      { element: "C", pos: [0, 0, 0], name: "C" },
      { element: "F", pos: [1.36, 0, 0], name: "Br" }, // Bromine represented as yellow-orange fluorine radius
      { element: "H", pos: [-0.48, 0.94, 0.48], name: "H1" },
      { element: "H", pos: [-0.48, -0.47, 0.81], name: "H2" },
      { element: "H", pos: [-0.48, -0.47, -0.81], name: "H3" },
      // OH- Nucleophile
      { element: "O", pos: [-3.8, 0, 0], name: "O" },
      { element: "H", pos: [-4.6, 0, 0], name: "H_n" }
    ],
    bonds: [[0, 1], [0, 2], [0, 3], [0, 4], [5, 6]],
    reactionSteps: [
      // Step 0% (Reactants separated)
      {
        t: 0.0,
        atoms: [
          { element: "C", pos: [0, 0, 0], name: "C" },
          { element: "F", pos: [1.36, 0, 0], name: "Br" },
          { element: "H", pos: [-0.48, 0.94, 0.48], name: "H1" },
          { element: "H", pos: [-0.48, -0.47, 0.81], name: "H2" },
          { element: "H", pos: [-0.48, -0.47, -0.81], name: "H3" },
          { element: "O", pos: [-3.8, 0, 0], name: "O" },
          { element: "H", pos: [-4.6, 0, 0], name: "H_n" }
        ]
      },
      // Step 25% (Approach)
      {
        t: 0.25,
        atoms: [
          { element: "C", pos: [0.03, 0, 0], name: "C" },
          { element: "F", pos: [1.44, 0, 0], name: "Br" },
          { element: "H", pos: [-0.36, 0.94, 0.48], name: "H1" },
          { element: "H", pos: [-0.36, -0.47, 0.81], name: "H2" },
          { element: "H", pos: [-0.36, -0.47, -0.81], name: "H3" },
          { element: "O", pos: [-2.5, 0, 0], name: "O" },
          { element: "H", pos: [-3.3, 0, 0], name: "H_n" }
        ]
      },
      // Step 50% (Planar Transition State)
      {
        t: 0.5,
        atoms: [
          { element: "C", pos: [0.08, 0, 0], name: "C" },
          { element: "F", pos: [1.80, 0, 0], name: "Br" }, // Stretched C-Br
          { element: "H", pos: [0.08, 1.05, 0], name: "H1" }, // Planar C-H orientation
          { element: "H", pos: [0.08, -0.525, 0.909], name: "H2" },
          { element: "H", pos: [0.08, -0.525, -0.909], name: "H3" },
          { element: "O", pos: [-1.72, 0, 0], name: "O" }, // Stretched C-O
          { element: "H", pos: [-2.52, 0, 0], name: "H_n" }
        ]
      },
      // Step 75% (Inversion and Departure)
      {
        t: 0.75,
        atoms: [
          { element: "C", pos: [-0.03, 0, 0], name: "C" },
          { element: "F", pos: [2.50, 0, 0], name: "Br" }, // Departed Br-
          { element: "H", pos: [0.36, 0.94, 0.48], name: "H1" }, // Inverted angles
          { element: "H", pos: [0.36, -0.47, 0.81], name: "H2" },
          { element: "H", pos: [0.36, -0.47, -0.81], name: "H3" },
          { element: "O", pos: [-1.44, 0, 0], name: "O" }, // Formed C-O bond
          { element: "H", pos: [-2.24, 0, 0], name: "H_n" }
        ]
      },
      // Step 100% (Products separated)
      {
        t: 1.0,
        atoms: [
          { element: "C", pos: [-0.1, 0, 0], name: "C" },
          { element: "F", pos: [3.80, 0, 0], name: "Br" },
          { element: "H", pos: [0.38, 0.94, 0.48], name: "H1" },
          { element: "H", pos: [0.38, -0.47, 0.81], name: "H2" },
          { element: "H", pos: [0.38, -0.47, -0.81], name: "H3" },
          { element: "O", pos: [-1.42, 0, 0], name: "O" },
          { element: "H", pos: [-2.22, 0, 0], name: "H_n" }
        ]
      }
    ]
  }
};
