"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export type StudyCategory =
  | "vibrations"
  | "vsepr"
  | "conformations"
  | "orbitals"
  | "sandbox"
  | "symmetry"
  | "reactions"
  | "solidstate"
  | "nanostructures";

interface AtomData {
  element: string;
  pos: [number, number, number];
  name?: string;
}

interface VibrationMode {
  name: string;
  frequency: string;
  description: string;
  displacements: [number, number, number][];
}

interface OrbitalLobe {
  type: "positive" | "negative" | "lonepair";
  pos: [number, number, number];
  scale: [number, number, number];
}

export interface MoleculeData {
  id: string;
  name: string;
  formula: string;
  category: StudyCategory;
  description: string;
  symmetryGroup: string;
  atoms: AtomData[];
  bonds: [number, number][];
  modes?: VibrationMode[];
  orbitalLobes?: OrbitalLobe[];
  isCustom?: boolean;
  symmetryAxes?: { dir: [number, number, number]; label: string }[];
  symmetryPlanes?: { normal: [number, number, number]; label: string }[];
}

interface Props {
  molecule: MoleculeData;
  activeModeIndex: number;
  vibrationActive: boolean;
  vibrationScale: number;
  vibrationSpeed: number;
  showGrid: boolean;
  showAxes: boolean;
  autoRotate: boolean;
  conformationState?: string; // "staggered" | "eclipsed" | "chair" | "boat" | "anti" | "gauche"
  showSymmetry?: boolean;
  showLatticeOutline?: boolean;
}


// Atom color & radius map
const ATOM_STYLES: Record<string, { color: string; radius: number }> = {
  H:  { color: "#f1f5f9", radius: 0.32 }, // White/Light Grey
  C:  { color: "#475569", radius: 0.52 }, // Dark Grey
  O:  { color: "#ef4444", radius: 0.48 }, // Red
  N:  { color: "#3b82f6", radius: 0.46 }, // Blue
  F:  { color: "#eab308", radius: 0.40 }, // Yellow/Orange
  Cl: { color: "#10b981", radius: 0.58 }, // Green
  B:  { color: "#ec4899", radius: 0.50 }, // Pink
  P:  { color: "#f97316", radius: 0.62 }, // Orange
  S:  { color: "#eab308", radius: 0.64 }, // Yellow
  BE: { color: "#a855f7", radius: 0.44 }, // Purple
  NA: { color: "#6366f1", radius: 0.70 }, // Purple-blue
};

export default function MolecularViewerWorkspace({
  molecule,
  activeModeIndex,
  vibrationActive,
  vibrationScale,
  vibrationSpeed,
  showGrid,
  showAxes,
  autoRotate,
  conformationState,
  showSymmetry = true,
  showLatticeOutline = true,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Track rotation locally
  const rotationRef = useRef({ x: 0.3, y: -0.4 });
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(7.5);

  useEffect(() => {
    if (!canvasRef.current || !mountRef.current) return;

    const canvas = canvasRef.current;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // ── Scene setup ──
    const scene = new THREE.Scene();
    
    // Transparent background, so CSS handles container styling
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = zoomRef.current;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    // ── Lights ──
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.75);
    dirLight1.position.set(5, 8, 5);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.25);
    dirLight2.position.set(-5, -3, -5);
    scene.add(dirLight2);

    // Specular light at camera
    const cameraLight = new THREE.PointLight(0xffffff, 0.35, 30);
    scene.add(cameraLight);

    // ── Helpers ──
    const gridHelper = new THREE.GridHelper(10, 20, 0x0ea5e9, 0x1e293b);
    gridHelper.position.y = -2.5;
    (gridHelper.material as THREE.Material).opacity = 0.15;
    (gridHelper.material as THREE.Material).transparent = true;
    scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(2);
    axesHelper.position.set(-3.5, -2, 0);
    scene.add(axesHelper);

    // ── Molecule Group Container ──
    const moleculeGroup = new THREE.Group();
    scene.add(moleculeGroup);

    // Keep track of rendered 3D objects
    const atomMeshes: THREE.Mesh[] = [];
    const bondMeshes: { mesh: THREE.Mesh; startIdx: number; endIdx: number }[] = [];
    const orbitalMeshes: THREE.Mesh[] = [];

    // Atom & Bond Geometries
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const cylinderGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 16);

    const renderMolecule = () => {
      // Clear previous elements
      atomMeshes.forEach(mesh => moleculeGroup.remove(mesh));
      bondMeshes.forEach(b => moleculeGroup.remove(b.mesh));
      orbitalMeshes.forEach(mesh => moleculeGroup.remove(mesh));
      atomMeshes.length = 0;
      bondMeshes.length = 0;
      orbitalMeshes.length = 0;

      // ── Render Atoms ──
      molecule.atoms.forEach((atom) => {
        const style = ATOM_STYLES[atom.element.toUpperCase()] || { color: "#cbd5e1", radius: 0.4 };
        
        // Atom Material: realistic shiny phone/plastic shading
        const material = new THREE.MeshPhongMaterial({
          color: new THREE.Color(style.color),
          shininess: 90,
          specular: new THREE.Color(0x333333),
        });

        const mesh = new THREE.Mesh(sphereGeometry, material);
        mesh.scale.setScalar(style.radius);
        
        // Set position (with optional conformation coordinate shifting)
        let pos = [...atom.pos];
        if (molecule.id === "ethane" && conformationState === "eclipsed") {
          // Rotate hydrogens on C2 slightly to eclipse them
          if (atom.name?.startsWith("H2")) {
            // C2 is at x = 0.77. Rotate H atoms around x-axis by 60 degrees (1.047 rad)
            const y = atom.pos[1];
            const z = atom.pos[2];
            // Eclipsed positions: match C1 hydrogen phases
            const angle = Math.PI / 3; // 60 deg shift
            const ry = y * Math.cos(angle) - z * Math.sin(angle);
            const rz = y * Math.sin(angle) + z * Math.cos(angle);
            pos = [atom.pos[0], ry, rz];
          }
        } else if (molecule.id === "cyclohexane" && conformationState === "boat") {
          // Adjust carbon / hydrogen positions to reflect boat shape
          // Simple vertical deformation of C1 and C4
          if (atom.name === "C1") pos[1] += 0.45;
          if (atom.name?.startsWith("H1")) pos[1] += 0.45;
        } else if (molecule.id === "butane") {
          // Rotate C4 and all H4 hydrogens around X-axis (C2-C3 bond)
          if (atom.name === "C4" || atom.name?.startsWith("H4")) {
            let angle = 0;
            if (conformationState === "gauche") {
              angle = (2 * Math.PI) / 3; // 120 deg
            } else if (conformationState === "eclipsed") {
              angle = Math.PI; // 180 deg
            }
            if (angle !== 0) {
              const y = atom.pos[1];
              const z = atom.pos[2];
              const ry = y * Math.cos(angle) - z * Math.sin(angle);
              const rz = y * Math.sin(angle) + z * Math.cos(angle);
              pos = [atom.pos[0], ry, rz];
            }
          }
        }

        mesh.position.set(pos[0], pos[1], pos[2]);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        moleculeGroup.add(mesh);
        atomMeshes.push(mesh);
      });

      // ── Render Bonds ──
      molecule.bonds.forEach(([startIdx, endIdx]) => {
        const startAtom = atomMeshes[startIdx];
        const endAtom = atomMeshes[endIdx];
        if (!startAtom || !endAtom) return;

        // Shiny steel metal bond material
        const material = new THREE.MeshPhongMaterial({
          color: 0x94a3b8,
          shininess: 70,
          specular: 0x222222,
        });

        const mesh = new THREE.Mesh(cylinderGeometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        moleculeGroup.add(mesh);
        bondMeshes.push({ mesh, startIdx, endIdx });
      });

      // ── Render Orbitals (if present) ──
      if (molecule.orbitalLobes) {
        molecule.orbitalLobes.forEach((lobe) => {
          let color = lobe.type === "positive" ? 0xef4444 : 0x3b82f6; // Red (pos), Blue (neg)
          if (lobe.type === "lonepair") {
            color = 0xeab308; // Yellow/orange for lone pair
          }
          
          // Semi-transparent glassmorphic material representing electron cloud probability wave phase
          const material = new THREE.MeshPhysicalMaterial({
            color,
            transparent: true,
            opacity: lobe.type === "lonepair" ? 0.65 : 0.42,
            roughness: 0.15,
            metalness: 0.1,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            side: THREE.DoubleSide,
            depthWrite: false,
          });

          const mesh = new THREE.Mesh(sphereGeometry, material);
          mesh.position.set(lobe.pos[0], lobe.pos[1], lobe.pos[2]);
          mesh.scale.set(lobe.scale[0], lobe.scale[1], lobe.scale[2]);

          // Orient lone pair lobes along their position direction
          if (lobe.type === "lonepair" && (lobe.pos[0] !== 0 || lobe.pos[1] !== 0 || lobe.pos[2] !== 0)) {
            const dir = new THREE.Vector3(lobe.pos[0], lobe.pos[1], lobe.pos[2]).normalize();
            const alignAxis = new THREE.Vector3(0, 0, 1);
            mesh.quaternion.setFromUnitVectors(alignAxis, dir);
          }

          moleculeGroup.add(mesh);
          orbitalMeshes.push(mesh);
        });
      }

      // ── Draw Symmetry Elements (planes and axes) ──
      if (showSymmetry) {
        if (molecule.symmetryAxes) {
          molecule.symmetryAxes.forEach((axis) => {
            const dir = new THREE.Vector3(...axis.dir).normalize();
            const points = [
              dir.clone().multiplyScalar(-3),
              dir.clone().multiplyScalar(3)
            ];
            const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
            const lineMat = new THREE.LineDashedMaterial({
              color: 0x22d3ee, // Cyan for symmetry axis
              dashSize: 0.15,
              gapSize: 0.1,
            });
            const line = new THREE.Line(lineGeom, lineMat);
            line.computeLineDistances();
            moleculeGroup.add(line);
            orbitalMeshes.push(line as any);
          });
        }

        if (molecule.symmetryPlanes) {
          molecule.symmetryPlanes.forEach((plane) => {
            const normal = new THREE.Vector3(...plane.normal).normalize();
            const planeGeom = new THREE.PlaneGeometry(3.2, 3.2);
            const planeMat = new THREE.MeshBasicMaterial({
              color: 0x10b981, // Emerald green for mirror plane
              transparent: true,
              opacity: 0.22,
              side: THREE.DoubleSide,
              depthWrite: false,
            });
            const planeMesh = new THREE.Mesh(planeGeom, planeMat);
            const zAxis = new THREE.Vector3(0, 0, 1);
            planeMesh.quaternion.setFromUnitVectors(zAxis, normal);
            
            moleculeGroup.add(planeMesh);
            orbitalMeshes.push(planeMesh as any);
          });
        }
      }

      // ── Draw Lattice Bounding Wireframe (Solid State) ──
      if (showLatticeOutline && molecule.category === "solidstate") {
        const size = molecule.id === "solid_nacl" ? 2.4 : 2.0;
        const boxGeom = new THREE.BoxGeometry(size, size, size);
        const edges = new THREE.EdgesGeometry(boxGeom);
        const lineBox = new THREE.LineSegments(
          edges,
          new THREE.LineBasicMaterial({ color: 0x22d3ee, linewidth: 2 })
        );
        moleculeGroup.add(lineBox);
        orbitalMeshes.push(lineBox as any);
      }

      // Re-center molecule group based on bounding box
      const box = new THREE.Box3().setFromObject(moleculeGroup);
      const center = new THREE.Vector3();
      box.getCenter(center);
      
      // Shift child objects back so the group rotating axis remains centered
      moleculeGroup.children.forEach((child) => {
        child.position.sub(center);
      });
    };

    renderMolecule();

    // ── Resize handler ──
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // ── Mouse Drag event listeners ──
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;
      
      rotationRef.current.y += deltaX * 0.008;
      rotationRef.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, rotationRef.current.x + deltaY * 0.008));
      
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomRef.current = Math.max(3, Math.min(18, zoomRef.current + e.deltaY * 0.006));
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("wheel", handleWheel, { passive: false });

    // ── Animation Loop ──
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();
      
      // Sync camera distance
      camera.position.z = zoomRef.current;
      cameraLight.position.copy(camera.position);

      // Handle visibility of helpers
      gridHelper.visible = showGrid;
      axesHelper.visible = showAxes;

      // Handle custom user drag rotation or automatic slow rotation
      if (isDraggingRef.current) {
        moleculeGroup.rotation.y = rotationRef.current.y;
        moleculeGroup.rotation.x = rotationRef.current.x;
      } else {
        if (autoRotate) {
          rotationRef.current.y += 0.004;
        }
        moleculeGroup.rotation.y = rotationRef.current.y;
        moleculeGroup.rotation.x = rotationRef.current.x;
      }

      // ── Animate Vibrations ──
      const mode = molecule.modes?.[activeModeIndex];
      const hasVib = vibrationActive && mode && mode.displacements.length === molecule.atoms.length;

      molecule.atoms.forEach((atom, idx) => {
        const mesh = atomMeshes[idx];
        if (!mesh) return;

        // Default position (pre-calculated offset for center offset)
        let pos = [...atom.pos];
        if (molecule.id === "ethane" && conformationState === "eclipsed") {
          if (atom.name?.startsWith("H2")) {
            const y = atom.pos[1];
            const z = atom.pos[2];
            const angle = Math.PI / 3;
            pos = [atom.pos[0], y * Math.cos(angle) - z * Math.sin(angle), y * Math.sin(angle) + z * Math.cos(angle)];
          }
        } else if (molecule.id === "cyclohexane" && conformationState === "boat") {
          if (atom.name === "C1") pos[1] += 0.45;
          if (atom.name?.startsWith("H1")) pos[1] += 0.45;
        } else if (molecule.id === "butane") {
          if (atom.name === "C4" || atom.name?.startsWith("H4")) {
            let angle = 0;
            if (conformationState === "gauche") {
              angle = (2 * Math.PI) / 3;
            } else if (conformationState === "eclipsed") {
              angle = Math.PI;
            }
            if (angle !== 0) {
              const y = atom.pos[1];
              const z = atom.pos[2];
              const ry = y * Math.cos(angle) - z * Math.sin(angle);
              const rz = y * Math.sin(angle) + z * Math.cos(angle);
              pos = [atom.pos[0], ry, rz];
            }
          }
        }

        // Subtract center to match centering offset done in renderMolecule
        const box = new THREE.Box3().setFromObject(moleculeGroup);
        const center = new THREE.Vector3();
        box.getCenter(center);

        // Apply vibration sine-displacement along the active mode vectors
        if (hasVib) {
          const amp = 0.28 * vibrationScale;
          const speedFactor = 12 * vibrationSpeed;
          const disp = mode.displacements[idx];
          if (disp) {
            const factor = Math.sin(elapsed * speedFactor);
            mesh.position.set(
              pos[0] + disp[0] * amp * factor,
              pos[1] + disp[1] * amp * factor,
              pos[2] + disp[2] * amp * factor
            );
          }
        } else {
          mesh.position.set(pos[0], pos[1], pos[2]);
        }
      });

      // ── Update Bonds to match atom displacement ──
      bondMeshes.forEach(({ mesh, startIdx, endIdx }) => {
        const startAtom = atomMeshes[startIdx];
        const endAtom = atomMeshes[endIdx];
        if (!startAtom || !endAtom) return;

        const A = startAtom.position;
        const B = endAtom.position;

        // Direction vector from atom A to atom B
        const dir = new THREE.Vector3().subVectors(B, A);
        const len = dir.length();
        dir.normalize();

        // Position cylinder at midpoint
        mesh.position.copy(A).addScaledVector(dir, len * 0.5);
        mesh.scale.set(1, len, 1);

        // Quaternion alignment (Y-axis points along bond direction)
        const alignAxis = new THREE.Vector3(0, 1, 0);
        mesh.quaternion.setFromUnitVectors(alignAxis, dir);
      });

      renderer.render(scene, camera);
    };

    animate();

    // ── Cleanup ──
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("wheel", handleWheel);
      
      // Dispose geometry and material
      sphereGeometry.dispose();
      cylinderGeometry.dispose();
      atomMeshes.forEach((mesh) => {
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          mesh.material.dispose();
        }
      });
      bondMeshes.forEach(({ mesh }) => {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
      orbitalMeshes.forEach((mesh) => {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [molecule, activeModeIndex, vibrationActive, vibrationScale, vibrationSpeed, showGrid, showAxes, autoRotate, conformationState, showSymmetry, showLatticeOutline]);

  return (
    <div ref={mountRef} className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <canvas ref={canvasRef} className="w-full h-full block" />
      
      {/* 3D Telemetry Corner overlays */}
      <div className="absolute top-3 left-4 flex flex-col gap-0.5 text-[8px] font-black tracking-widest text-cyan-400/50 uppercase select-none font-mono pointer-events-none">
        <div>COORDINATES: DE-OC3D</div>
        <div>RENDER_MODE: THREE_WEBGL</div>
      </div>
      <div className="absolute bottom-3 right-4 flex flex-col gap-0.5 text-[8px] font-black tracking-widest text-cyan-400/50 uppercase select-none font-mono text-right pointer-events-none">
        <div>SHADOWMAP: ACTIVE</div>
        <div>AXES: {showAxes ? "SHOWN" : "HIDDEN"}</div>
      </div>
    </div>
  );
}
