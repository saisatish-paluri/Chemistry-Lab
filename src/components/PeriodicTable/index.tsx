"use client";

import {
  useState, useRef, useCallback, useEffect,
  startTransition, useMemo,
} from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  elements, ChemElement, ElementCategory, CATEGORY_LABELS, ELEMENT_EXTRAS,
} from "./data";
import {
  SHELL_DISTRIBUTIONS, CRYSTAL_STRUCTURES, CRYSTAL_DESCRIPTIONS,
  ELEMENT_APPLICATIONS, ELEMENT_FACTS,
} from "./element-detail-data";
import {
  ELEMENT_TRENDS, TREND_CONFIGS, TrendProperty,
} from "./element-trends-data";
import {
  ELEMENT_ISOTOPES, ELEMENT_CHEMISTRY, ELEMENT_HISTORY, ELEMENT_LABS,
} from "./element-extended-data";
import ElementTile from "./ElementTile";

// ── Category colours ─────────────────────────────────────────────────────────

const LEGEND_CATEGORIES: { cat: ElementCategory; label: string }[] = [
  { cat: "alkali-metal",          label: "Alkali Metal" },
  { cat: "alkaline-earth",        label: "Alkaline Earth" },
  { cat: "transition-metal",      label: "Transition Metal" },
  { cat: "post-transition-metal", label: "Post-Transition" },
  { cat: "metalloid",             label: "Metalloid" },
  { cat: "nonmetal",              label: "Nonmetal" },
  { cat: "halogen",               label: "Halogen" },
  { cat: "noble-gas",             label: "Noble Gas" },
  { cat: "lanthanide",            label: "Lanthanide" },
  { cat: "actinide",              label: "Actinide" },
  { cat: "unknown",               label: "Unknown" },
];

const CAT_COLOR: Record<ElementCategory, string> = {
  "alkali-metal":          "#b45309",
  "alkaline-earth":        "#c2410c",
  "transition-metal":      "#1d4ed8",
  "post-transition-metal": "#15803d",
  "metalloid":             "#0e7490",
  "nonmetal":              "#047857",
  "halogen":               "#a16207",
  "noble-gas":             "#0369a1",
  "lanthanide":            "#a21caf",
  "actinide":              "#be123c",
  "unknown":               "#475569",
};

const CAT_BG: Record<ElementCategory, string> = {
  "alkali-metal":          "rgba(253,230,138,0.55)",
  "alkaline-earth":        "rgba(254,202,202,0.55)",
  "transition-metal":      "rgba(219,234,254,0.70)",
  "post-transition-metal": "rgba(220,252,231,0.70)",
  "metalloid":             "rgba(207,250,254,0.70)",
  "nonmetal":              "rgba(209,250,229,0.70)",
  "halogen":               "rgba(254,240,138,0.65)",
  "noble-gas":             "rgba(224,242,254,0.70)",
  "lanthanide":            "rgba(250,232,255,0.65)",
  "actinide":              "rgba(255,228,230,0.65)",
  "unknown":               "rgba(241,245,249,0.80)",
};

const CAT_FACTS: Partial<Record<ElementCategory, string>> = {
  "alkali-metal":          "Highly reactive metals that form +1 ions. React vigorously with water.",
  "alkaline-earth":        "Reactive metals forming +2 ions. Essential to biology (Ca, Mg).",
  "transition-metal":      "Variable oxidation states, coloured compounds, catalytic activity.",
  "post-transition-metal": "Softer metals between transition metals and metalloids.",
  "metalloid":             "Properties intermediate between metals and non-metals. Semiconductor uses.",
  "nonmetal":              "Poor conductors. Form covalent bonds. Vital to organic chemistry.",
  "halogen":               "Highly electronegative. Form −1 ions and diatomic molecules.",
  "noble-gas":             "Full outer shells — chemically inert under normal conditions.",
  "lanthanide":            "f-block elements. Strong magnets and phosphors (REE).",
  "actinide":              "Radioactive f-block elements. Nuclear fuel cycle.",
  "unknown":               "Synthetic or insufficiently characterised — properties predicted.",
};

const PHASE_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  solid:  { label: "Solid",  bg: "rgba(219,234,254,0.65)", color: "#1d4ed8" },
  liquid: { label: "Liquid", bg: "rgba(209,250,229,0.65)", color: "#059669" },
  gas:    { label: "Gas",    bg: "rgba(250,232,255,0.65)", color: "#a21caf" },
};

const TOOLTIP_W = 244;
const TOOLTIP_H = 168;

const mainElements = elements.filter((e) => e.row <= 7);
const lanthanides  = elements.filter((e) => e.row === 8);
const actinides    = elements.filter((e) => e.row === 9);

// ── Trend colour system ───────────────────────────────────────────────────────

function lerpColor(t: number): string {
  // 0→blue, 0.5→amber, 1→red
  const clamp = Math.max(0, Math.min(1, t));
  if (clamp < 0.5) {
    const s = clamp * 2;
    const r = Math.round(59  + (251 - 59)  * s);
    const g = Math.round(130 + (191 - 130) * s);
    const b = Math.round(246 + (36  - 246) * s);
    return `rgb(${r},${g},${b})`;
  } else {
    const s = (clamp - 0.5) * 2;
    const r = Math.round(251 + (239 - 251) * s);
    const g = Math.round(191 + (68  - 191) * s);
    const b = Math.round(36  + (68  - 36)  * s);
    return `rgb(${r},${g},${b})`;
  }
}

function computeTrendColor(
  elNum: number,
  elMass: string,
  prop: TrendProperty,
): string | null {
  let val: number | undefined;
  if (prop === "atomicMass") {
    const parsed = parseFloat(elMass.replace(/[()]/g, ""));
    if (!isNaN(parsed)) val = parsed;
  } else {
    val = ELEMENT_TRENDS[elNum]?.[prop];
  }
  return val !== undefined ? val.toString() : null;
}

function getTrendRange(prop: TrendProperty): { min: number; max: number } {
  const vals: number[] = [];
  for (const el of elements) {
    let v: number | undefined;
    if (prop === "atomicMass") {
      const p = parseFloat(el.mass.replace(/[()]/g, ""));
      if (!isNaN(p)) v = p;
    } else {
      v = ELEMENT_TRENDS[el.number]?.[prop];
    }
    if (v !== undefined) vals.push(v);
  }
  return { min: Math.min(...vals), max: Math.max(...vals) };
}

function getTrendColorForTile(
  el: ChemElement,
  prop: TrendProperty,
): { bg: string; border: string } | null {
  let val: number | undefined;
  if (prop === "atomicMass") {
    const p = parseFloat(el.mass.replace(/[()]/g, ""));
    if (!isNaN(p)) val = p;
  } else {
    val = ELEMENT_TRENDS[el.number]?.[prop];
  }
  if (val === undefined) return null;
  const { min, max } = getTrendRange(prop);
  const t = max > min ? (val - min) / (max - min) : 0.5;
  const color = lerpColor(t);
  return { bg: color + "30", border: color + "70" };
}

// ── Orbital Visualization ─────────────────────────────────────────────────────

interface OrbitalRingProps {
  radius: number; tiltX: number; tiltY: number;
  speed: string; color: string; direction: "cw" | "ccw";
  opacity: number; dotSize?: number;
}

function OrbitalRing({ radius, tiltX, tiltY, speed, color, direction, opacity, dotSize = 8 }: OrbitalRingProps) {
  const size = radius * 2;
  const dotOff = dotSize / 2;
  return (
    <div style={{ position: "absolute", top: "50%", left: "50%", width: size, height: size,
      marginLeft: -radius, marginTop: -radius, transformStyle: "preserve-3d",
      transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`, pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%",
        border: `1.5px solid ${color}`, opacity }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%",
        animation: `orbit-arm-${direction} ${speed} linear infinite`, transformStyle: "preserve-3d" }}>
        <div style={{ position: "absolute", top: -dotOff, left: "50%", marginLeft: -dotOff,
          width: dotSize, height: dotSize, borderRadius: "50%", background: color,
          boxShadow: `0 0 ${dotSize + 2}px ${color}BB, 0 0 ${dotSize - 2}px ${color}` }} />
      </div>
    </div>
  );
}

interface OrbitalParams {
  tiltXs: number[]; tiltYs: number[]; speeds: string[];
  dirs: ("cw" | "ccw")[]; opacities: number[];
  nucSize: number; dotSize: number; radiiScale: number;
}

function getPeriod(el: ChemElement): number {
  if (el.row <= 7) return el.row;
  return el.row === 8 ? 6 : 7;
}

function shellCount(el: ChemElement): number {
  return Math.min(getPeriod(el), 4);
}

function deriveOrbitalParams(el: ChemElement): OrbitalParams {
  const n = el.number, col = el.col, period = getPeriod(el), cat = el.category;
  const isNobleGas = cat === "noble-gas", isFBlock = cat === "lanthanide" || cat === "actinide";
  const isAlkali = cat === "alkali-metal", isTransition = cat === "transition-metal";
  let tiltXs: number[], tiltYs: number[];
  if (isNobleGas) {
    tiltXs = [78, 48, 62, 34]; tiltYs = [0, 70, 140, 210];
  } else {
    const s1 = (n * 37 + col * 23) % 100, s2 = (n * 53 + period * 17) % 100;
    tiltXs = [55 + Math.floor(s1 * 0.30), 38 + Math.floor((s1*13+col*7)%32), 52 + Math.floor((s2*7+period*9)%25), 32 + Math.floor((s2*19+col*11)%30)];
    const yPhase = (n * 53 + col * 31) % 360;
    tiltYs = [yPhase%360, (yPhase+60+(col*7)%30)%360, (yPhase+120+(period*8)%30)%360, (yPhase+185+(n%25))%360];
  }
  const speedBase = 1.4 + period * 0.28;
  const speedFactor = isFBlock ? 1.2 : isAlkali ? 0.85 : isTransition ? 1.05 : 1.0;
  const jitter = ((n * 7 + col * 3) % 20) * 0.05;
  const speeds = [
    `${(speedBase*speedFactor+jitter*0.3).toFixed(2)}s`,
    `${(speedBase*speedFactor*1.58+jitter*0.5).toFixed(2)}s`,
    `${(speedBase*speedFactor*2.2+jitter*0.7).toFixed(2)}s`,
    `${(speedBase*speedFactor*3.0+jitter).toFixed(2)}s`,
  ];
  const dirs: ("cw"|"ccw")[] = period%2===0 ? ["ccw","cw","ccw","cw"] : ["cw","ccw","cw","ccw"];
  const opBase = isNobleGas ? 0.65 : cat==="actinide" ? 0.42 : 0.55;
  const opacities = [opBase,opBase-0.10,opBase-0.16,opBase-0.22].map(v=>Math.max(0.18,Math.min(0.75,v)));
  const nucSize = 13 + Math.min(period-1,6)*1.5;
  const dotSize = 7  + Math.min(period-1,6)*0.4;
  return { tiltXs, tiltYs, speeds, dirs, opacities, nucSize, dotSize, radiiScale: isFBlock?0.90:1.0 };
}

interface AtomVizProps { el: ChemElement; color: string; size?: number }
function AtomViz({ el, color, size = 210 }: AtomVizProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Get electron shells distribution
  const shells = SHELL_DISTRIBUTIONS[el.number] ?? [2];
  
  // Track rotation angles in a ref
  const rotationRef = useRef({ rotX: -20, rotY: 35, isDragging: false, startX: 0, startY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas DPI scale for crisp text and circles
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;

    // Generate nucleus particles in 3D: protons (color) and neutrons (neutral grey/blue)
    const nucleons: { x: number; y: number; z: number; isProton: boolean }[] = [];
    const numNucleons = Math.max(6, Math.min(el.number, 32)); // clamp to avoid cluttering
    for (let i = 0; i < numNucleons; i++) {
      const r = Math.random() * 12 + 2; 
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      nucleons.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
        isProton: i % 2 === 0
      });
    }

    const elColor = color;
    const nucNeutralColor = "rgba(100, 116, 139, 0.85)";

    const eHighlight = mixWithWhite("#22d3ee", 0.65);
    const eMidHighlight = mixWithWhite("#22d3ee", 0.18);
    const eDark = darkenColor("#22d3ee", 0.42);

    const pHighlight = mixWithWhite(elColor, 0.65);
    const pMidHighlight = mixWithWhite(elColor, 0.18);
    const pDark = darkenColor(elColor, 0.45);

    const nHighlight = mixWithWhite(nucNeutralColor, 0.65);
    const nMidHighlight = mixWithWhite(nucNeutralColor, 0.18);
    const nDark = darkenColor(nucNeutralColor, 0.45);

    let animId: number;
    let autoRotateAngle = 0;

    const render = () => {
      ctx.clearRect(0, 0, size, size);

      // Auto rotation when not dragging
      if (!rotationRef.current.isDragging) {
        autoRotateAngle += 0.006;
        rotationRef.current.rotY += 0.3;
      }

      const rx = (rotationRef.current.rotX * Math.PI) / 180;
      const ry = (rotationRef.current.rotY * Math.PI) / 180;

      // Projection parameters
      const perspective = 300;

      const project = (x: number, y: number, z: number) => {
        // Rotate around Y
        let x1 = x * Math.cos(ry) + z * Math.sin(ry);
        let z1 = -x * Math.sin(ry) + z * Math.cos(ry);
        // Rotate around X
        let y2 = y * Math.cos(rx) - z1 * Math.sin(rx);
        let z2 = y * Math.sin(rx) + z1 * Math.cos(rx);

        const scale = perspective / (perspective + z2);
        return {
          px: centerX + x1 * scale,
          py: centerY + y2 * scale,
          pz: z2,
          scale
        };
      };

      // 1. Render orbital rings as ellipses
      shells.forEach((electronCount, shellIndex) => {
        const shellRadius = 32 + shellIndex * 18;
        
        ctx.beginPath();
        const numPoints = 50; // reduced for faster path calculations
        for (let i = 0; i <= numPoints; i++) {
          const angle = (i * Math.PI * 2) / numPoints;
          const x = shellRadius * Math.cos(angle);
          const y = shellRadius * Math.sin(angle);
          const z = 0;
          
          const pt = project(x, y, z);
          if (i === 0) ctx.moveTo(pt.px, pt.py);
          else ctx.lineTo(pt.px, pt.py);
        }
        ctx.strokeStyle = `${color}22`;
        ctx.lineWidth = 1.0;
        ctx.stroke();
      });

      // 2. Gather renderable spheres (nucleons & electrons)
      const renderables: { px: number; py: number; pz: number; radius: number; fillStyle: string; isOverlay: boolean }[] = [];

      // Add nucleons
      nucleons.forEach((nuc) => {
        const pt = project(nuc.x, nuc.y, nuc.z);
        const fill = nuc.isProton 
          ? color 
          : nucNeutralColor;
        
        renderables.push({
          px: pt.px,
          py: pt.py,
          pz: pt.pz,
          radius: 5 * pt.scale,
          fillStyle: fill,
          isOverlay: false
        });
      });

      // Add electrons
      const time = Date.now() / 1000;
      shells.forEach((electronCount, shellIndex) => {
        const shellRadius = 32 + shellIndex * 18;
        const speed = (3.5 - shellIndex * 0.6) * time; 
        
        for (let i = 0; i < electronCount; i++) {
          const angle = (i * Math.PI * 2) / electronCount + speed;
          const x = shellRadius * Math.cos(angle);
          const y = shellRadius * Math.sin(angle);
          const z = 0;

          const pt = project(x, y, z);
          renderables.push({
            px: pt.px,
            py: pt.py,
            pz: pt.pz,
            radius: 3.5 * pt.scale,
            fillStyle: "#22d3ee",
            isOverlay: true
          });
        }
      });

      // 3. Sort renderables by depth (painter's algorithm)
      renderables.sort((a, b) => b.pz - a.pz);

      // 4. Draw renderables with original 3D gradients and glows
      renderables.forEach((item) => {
        ctx.beginPath();
        ctx.arc(item.px, item.py, item.radius, 0, Math.PI * 2);
        
        const gradient = ctx.createRadialGradient(
          item.px - item.radius * 0.25,
          item.py - item.radius * 0.25,
          item.radius * 0.1,
          item.px,
          item.py,
          item.radius
        );
        
        if (item.isOverlay) {
          gradient.addColorStop(0, eHighlight);
          gradient.addColorStop(0.12, eMidHighlight);
          gradient.addColorStop(0.3, "#22d3ee");
          gradient.addColorStop(1, eDark);
          ctx.shadowColor = "#22d3ee";
          ctx.shadowBlur = 6;
        } else {
          const isProton = item.fillStyle === elColor;
          const highlightColor = isProton ? pHighlight : nHighlight;
          const midHighlight = isProton ? pMidHighlight : nMidHighlight;
          const darkColor = isProton ? pDark : nDark;
          
          gradient.addColorStop(0, highlightColor);
          gradient.addColorStop(0.12, midHighlight);
          gradient.addColorStop(0.28, item.fillStyle);
          gradient.addColorStop(1, darkColor);
          ctx.shadowBlur = 0;
        }
        
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(render);
    };

    render();

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
  }, [shells, color, size]);

  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="absolute inset-0 pointer-events-none rounded-full border border-cyan-500/10"
        style={{
          background: "radial-gradient(circle, rgba(34,211,238,0.02) 0%, transparent 75%)",
          boxShadow: `0 0 20px ${color}0A`
        }} />
      <canvas
        ref={canvasRef}
        style={{ cursor: "grab", display: "block" }}
      />
    </div>
  );
}

// ── Crystal 3-D visualization ─────────────────────────────────────────────────

type CrystalPt = [number, number, number];
type CrystalEdge = [CrystalPt, CrystalPt];
const CRYSTAL_FOV=3.4, CRYSTAL_CX=100, CRYSTAL_CY=100, CRYSTAL_SCALE=66;

function projectCrystalPoints(pts:CrystalPt[],rotX:number,rotY:number){
  const rx=(rotX*Math.PI)/180, ry=(rotY*Math.PI)/180;
  const cX=Math.cos(rx),sX=Math.sin(rx),cY=Math.cos(ry),sY=Math.sin(ry);
  return pts.map(([x,y,z])=>{
    const x1=x*cY+z*sY, z1=-x*sY+z*cY, y2=y*cX-z1*sX, z2=y*sX+z1*cX;
    const f=CRYSTAL_FOV/(CRYSTAL_FOV+z2+2);
    return {px:CRYSTAL_CX+x1*f*CRYSTAL_SCALE,py:CRYSTAL_CY+y2*f*CRYSTAL_SCALE,pz:z2};
  });
}

const CUBE_CORNERS: CrystalPt[] = [[-1,-1,-1],[1,-1,-1],[-1,1,-1],[1,1,-1],[-1,-1,1],[1,-1,1],[-1,1,1],[1,1,1]];
const CUBE_EDGES: CrystalEdge[] = [
  [[-1,-1,-1],[1,-1,-1]],[[1,-1,-1],[1,1,-1]],[[1,1,-1],[-1,1,-1]],[[-1,1,-1],[-1,-1,-1]],
  [[-1,-1,1],[1,-1,1]],[[1,-1,1],[1,1,1]],[[1,1,1],[-1,1,1]],[[-1,1,1],[-1,-1,1]],
  [[-1,-1,-1],[-1,-1,1]],[[1,-1,-1],[1,-1,1]],[[1,1,-1],[1,1,1]],[[-1,1,-1],[-1,1,1]],
];
const HCP_BOTTOM: CrystalPt[] = Array.from({length:6},(_,i)=>{const a=(i*Math.PI)/3;return [Math.cos(a),Math.sin(a),-1] as CrystalPt;});
const HCP_TOP:    CrystalPt[] = Array.from({length:6},(_,i)=>{const a=(i*Math.PI)/3;return [Math.cos(a),Math.sin(a),1]  as CrystalPt;});
const HCP_MID:    CrystalPt[] = Array.from({length:3},(_,i)=>{const a=(i*(2*Math.PI))/3+Math.PI/6;return [Math.cos(a)*0.667,Math.sin(a)*0.667,0] as CrystalPt;});
const HCP_EDGES:  CrystalEdge[] = [
  ...Array.from({length:6},(_,i)=>[HCP_BOTTOM[i],HCP_BOTTOM[(i+1)%6]] as CrystalEdge),
  ...Array.from({length:6},(_,i)=>[HCP_TOP[i],   HCP_TOP[(i+1)%6]]   as CrystalEdge),
  ...Array.from({length:6},(_,i)=>[HCP_BOTTOM[i], HCP_TOP[i]]         as CrystalEdge),
];

interface CrystalSystemDef { atoms: CrystalPt[]; edges: CrystalEdge[]; accentAtoms: number[] }
function buildCrystalSystem(structure:string): CrystalSystemDef|null {
  switch(structure){
    case "Simple Cubic":  return {atoms:CUBE_CORNERS,edges:CUBE_EDGES,accentAtoms:[]};
    case "BCC":           return {atoms:[...CUBE_CORNERS,[0,0,0]],edges:CUBE_EDGES,accentAtoms:[8]};
    case "FCC":{ const f:CrystalPt[]=[[0,0,-1],[0,0,1],[0,-1,0],[0,1,0],[-1,0,0],[1,0,0]]; return {atoms:[...CUBE_CORNERS,...f],edges:CUBE_EDGES,accentAtoms:[8,9,10,11,12,13]}; }
    case "Diamond Cubic":{ const f:CrystalPt[]=[[0,0,-1],[0,0,1],[0,-1,0],[0,1,0],[-1,0,0],[1,0,0]]; const inner:CrystalPt[]=[[0.5,0.5,0.5],[-0.5,-0.5,0.5],[-0.5,0.5,-0.5],[0.5,-0.5,-0.5]]; return {atoms:[...CUBE_CORNERS,...f,...inner],edges:CUBE_EDGES,accentAtoms:[8,9,10,11,12,13,14,15,16,17]}; }
    case "HCP": return {atoms:[...HCP_BOTTOM,...HCP_TOP,...HCP_MID],edges:HCP_EDGES,accentAtoms:[12,13,14]};
    default: return null;
  }
}

function CrystalViz({structure,color}:{structure:string;color:string}) {
  const [rotX,setRotX]=useState(-18);
  const [rotY,setRotY]=useState(28);
  const dragging=useRef(false), lastMouse=useRef({x:0,y:0});
  const sys=useMemo(()=>buildCrystalSystem(structure),[structure]);
  const handleMouseDown=useCallback((e:React.MouseEvent)=>{dragging.current=true;lastMouse.current={x:e.clientX,y:e.clientY};},[]);
  const handleTouchStart=useCallback((e:React.TouchEvent)=>{if(!e.touches[0])return;dragging.current=true;lastMouse.current={x:e.touches[0].clientX,y:e.touches[0].clientY};},[]);
  useEffect(()=>{
    const onMove=(e:MouseEvent)=>{if(!dragging.current)return;const dx=e.clientX-lastMouse.current.x,dy=e.clientY-lastMouse.current.y;lastMouse.current={x:e.clientX,y:e.clientY};setRotY(r=>r+dx*0.55);setRotX(r=>r+dy*0.55);};
    const onTouch=(e:TouchEvent)=>{if(!dragging.current||!e.touches[0])return;const dx=e.touches[0].clientX-lastMouse.current.x,dy=e.touches[0].clientY-lastMouse.current.y;lastMouse.current={x:e.touches[0].clientX,y:e.touches[0].clientY};setRotY(r=>r+dx*0.55);setRotX(r=>r+dy*0.55);};
    const onUp=()=>{dragging.current=false;};
    document.addEventListener("mousemove",onMove); document.addEventListener("touchmove",onTouch,{passive:true});
    document.addEventListener("mouseup",onUp);     document.addEventListener("touchend",onUp);
    return ()=>{document.removeEventListener("mousemove",onMove);document.removeEventListener("touchmove",onTouch);document.removeEventListener("mouseup",onUp);document.removeEventListener("touchend",onUp);};
  },[]);
  if(!sys){
    return (
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14,padding:"28px 0"}}>
        <div style={{width:120,height:120,borderRadius:14,background:`${color}08`,border:`1px solid ${color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:52,color:`${color}60`}}>⬡</div>
        <p style={{fontSize:13,fontWeight:600,color:"var(--lab-text-secondary)"}}>{structure}</p>
        <p style={{fontSize:11,color:"var(--lab-text-muted)",maxWidth:260,textAlign:"center"}}>{CRYSTAL_DESCRIPTIONS[structure]??"Structure data not available"}</p>
      </div>
    );
  }
  const {atoms,edges,accentAtoms}=sys;
  const projAtoms=projectCrystalPoints(atoms,rotX,rotY);
  const edgeStarts=edges.map(e=>e[0]), edgeEnds=edges.map(e=>e[1]);
  const projStarts=projectCrystalPoints(edgeStarts,rotX,rotY);
  const projEnds  =projectCrystalPoints(edgeEnds,  rotX,rotY);
  const sortedIdxs=projAtoms.map((p,i)=>({...p,i})).sort((a,b)=>a.pz-b.pz).map(p=>p.i);
  return (
    <svg viewBox="0 0 200 200" width={200} height={200}
      style={{cursor:"grab",userSelect:"none",display:"block",touchAction:"none"}}
      onMouseDown={handleMouseDown} onTouchStart={handleTouchStart}>
      <circle cx={100} cy={100} r={96} fill={`${color}04`} stroke={`${color}10`} strokeWidth={1}/>
      {edges.map((_,i)=>(
        <line key={i} x1={projStarts[i].px} y1={projStarts[i].py}
          x2={projEnds[i].px} y2={projEnds[i].py} stroke={`${color}40`} strokeWidth={1.2}/>
      ))}
      {sortedIdxs.map(i=>{
        const {px,py,pz}=projAtoms[i];
        const isAccent=accentAtoms.includes(i);
        const depth=Math.max(0,Math.min(1,(pz+2)/4));
        const r=isAccent?8:5.5;
        return (
          <circle key={i} cx={px} cy={py} r={r}
            fill={isAccent?color:"rgba(100,116,139,0.75)"}
            stroke={isAccent?"rgba(255,255,255,0.85)":"rgba(255,255,255,0.6)"}
            strokeWidth={isAccent?1.5:1} opacity={0.55+depth*0.45}/>
        );
      })}
    </svg>
  );
}

// ── Shared UI helpers ────────────────────────────────────────────────────────

function DataRow({label,value,accent,index}:{label:string;value:string;accent?:string;index:number}){
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 14px",
      borderTop:index>0?"1px solid rgba(148,163,184,0.10)":"none",
      background:index%2===0?"rgba(248,250,252,0.65)":"rgba(255,255,255,0.5)",fontSize:12,gap:10}}>
      <span style={{color:"var(--lab-text-muted)",fontWeight:500}}>{label}</span>
      <span style={{fontWeight:700,fontVariantNumeric:"tabular-nums",color:accent??"var(--lab-text-secondary)",textAlign:"right"}}>{value}</span>
    </div>
  );
}

const SHELL_LABELS = ["K","L","M","N","O","P","Q"];

// ── Modal Tabs ────────────────────────────────────────────────────────────────

type TabId = "overview"|"atom"|"electron"|"structure"|"isotopes"|"chemistry"|"applications"|"history"|"lab";
const TAB_LABELS: Record<TabId,string> = {
  overview:"Overview", atom:"Atom", electron:"Electron", structure:"Structure",
  isotopes:"Isotopes", chemistry:"Chemistry", applications:"Applications", history:"History", lab:"Lab Links",
};

function OverviewTab({el,color,bg,shells}:{el:ChemElement;color:string;bg:string;shells:number[]}) {
  const period=getPeriod(el), extra=ELEMENT_EXTRAS[el.number];
  const phase=extra?PHASE_BADGE[extra.phaseAtRTP]:null;
  const catFact=CAT_FACTS[el.category], fact=ELEMENT_FACTS[el.number];
  const tData = ELEMENT_TRENDS[el.number];
  const rows = [
    {label:"Atomic Mass",   value:`${el.mass} u`},
    {label:"Period",        value:`${period}`},
    {label:"Group",         value:`${el.col}`},
    {label:"Category",      value:CATEGORY_LABELS[el.category], accent:color},
    ...(extra?.meltingC?[{label:"Melting Point",value:`${extra.meltingC} °C`}]:[]),
    ...(extra?.boilingC?[{label:"Boiling Point",value:`${extra.boilingC} °C`}]:[]),
    ...(tData?.electronegativity!==undefined?[{label:"Electronegativity",value:`${tData.electronegativity} (Pauling)`}]:[]),
    ...(tData?.ionizationEnergy!==undefined?[{label:"1st Ionization E",value:`${tData.ionizationEnergy} kJ/mol`}]:[]),
    ...(tData?.atomicRadius!==undefined?[{label:"Atomic Radius",value:`${tData.atomicRadius} pm`}]:[]),
    ...(tData?.density!==undefined?[{label:"Density",value:`${tData.density} g/cm³`}]:[]),
  ];
  return (
    <motion.div key="overview" initial={{opacity:0,x:14}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}}
      transition={{duration:0.22,ease:"easeInOut"}}
      style={{padding:"18px 24px 24px",display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <span style={{fontSize:11,fontWeight:700,padding:"4px 13px",borderRadius:100,background:bg,color,border:`1px solid ${color}28`}}>{CATEGORY_LABELS[el.category]}</span>
        {phase && <span style={{fontSize:11,fontWeight:700,padding:"4px 13px",borderRadius:100,background:phase.bg,color:phase.color,border:`1px solid ${phase.color}28`}}>{phase.label}</span>}
        {CRYSTAL_STRUCTURES[el.number] && <span style={{fontSize:11,fontWeight:700,padding:"4px 13px",borderRadius:100,background:"rgba(248,250,252,0.9)",color:"var(--lab-text-secondary)",border:"1px solid rgba(148,163,184,0.22)"}}>{CRYSTAL_STRUCTURES[el.number]}</span>}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        <p style={{fontSize:10,fontWeight:700,color:"var(--lab-text-muted)",textTransform:"uppercase",letterSpacing:"0.09em"}}>Shell Distribution</p>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {shells.map((count,i)=>(
            <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"5px 10px",borderRadius:8,minWidth:38,
              background:i===0?`${color}12`:"rgba(248,250,252,0.85)",border:`1px solid ${i===0?color+"28":"rgba(148,163,184,0.16)"}`}}>
              <span style={{fontSize:9,fontWeight:700,color:"var(--lab-text-muted)"}}>{SHELL_LABELS[i]}</span>
              <span style={{fontSize:16,fontWeight:900,color:i===0?color:"var(--lab-text-primary)",lineHeight:1.2}}>{count}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{borderRadius:12,border:"1px solid rgba(148,163,184,0.18)",overflow:"hidden"}}>
        {rows.map(({label,value,accent},i)=><DataRow key={label} label={label} value={value} accent={accent} index={i}/>)}
      </div>
      {(fact??catFact)&&(
        <div style={{padding:"12px 16px",borderRadius:12,background:`${color}07`,border:`1px solid ${color}16`}}>
          <p style={{fontSize:10,fontWeight:700,color,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:6}}>Interesting Fact</p>
          <p style={{fontSize:12,lineHeight:1.7,color:"var(--lab-text-secondary)"}}>{fact??catFact}</p>
        </div>
      )}
    </motion.div>
  );
}

function AtomTab({el,color,shells}:{el:ChemElement;color:string;shells:number[]}) {
  const extra=ELEMENT_EXTRAS[el.number];
  const dynamicSize = 64 + shells.length * 36;
  return (
    <motion.div key="atom" initial={{opacity:0,x:14}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}}
      transition={{duration:0.22,ease:"easeInOut"}}
      style={{padding:"20px 24px 28px",display:"flex",flexDirection:"column",gap:20,alignItems:"center"}}>
      <div style={{padding:"20px",borderRadius:18,background:`radial-gradient(ellipse at center,${color}07 0%,transparent 70%)`,border:`1px solid ${color}14`}}>
        <AtomViz el={el} color={color} size={dynamicSize}/>
      </div>
      <div style={{width:"100%"}}>
        <p style={{fontSize:10,fontWeight:700,color:"var(--lab-text-muted)",textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:10}}>Shell Distribution</p>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {shells.map((count,i)=>(
            <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"10px 16px",borderRadius:12,flex:"1 1 auto",minWidth:60,
              background:i===0?`${color}10`:"rgba(248,250,252,0.85)",border:`1px solid ${i===0?color+"28":"rgba(148,163,184,0.16)"}`}}>
              <span style={{fontSize:10,fontWeight:700,color:"var(--lab-text-muted)"}}>{SHELL_LABELS[i]} Shell</span>
              <span style={{fontSize:24,fontWeight:900,color:i===0?color:"var(--lab-text-primary)",lineHeight:1.15}}>{count}</span>
              <span style={{fontSize:9,color:"var(--lab-text-subtle)"}}>electrons</span>
            </div>
          ))}
        </div>
      </div>
      {extra?.electronConfig&&(
        <div style={{width:"100%",padding:"12px 16px",borderRadius:12,background:`${color}08`,border:`1px solid ${color}18`}}>
          <p style={{fontSize:10,fontWeight:700,color,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:6}}>Electron Configuration</p>
          <p style={{fontFamily:"monospace",fontSize:15,fontWeight:700,color:"var(--lab-text-primary)",letterSpacing:"0.02em"}}>{extra.electronConfig}</p>
        </div>
      )}
      <p style={{fontSize:10,color:"var(--lab-text-subtle)",textAlign:"center"}}>Orbital rings represent principal electron shells. Animation speed reflects relative orbital period.</p>
    </motion.div>
  );
}

// ── Electron Config Visualizer tab ────────────────────────────────────────────

const SUBSHELL_MAX:Record<string,number> = {"s":2,"p":6,"d":10,"f":14};

function parseElectronConfig(config:string): {sub:string;count:number}[] {
  // Parse a config string like "[He] 2s² 2p²" or "1s² 2s² ..."
  const clean = config.replace(/\[[^\]]+\]/g,"").trim();
  const parts = clean.split(/\s+/);
  return parts.map(part=>{
    const m = part.match(/^(\d[spdf])([\d¹²³⁴⁵⁶⁷⁸⁹¹⁰]+)/);
    if(!m) return null;
    const countStr = m[2].replace(/¹/g,"1").replace(/²/g,"2").replace(/³/g,"3")
      .replace(/⁴/g,"4").replace(/⁵/g,"5").replace(/⁶/g,"6")
      .replace(/⁷/g,"7").replace(/⁸/g,"8").replace(/⁹/g,"9").replace(/¹⁰/g,"10");
    return {sub:m[1], count:parseInt(countStr)||0};
  }).filter(Boolean) as {sub:string;count:number}[];
}

function ElectronConfigTab({el,color}:{el:ChemElement;color:string}) {
  const extra=ELEMENT_EXTRAS[el.number];
  const shells=SHELL_DISTRIBUTIONS[el.number]??[2];
  const config=extra?.electronConfig;
  const parsed = config ? parseElectronConfig(config) : [];

  return (
    <motion.div key="electron" initial={{opacity:0,x:14}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}}
      transition={{duration:0.22,ease:"easeInOut"}}
      style={{padding:"18px 24px 28px",display:"flex",flexDirection:"column",gap:16}}>

      {config && (
        <div style={{padding:"12px 16px",borderRadius:12,background:`${color}08`,border:`1px solid ${color}18`}}>
          <p style={{fontSize:10,fontWeight:700,color,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:6}}>Configuration Notation</p>
          <p style={{fontFamily:"monospace",fontSize:16,fontWeight:800,color:"var(--lab-text-primary)",letterSpacing:"0.04em"}}>{config}</p>
        </div>
      )}

      {parsed.length > 0 && (
        <div>
          <p style={{fontSize:10,fontWeight:700,color:"var(--lab-text-muted)",textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:10}}>Orbital Filling Diagram (Aufbau Principle)</p>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {parsed.map(({sub,count})=>{
              const type=sub.slice(1) as keyof typeof SUBSHELL_MAX;
              const max=SUBSHELL_MAX[type]??2;
              const boxes=Array.from({length:max/2},(_,i)=>{
                const e1 = i*2 < count ? 1 : 0;
                const e2 = i*2+1 < count ? 1 : 0;
                return {e1,e2};
              });
              return (
                <div key={sub} style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:12,fontWeight:700,color,width:28,flexShrink:0,fontFamily:"monospace"}}>{sub}</span>
                  <div style={{display:"flex",gap:4}}>
                    {boxes.map((box,bi)=>(
                      <div key={bi} style={{width:28,height:28,borderRadius:6,border:`1.5px solid ${color}40`,
                        background:`${color}08`,display:"flex",alignItems:"center",justifyContent:"space-evenly",fontSize:11,color}}>
                        {box.e1?<span style={{lineHeight:1}}>↑</span>:<span style={{opacity:0.2}}>·</span>}
                        {box.e2?<span style={{lineHeight:1}}>↓</span>:<span style={{opacity:0.2}}>·</span>}
                      </div>
                    ))}
                  </div>
                  <span style={{fontSize:10,color:"var(--lab-text-subtle)",fontFamily:"monospace"}}>{count} e⁻</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        <p style={{fontSize:10,fontWeight:700,color:"var(--lab-text-muted)",textTransform:"uppercase",letterSpacing:"0.09em"}}>Shell Distribution (Bohr Model)</p>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {shells.map((count,i)=>(
            <div key={i} style={{flex:"1 1 56px",display:"flex",flexDirection:"column",alignItems:"center",padding:"8px 10px",
              borderRadius:10,background:i===0?`${color}12`:"rgba(248,250,252,0.8)",border:`1px solid ${i===0?color+"28":"rgba(148,163,184,0.14)"}`}}>
              <span style={{fontSize:9,fontWeight:700,color:"var(--lab-text-muted)"}}>{SHELL_LABELS[i]}</span>
              <span style={{fontSize:20,fontWeight:900,color:i===0?color:"var(--lab-text-primary)",lineHeight:1.2}}>{count}</span>
              <span style={{fontSize:8,color:"var(--lab-text-subtle)"}}>e⁻</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:"12px 16px",borderRadius:12,background:"rgba(248,250,252,0.85)",border:"1px solid rgba(148,163,184,0.16)"}}>
        <p style={{fontSize:11,fontWeight:700,color:"var(--lab-text-secondary)",marginBottom:8}}>Quantum Rules Applied</p>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {[
            {rule:"Aufbau Principle",desc:"Electrons fill lowest-energy orbitals first (1s→2s→2p→3s…)"},
            {rule:"Hund's Rule",desc:"Each orbital in a subshell gets one electron before any gets two (↑↑ before ↑↓)"},
            {rule:"Pauli Exclusion",desc:"No two electrons in an atom can have the same four quantum numbers (↑↓ pairing)"},
          ].map(({rule,desc})=>(
            <div key={rule} style={{display:"flex",gap:8}}>
              <span style={{fontSize:10,fontWeight:700,color,flexShrink:0,minWidth:130}}>{rule}:</span>
              <span style={{fontSize:10,color:"var(--lab-text-muted)",lineHeight:1.5}}>{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function StructureTab({el,color}:{el:ChemElement;color:string}) {
  const structure=CRYSTAL_STRUCTURES[el.number], desc=structure?(CRYSTAL_DESCRIPTIONS[structure]??""):"";
  return (
    <motion.div key="structure" initial={{opacity:0,x:14}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}}
      transition={{duration:0.22,ease:"easeInOut"}}
      style={{padding:"20px 24px 28px",display:"flex",flexDirection:"column",gap:16,alignItems:"center"}}>
      {structure ? (
        <>
          <div style={{padding:"16px",borderRadius:18,background:`radial-gradient(ellipse at center,${color}06 0%,transparent 70%)`,border:`1px solid ${color}12`}}>
            <CrystalViz structure={structure} color={color}/>
          </div>
          <div style={{textAlign:"center"}}>
            <p style={{fontSize:18,fontWeight:800,color:"var(--lab-text-primary)",marginBottom:6}}>{structure}</p>
            <p style={{fontSize:12,lineHeight:1.65,color:"var(--lab-text-muted)",maxWidth:340}}>{desc}</p>
          </div>
          <div style={{width:"100%",padding:"10px 16px",borderRadius:12,background:"rgba(248,250,252,0.8)",
            border:"1px solid rgba(148,163,184,0.16)",display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:14,flexShrink:0}}>⟳</span>
            <p style={{fontSize:11,color:"var(--lab-text-muted)"}}>Drag the model to rotate the unit cell in 3D space</p>
          </div>
        </>
      ):(
        <div style={{textAlign:"center",padding:"48px 20px",color:"var(--lab-text-muted)"}}>
          <p style={{fontSize:32,marginBottom:12}}>?</p>
          <p style={{fontSize:14,fontWeight:600}}>Crystal structure not yet determined</p>
          <p style={{fontSize:12,marginTop:6}}>Properties of synthetic or insufficiently characterised elements are predicted.</p>
        </div>
      )}
    </motion.div>
  );
}

// ── Isotopes Tab ──────────────────────────────────────────────────────────────

function IsotopesTab({el,color}:{el:ChemElement;color:string}) {
  const isotopes = ELEMENT_ISOTOPES[el.number];
  if(!isotopes||isotopes.length===0){
    return (
      <motion.div key="isotopes" initial={{opacity:0,x:14}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}}
        transition={{duration:0.22,ease:"easeInOut"}}
        style={{padding:"20px 24px",textAlign:"center",color:"var(--lab-text-muted)"}}>
        <div style={{fontSize:36,marginBottom:12}}>⚛️</div>
        <p style={{fontSize:14,fontWeight:600}}>Isotope data not available</p>
        <p style={{fontSize:12,marginTop:6,lineHeight:1.6}}>This element may be synthetic, insufficiently characterised, or isotope data is not included in this reference.</p>
      </motion.div>
    );
  }
  const stable   = isotopes.filter(i=>i.stable);
  const unstable = isotopes.filter(i=>!i.stable);
  return (
    <motion.div key="isotopes" initial={{opacity:0,x:14}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}}
      transition={{duration:0.22,ease:"easeInOut"}}
      style={{padding:"18px 24px 28px",display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",gap:8}}>
        <span style={{fontSize:11,fontWeight:700,padding:"4px 12px",borderRadius:100,background:"rgba(209,250,229,0.7)",color:"#059669",border:"1px solid #05996928"}}>
          {stable.length} Stable
        </span>
        {unstable.length>0&&(
          <span style={{fontSize:11,fontWeight:700,padding:"4px 12px",borderRadius:100,background:"rgba(255,228,230,0.7)",color:"#be123c",border:"1px solid #be123c28"}}>
            {unstable.length} Radioactive
          </span>
        )}
      </div>

      {/* Mini bar chart for natural abundances */}
      {stable.some(i=>i.abundance) && (
        <div>
          <p style={{fontSize:10,fontWeight:700,color:"var(--lab-text-muted)",textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:8}}>Natural Abundance</p>
          {isotopes.filter(i=>i.abundance).map(iso=>{
            const pct=parseFloat(iso.abundance!.replace("%",""))||0;
            return (
              <div key={iso.mass} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <span style={{fontSize:11,fontWeight:700,color,width:48,flexShrink:0,fontFamily:"monospace"}}>
                  {el.symbol}-{iso.mass}
                </span>
                <div style={{flex:1,height:8,borderRadius:4,background:"rgba(148,163,184,0.15)",overflow:"hidden"}}>
                  <div style={{height:"100%",borderRadius:4,background:`linear-gradient(90deg,${color}60,${color})`,width:`${Math.max(2,pct)}%`,transition:"width 0.5s ease"}}/>
                </div>
                <span style={{fontSize:10,fontWeight:600,color:"var(--lab-text-secondary)",width:48,flexShrink:0,textAlign:"right"}}>{iso.abundance}</span>
              </div>
            );
          })}
        </div>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {isotopes.map(iso=>(
          <div key={iso.mass} style={{padding:"12px 14px",borderRadius:12,
            background:iso.stable?"rgba(248,250,252,0.85)":"rgba(255,228,230,0.40)",
            border:`1px solid ${iso.stable?"rgba(148,163,184,0.16)":"rgba(190,18,60,0.15)"}`}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:14,fontWeight:900,color,fontFamily:"monospace"}}>{el.symbol}-{iso.mass}</span>
                {iso.name&&<span style={{fontSize:11,color:"var(--lab-text-muted)"}}>{iso.name}</span>}
              </div>
              <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:100,
                background:iso.stable?"rgba(209,250,229,0.8)":"rgba(255,228,230,0.8)",
                color:iso.stable?"#059669":"#be123c"}}>
                {iso.stable?"Stable":iso.halfLife}
              </span>
            </div>
            {iso.abundance&&<p style={{fontSize:10,color:"var(--lab-text-muted)",marginBottom:2}}>Natural abundance: <strong>{iso.abundance}</strong></p>}
            {iso.use&&<p style={{fontSize:11,color:"var(--lab-text-secondary)",lineHeight:1.5}}>{iso.use}</p>}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Chemistry Tab ─────────────────────────────────────────────────────────────

function ChemistryTab({el,color}:{el:ChemElement;color:string}) {
  const chem=ELEMENT_CHEMISTRY[el.number];
  const catFact=CAT_FACTS[el.category];
  return (
    <motion.div key="chemistry" initial={{opacity:0,x:14}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}}
      transition={{duration:0.22,ease:"easeInOut"}}
      style={{padding:"18px 24px 28px",display:"flex",flexDirection:"column",gap:14}}>
      {chem ? (
        <>
          <div style={{borderRadius:12,border:"1px solid rgba(148,163,184,0.18)",overflow:"hidden"}}>
            {[
              {label:"Oxidation States",  value:chem.oxidationStates},
              {label:"Common Ions",       value:chem.commonIons},
              {label:"Bonding Type",      value:chem.bondingType},
              ...(chem.flameColor?[{label:"Flame Colour",value:chem.flameColor}]:[]),
            ].map(({label,value},i)=><DataRow key={label} label={label} value={value} index={i}/>)}
          </div>

          <div style={{padding:"12px 16px",borderRadius:12,background:`${color}07`,border:`1px solid ${color}18`}}>
            <p style={{fontSize:10,fontWeight:700,color,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:6}}>Reactivity</p>
            <p style={{fontSize:12,lineHeight:1.6,color:"var(--lab-text-secondary)"}}>{chem.reactivity}</p>
          </div>

          <div style={{padding:"14px 16px",borderRadius:12,background:"rgba(224,242,254,0.6)",border:"1px solid rgba(3,105,161,0.16)"}}>
            <p style={{fontSize:11,fontWeight:800,color:"#0369a1",marginBottom:6}}>💡 {chem.keyConceptTitle}</p>
            <p style={{fontSize:12,lineHeight:1.7,color:"var(--lab-text-secondary)"}}>{chem.keyConcept}</p>
          </div>

          <div style={{padding:"12px 16px",borderRadius:12,background:"rgba(250,232,255,0.5)",border:"1px solid rgba(162,28,175,0.15)"}}>
            <p style={{fontSize:10,fontWeight:700,color:"#a21caf",textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:8}}>📝 Exam Q&amp;A</p>
            <p style={{fontSize:12,fontWeight:700,color:"var(--lab-text-primary)",marginBottom:6}}>{chem.examQuestion}</p>
            <p style={{fontSize:12,lineHeight:1.6,color:"var(--lab-text-secondary)",borderTop:"1px dashed rgba(162,28,175,0.2)",paddingTop:8}}>{chem.examAnswer}</p>
          </div>
        </>
      ):(
        <>
          {catFact&&(
            <div style={{padding:"14px 16px",borderRadius:12,background:`${color}07`,border:`1px solid ${color}18`}}>
              <p style={{fontSize:10,fontWeight:700,color,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:6}}>Category Properties</p>
              <p style={{fontSize:12,lineHeight:1.6,color:"var(--lab-text-secondary)"}}>{catFact}</p>
            </div>
          )}
          <div style={{padding:"20px",textAlign:"center",color:"var(--lab-text-muted)"}}>
            <p style={{fontSize:32,marginBottom:8}}>⚗️</p>
            <p style={{fontSize:13,fontWeight:600}}>Detailed chemistry data not available</p>
            <p style={{fontSize:11,marginTop:4,lineHeight:1.6}}>This element may be synthetic or insufficiently studied to have detailed chemistry data in this reference.</p>
          </div>
        </>
      )}
    </motion.div>
  );
}

const APP_ICONS = ["🔬","⚡","🏗️","🛸","💊","🌱","🔋","✈️"];
function ApplicationsTab({el,color}:{el:ChemElement;color:string}) {
  const apps=ELEMENT_APPLICATIONS[el.number], extra=ELEMENT_EXTRAS[el.number];
  const list=apps??(extra?.commonUse?[extra.commonUse]:[]);
  return (
    <motion.div key="applications" initial={{opacity:0,x:14}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}}
      transition={{duration:0.22,ease:"easeInOut"}} style={{padding:"20px 24px 28px"}}>
      {list.length>0?(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <p style={{fontSize:10,fontWeight:700,color:"var(--lab-text-muted)",textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:4}}>Real-World Applications</p>
          {list.map((app,i)=>{
            const parts=app.split(":");
            const title=parts[0].trim(), desc=parts[1]?.trim();
            return (
              <div key={i} className="app-card" style={{display:"flex",alignItems:"flex-start",gap:12,padding:"12px 14px",borderRadius:12,background:"rgba(248,250,252,0.85)",border:"1px solid rgba(148,163,184,0.16)"}}>
                <span style={{width:34,height:34,borderRadius:8,flexShrink:0,background:`${color}10`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>{APP_ICONS[i%APP_ICONS.length]}</span>
                <div style={{minWidth:0}}>
                  <p style={{fontSize:13,fontWeight:700,color:"var(--lab-text-primary)",lineHeight:1.3}}>{title}</p>
                  {desc&&<p style={{fontSize:11,color:"var(--lab-text-muted)",marginTop:3,lineHeight:1.5}}>{desc}</p>}
                </div>
              </div>
            );
          })}
        </div>
      ):(
        <div style={{textAlign:"center",padding:"48px 20px",color:"var(--lab-text-muted)"}}>
          <p style={{fontSize:32,marginBottom:12}}>⚗️</p>
          <p style={{fontSize:14,fontWeight:600}}>Application data not yet available</p>
          <p style={{fontSize:12,marginTop:6}}>This element is synthetic or insufficiently characterised for common applications.</p>
        </div>
      )}
    </motion.div>
  );
}

// ── History Tab ───────────────────────────────────────────────────────────────

function HistoryTab({el,color}:{el:ChemElement;color:string}) {
  const hist=ELEMENT_HISTORY[el.number];
  const fact=ELEMENT_FACTS[el.number];
  return (
    <motion.div key="history" initial={{opacity:0,x:14}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}}
      transition={{duration:0.22,ease:"easeInOut"}}
      style={{padding:"18px 24px 28px",display:"flex",flexDirection:"column",gap:14}}>
      {hist?(
        <>
          <div style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:14,
            background:`${color}06`,border:`1px solid ${color}18`}}>
            <div style={{width:56,height:56,borderRadius:12,background:`${color}15`,border:`1px solid ${color}25`,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>🏛️</div>
            <div>
              <p style={{fontSize:18,fontWeight:900,color,lineHeight:1}}>{hist.year}</p>
              <p style={{fontSize:13,fontWeight:700,color:"var(--lab-text-primary)",marginTop:2}}>{hist.discoverer}</p>
              <p style={{fontSize:11,color:"var(--lab-text-muted)",marginTop:1}}>{hist.country}</p>
            </div>
          </div>

          <div style={{borderRadius:12,border:"1px solid rgba(148,163,184,0.18)",overflow:"hidden"}}>
            <DataRow label="Discoverer" value={hist.discoverer} index={0}/>
            <DataRow label="Year" value={hist.year} index={1}/>
            <DataRow label="Country" value={hist.country} index={2}/>
          </div>

          <div style={{padding:"12px 16px",borderRadius:12,background:"rgba(248,250,252,0.9)",border:"1px solid rgba(148,163,184,0.16)"}}>
            <p style={{fontSize:10,fontWeight:700,color:"var(--lab-text-muted)",textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:6}}>Discovery Method</p>
            <p style={{fontSize:12,lineHeight:1.6,color:"var(--lab-text-secondary)"}}>{hist.method}</p>
          </div>

          <div style={{padding:"12px 16px",borderRadius:12,background:`${color}07`,border:`1px solid ${color}16`}}>
            <p style={{fontSize:10,fontWeight:700,color,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:6}}>Historical Significance</p>
            <p style={{fontSize:12,lineHeight:1.7,color:"var(--lab-text-secondary)"}}>{hist.significance}</p>
          </div>
        </>
      ):(
        <div style={{textAlign:"center",padding:"20px",color:"var(--lab-text-muted)"}}>
          <p style={{fontSize:32,marginBottom:8}}>🏛️</p>
          <p style={{fontSize:13,fontWeight:600}}>History data not available for this element</p>
          <p style={{fontSize:11,marginTop:4}}>Synthetic elements discovered post-1940 have limited historical records.</p>
        </div>
      )}
      {fact&&(
        <div style={{padding:"12px 16px",borderRadius:12,background:"rgba(255,251,235,0.8)",border:"1px solid rgba(180,83,9,0.2)"}}>
          <p style={{fontSize:10,fontWeight:700,color:"#b45309",textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:6}}>Did You Know?</p>
          <p style={{fontSize:12,lineHeight:1.7,color:"var(--lab-text-secondary)"}}>{fact}</p>
        </div>
      )}
    </motion.div>
  );
}

// ── Lab Links Tab ─────────────────────────────────────────────────────────────

function LabLinksTab({el,color,onNavigate}:{el:ChemElement;color:string;onNavigate:(slug:string)=>void}) {
  const labs=ELEMENT_LABS[el.number];
  const catFact=CAT_FACTS[el.category];
  return (
    <motion.div key="lab" initial={{opacity:0,x:14}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-10}}
      transition={{duration:0.22,ease:"easeInOut"}}
      style={{padding:"18px 24px 28px",display:"flex",flexDirection:"column",gap:14}}>
      <p style={{fontSize:12,lineHeight:1.6,color:"var(--lab-text-secondary)"}}>
        Explore virtual laboratory experiments related to <strong>{el.name}</strong>:
      </p>
      {labs&&labs.length>0?(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {labs.map(lab=>(
            <button key={lab.slug} onClick={()=>onNavigate(lab.slug)}
              style={{display:"flex",alignItems:"flex-start",gap:12,padding:"14px 16px",borderRadius:14,
                background:"rgba(248,250,252,0.9)",border:`1px solid ${color}22`,cursor:"pointer",
                textAlign:"left",transition:"all 0.15s"}}>
              <div style={{width:38,height:38,borderRadius:10,background:`${color}15`,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🧪</div>
              <div style={{minWidth:0}}>
                <p style={{fontSize:13,fontWeight:700,color:"var(--lab-text-primary)",marginBottom:3}}>{lab.label}</p>
                <p style={{fontSize:11,color:"var(--lab-text-muted)",lineHeight:1.5}}>{lab.reason}</p>
              </div>
              <span style={{fontSize:14,color:"var(--lab-text-subtle)",flexShrink:0,marginTop:2}}>→</span>
            </button>
          ))}
        </div>
      ):(
        <>
          {catFact&&(
            <div style={{padding:"12px 16px",borderRadius:12,background:`${color}07`,border:`1px solid ${color}16`}}>
              <p style={{fontSize:11,lineHeight:1.6,color:"var(--lab-text-secondary)"}}>{catFact}</p>
            </div>
          )}
          <div style={{padding:"20px",textAlign:"center",color:"var(--lab-text-muted)"}}>
            <p style={{fontSize:28,marginBottom:8}}>🔬</p>
            <p style={{fontSize:13,fontWeight:600}}>No direct lab links for {el.name}</p>
            <p style={{fontSize:11,marginTop:4,lineHeight:1.5}}>Browse the Experiments section to find relevant practicals, or select Na, Ca, Cu, Fe, or Cl for linked experiments.</p>
          </div>
        </>
      )}
    </motion.div>
  );
}

// ── Modal Tab Bar ─────────────────────────────────────────────────────────────

function ModalTabBar({active,color,onChange}:{active:TabId;color:string;onChange:(t:TabId)=>void}) {
  const tabs:TabId[]=["overview","atom","electron","structure","isotopes","chemistry","applications","history","lab"];
  return (
    <div role="tablist" aria-label="Element information sections"
      style={{display:"flex",flexShrink:0,borderBottom:"1px solid rgba(148,163,184,0.15)",
        paddingInline:"20px",gap:1,overflowX:"auto",scrollbarWidth:"none",
        WebkitOverflowScrolling:"touch"} as React.CSSProperties}>
      {tabs.map(tab=>(
        <button key={tab} role="tab" aria-selected={active===tab} onClick={()=>onChange(tab)}
          className="atom-modal-tab-btn"
          style={{
            color: active===tab ? color : "var(--lab-text-muted)",
            borderBottomColor: active===tab ? color : "transparent",
            background: active===tab ? `${color}09` : "none",
          } as React.CSSProperties}>
          {TAB_LABELS[tab]}
        </button>
      ))}
    </div>
  );
}

// ── Atom Modal ────────────────────────────────────────────────────────────────

function AtomModal({el,onClose,onNavigate}:{el:ChemElement;onClose:()=>void;onNavigate:(slug:string)=>void}) {
  const [activeTab,setActiveTab]=useState<TabId>("overview");
  const color=CAT_COLOR[el.category], bg=CAT_BG[el.category];
  const extra=ELEMENT_EXTRAS[el.number];
  const phase=extra?PHASE_BADGE[extra.phaseAtRTP]:null;
  const shells=SHELL_DISTRIBUTIONS[el.number]??[2];
  const handleTabChange=useCallback((t:TabId)=>{startTransition(()=>setActiveTab(t));},[]);
  useEffect(()=>{
    const handler=(e:KeyboardEvent)=>{if(e.key==="Escape")onClose();};
    document.addEventListener("keydown",handler);
    return ()=>document.removeEventListener("keydown",handler);
  },[onClose]);
  return (
    <div className="atom-modal-backdrop" onClick={(e)=>{if(e.target===e.currentTarget)onClose();}}
      role="dialog" aria-modal="true" aria-label={`Element details: ${el.name}`}>
      <motion.div className="atom-modal-card"
        initial={{opacity:0,scale:0.95,y:18}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.96,y:12}}
        transition={{duration:0.30,ease:[0.22,1,0.36,1]}} onClick={(e)=>e.stopPropagation()}>
        {/* Premium gradient accent bar */}
        <div style={{height:5,flexShrink:0,
          background:`linear-gradient(90deg,transparent 0%,${color}55 12%,${color}ee 45%,${color} 50%,${color}ee 55%,${color}55 88%,transparent 100%)`,
          boxShadow:`0 2px 12px ${color}25`}}/>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:"16px 26px 14px",borderBottom:"1px solid rgba(148,163,184,0.12)",flexShrink:0,gap:14}}>
          <div style={{display:"flex",alignItems:"center",gap:16,minWidth:0}}>
            {/* Element tile replica */}
            <div style={{width:64,height:64,borderRadius:14,flexShrink:0,
              background:`linear-gradient(140deg,${bg} 0%,${color}18 100%)`,
              border:`1.5px solid ${color}38`,
              boxShadow:`0 0 22px ${color}14, 0 4px 12px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.55)`,
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1,
              position:"relative",overflow:"hidden"}}>
              {/* Top accent bar on tile replica */}
              <div style={{position:"absolute",top:0,left:0,right:0,height:3,
                background:color,borderRadius:"13px 13px 0 0",opacity:0.8}}/>
              <span style={{fontSize:10,fontWeight:700,color:`${color}99`,lineHeight:1,
                position:"absolute",top:7,left:8}}>{el.number}</span>
              <span style={{fontSize:28,fontWeight:900,color,lineHeight:1,letterSpacing:"-0.02em",
                textShadow:`0 1px 4px ${color}25`}}>{el.symbol}</span>
              <span style={{fontSize:7.5,fontWeight:500,color:`${color}80`,lineHeight:1,
                fontVariantNumeric:"tabular-nums"}}>{el.mass}</span>
            </div>
            {/* Name + meta */}
            <div style={{minWidth:0}}>
              <p style={{fontSize:20,fontWeight:900,color:"var(--lab-text-primary)",lineHeight:1.15,
                letterSpacing:"-0.025em"}}>{el.name}</p>
              <p style={{fontSize:11.5,color:"var(--lab-text-muted)",marginTop:3,lineHeight:1.4}}>
                Z&nbsp;=&nbsp;{el.number}
                <span style={{margin:"0 5px",opacity:0.4}}>·</span>
                {el.mass}&nbsp;u
                <span style={{margin:"0 5px",opacity:0.4}}>·</span>
                Period&nbsp;{getPeriod(el)}
                <span style={{margin:"0 5px",opacity:0.4}}>·</span>
                Group&nbsp;{el.col}
              </p>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
            {phase&&(
              <span style={{fontSize:10,fontWeight:700,padding:"3px 11px",borderRadius:100,
                background:phase.bg,color:phase.color,border:`1px solid ${phase.color}28`,letterSpacing:"0.02em"}}>
                {phase.label}
              </span>
            )}
            <button onClick={onClose} aria-label="Close element details" className="modal-close-btn">✕</button>
          </div>
        </div>
        <ModalTabBar active={activeTab} color={color} onChange={handleTabChange}/>
        <div style={{flex:"1 1 0%",overflowY:"auto",minHeight:0}}>
          <AnimatePresence mode="wait">
            {activeTab==="overview"     && <OverviewTab     el={el} color={color} bg={bg} shells={shells}/>}
            {activeTab==="atom"         && <AtomTab         el={el} color={color} shells={shells}/>}
            {activeTab==="electron"     && <ElectronConfigTab el={el} color={color}/>}
            {activeTab==="structure"    && <StructureTab    el={el} color={color}/>}
            {activeTab==="isotopes"     && <IsotopesTab     el={el} color={color}/>}
            {activeTab==="chemistry"    && <ChemistryTab    el={el} color={color}/>}
            {activeTab==="applications" && <ApplicationsTab el={el} color={color}/>}
            {activeTab==="history"      && <HistoryTab      el={el} color={color}/>}
            {activeTab==="lab"          && <LabLinksTab     el={el} color={color} onNavigate={onNavigate}/>}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// ── Hover Tooltip ─────────────────────────────────────────────────────────────

function HoverTooltip({el,trendProp}:{el:ChemElement;trendProp:TrendProperty|null}) {
  const color=CAT_COLOR[el.category], bg=CAT_BG[el.category];
  const trendVal = trendProp ? computeTrendColor(el.number, el.mass, trendProp) : null;
  const trendCfg = trendProp ? TREND_CONFIGS[trendProp] : null;
  const extra=ELEMENT_EXTRAS[el.number];
  const period = el.row<=7?el.row:el.row===8?6:7;
  const trendData = ELEMENT_TRENDS[el.number];
  return (
    <div style={{pointerEvents:"none"}}>
      {/* Top accent bar */}
      <div style={{height:3,background:`linear-gradient(90deg,transparent 0%,${color}90 20%,${color} 50%,${color}90 80%,transparent 100%)`}}/>
      <div style={{padding:"12px 14px 13px"}}>
        {/* Header row */}
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:9}}>
          {/* Symbol + number */}
          <div style={{display:"flex",alignItems:"baseline",gap:7}}>
            <span style={{fontSize:42,fontWeight:900,lineHeight:1,color,letterSpacing:"-0.03em"}}>{el.symbol}</span>
            <span style={{fontSize:11,fontWeight:700,color:"var(--lab-text-muted)",lineHeight:1,paddingBottom:2}}>
              {el.number}
            </span>
          </div>
          {/* Category badge */}
          <span style={{fontSize:9,fontWeight:700,padding:"3px 8px",borderRadius:100,background:bg,color,
            border:`1px solid ${color}30`,whiteSpace:"nowrap",letterSpacing:"0.02em",marginTop:4}}>
            {CATEGORY_LABELS[el.category]}
          </span>
        </div>

        {/* Name + mass */}
        <div style={{marginBottom:9}}>
          <div style={{fontSize:14,fontWeight:700,color:"var(--lab-text-primary)",letterSpacing:"-0.01em",lineHeight:1.2}}>{el.name}</div>
          <div style={{fontSize:11,marginTop:2.5,fontVariantNumeric:"tabular-nums",color:"var(--lab-text-muted)",display:"flex",gap:8}}>
            <span>{el.mass} u</span>
            <span style={{color:"var(--lab-text-subtle)"}}>·</span>
            <span>Period {period} · Group {el.col}</span>
          </div>
          {extra?.electronConfig&&(
            <div style={{fontSize:9.5,marginTop:4,fontFamily:"monospace",color:"var(--lab-text-muted)",letterSpacing:"0.01em",lineHeight:1.5,opacity:0.85}}>
              {extra.electronConfig}
            </div>
          )}
        </div>

        {/* Trend value row */}
        {trendVal&&trendCfg&&(
          <div style={{marginBottom:9,padding:"5px 9px",borderRadius:7,background:`${color}0C`,border:`1px solid ${color}20`}}>
            <span style={{fontSize:9,fontWeight:700,color,textTransform:"uppercase",letterSpacing:"0.08em"}}>{trendCfg.label}: </span>
            <span style={{fontSize:10.5,fontWeight:800,color:"var(--lab-text-primary)"}}>{trendVal} {trendCfg.unit}</span>
          </div>
        )}

        {/* Quick property chips */}
        {!trendProp && trendData && (
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
            {trendData.electronegativity!==undefined&&(
              <span style={{fontSize:9,padding:"2px 7px",borderRadius:6,background:"rgba(248,250,252,0.9)",border:"1px solid rgba(148,163,184,0.18)",color:"var(--lab-text-muted)"}}>
                EN {trendData.electronegativity}
              </span>
            )}
            {trendData.ionizationEnergy!==undefined&&(
              <span style={{fontSize:9,padding:"2px 7px",borderRadius:6,background:"rgba(248,250,252,0.9)",border:"1px solid rgba(148,163,184,0.18)",color:"var(--lab-text-muted)"}}>
                IE {trendData.ionizationEnergy} kJ
              </span>
            )}
            {trendData.atomicRadius!==undefined&&(
              <span style={{fontSize:9,padding:"2px 7px",borderRadius:6,background:"rgba(248,250,252,0.9)",border:"1px solid rgba(148,163,184,0.18)",color:"var(--lab-text-muted)"}}>
                r {trendData.atomicRadius} pm
              </span>
            )}
          </div>
        )}

        {/* CTA */}
        <div style={{fontSize:9.5,paddingTop:8,borderTop:"1px solid rgba(148,163,184,0.14)",color:"var(--lab-text-subtle)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span>{extra?.phaseAtRTP && `${extra.phaseAtRTP.charAt(0).toUpperCase()}${extra.phaseAtRTP.slice(1)} at RTP`}</span>
          <span style={{fontWeight:700,color,letterSpacing:"0.01em"}}>Click for details →</span>
        </div>
      </div>
    </div>
  );
}

// ── Trend Legend ──────────────────────────────────────────────────────────────

function TrendLegend({prop}:{prop:TrendProperty}) {
  const cfg=TREND_CONFIGS[prop];
  const {min,max}=useMemo(()=>getTrendRange(prop),[prop]);
  const fmtMin=min.toFixed(prop==="density"?2:0);
  const fmtMax=max.toFixed(prop==="density"?2:0);
  return (
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:4}}
      transition={{duration:0.25}}
      style={{marginTop:18,padding:"18px 22px",borderRadius:16,
        background:"rgba(255,255,255,0.97)",
        border:"1px solid rgba(148,163,184,0.16)",
        boxShadow:"0 6px 28px rgba(15,23,42,0.07),0 2px 8px rgba(15,23,42,0.04)",
        display:"flex",flexDirection:"column",gap:12}}>

      {/* Header */}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
        <div>
          <p style={{fontSize:14,fontWeight:800,color:"var(--lab-text-primary)",letterSpacing:"-0.01em"}}>
            {cfg.label} {cfg.icon&&<span style={{marginLeft:4}}>{cfg.icon}</span>}
          </p>
          <p style={{fontSize:11.5,color:"var(--lab-text-muted)",marginTop:3,lineHeight:1.5}}>{cfg.description}</p>
        </div>
        <div style={{display:"flex",gap:8,flexShrink:0}}>
          <div style={{padding:"5px 12px",borderRadius:9,background:"rgba(209,250,229,0.75)",
            border:"1px solid rgba(5,150,105,0.20)",fontSize:10,fontWeight:700,color:"#047857",textAlign:"center",lineHeight:1.4}}>
            <div style={{fontSize:9,opacity:0.8,fontWeight:600,letterSpacing:"0.04em"}}>PERIOD →</div>
            <div style={{marginTop:1}}>{cfg.periodTrend==="increases"?"Increases":"Decreases"}</div>
          </div>
          <div style={{padding:"5px 12px",borderRadius:9,background:"rgba(219,234,254,0.75)",
            border:"1px solid rgba(37,99,235,0.20)",fontSize:10,fontWeight:700,color:"#1d4ed8",textAlign:"center",lineHeight:1.4}}>
            <div style={{fontSize:9,opacity:0.8,fontWeight:600,letterSpacing:"0.04em"}}>GROUP ↓</div>
            <div style={{marginTop:1}}>{cfg.groupTrend==="increases"?"Increases":"Decreases"}</div>
          </div>
        </div>
      </div>

      {/* Gradient scale bar */}
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",flexShrink:0}}>
          <span style={{fontSize:11,fontWeight:700,color:"rgb(59,130,246)",fontVariantNumeric:"tabular-nums"}}>{fmtMin}</span>
          <span style={{fontSize:9,color:"var(--lab-text-subtle)",marginTop:1}}>{cfg.unit}</span>
        </div>
        <div style={{flex:1,display:"flex",flexDirection:"column",gap:4}}>
          <div className="pt-trend-legend__bar-premium"/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"var(--lab-text-subtle)"}}>
            <span>Low</span><span>Medium</span><span>High</span>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-start",flexShrink:0}}>
          <span style={{fontSize:11,fontWeight:700,color:"rgb(239,68,68)",fontVariantNumeric:"tabular-nums"}}>{fmtMax}</span>
          <span style={{fontSize:9,color:"var(--lab-text-subtle)",marginTop:1}}>{cfg.unit}</span>
        </div>
      </div>

      {/* Explanation */}
      <p style={{fontSize:11.5,lineHeight:1.65,color:"var(--lab-text-secondary)",borderTop:"1px solid rgba(148,163,184,0.12)",paddingTop:10}}>
        {cfg.trendExplanation}
      </p>
    </motion.div>
  );
}

// ── Comparison Panel ──────────────────────────────────────────────────────────

const COMPARE_PROPS: {key:string;label:string;get:(el:ChemElement)=>string}[] = [
  {key:"number",    label:"Atomic #",    get:el=>String(el.number)},
  {key:"mass",      label:"Atomic Mass", get:el=>`${el.mass} u`},
  {key:"category",  label:"Category",    get:el=>CATEGORY_LABELS[el.category]},
  {key:"ec",        label:"Config",      get:el=>ELEMENT_EXTRAS[el.number]?.electronConfig??"—"},
  {key:"phase",     label:"Phase",       get:el=>ELEMENT_EXTRAS[el.number]?.phaseAtRTP??"—"},
  {key:"mp",        label:"Melt (°C)",   get:el=>ELEMENT_EXTRAS[el.number]?.meltingC??ELEMENT_TRENDS[el.number]?.meltingPointK?(String(Math.round((ELEMENT_TRENDS[el.number]!.meltingPointK!)-273.15))):"—"},
  {key:"bp",        label:"Boil (°C)",   get:el=>ELEMENT_EXTRAS[el.number]?.boilingC??ELEMENT_TRENDS[el.number]?.boilingPointK?(String(Math.round((ELEMENT_TRENDS[el.number]!.boilingPointK!)-273.15))):"—"},
  {key:"en",        label:"Electr-neg",  get:el=>ELEMENT_TRENDS[el.number]?.electronegativity!=null?String(ELEMENT_TRENDS[el.number]!.electronegativity):"—"},
  {key:"ie",        label:"1st IE",      get:el=>ELEMENT_TRENDS[el.number]?.ionizationEnergy!=null?`${ELEMENT_TRENDS[el.number]!.ionizationEnergy} kJ`:"—"},
  {key:"ar",        label:"At. Radius",  get:el=>ELEMENT_TRENDS[el.number]?.atomicRadius!=null?`${ELEMENT_TRENDS[el.number]!.atomicRadius} pm`:"—"},
  {key:"density",   label:"Density",     get:el=>ELEMENT_TRENDS[el.number]?.density!=null?`${ELEMENT_TRENDS[el.number]!.density} g/cc`:"—"},
];

function ComparisonPanel({elements:els,onRemove,onClear}:{elements:ChemElement[];onRemove:(n:number)=>void;onClear:()=>void}) {
  if(els.length===0) return null;
  return (
    <motion.div initial={{opacity:0,x:60}} animate={{opacity:1,x:0}} exit={{opacity:0,x:60}}
      transition={{duration:0.3,ease:[0.22,1,0.36,1]}}
      className="comparison-panel"
      style={{position:"fixed",top:80,right:12,width:Math.min(180+els.length*140,720),maxWidth:"95vw",
        background:"rgba(255,255,255,0.97)",backdropFilter:"blur(20px)",
        border:"1px solid rgba(148,163,184,0.20)",borderRadius:16,
        boxShadow:"0 16px 48px rgba(15,23,42,0.12)",zIndex:8000,overflow:"hidden",
        maxHeight:"80vh",display:"flex",flexDirection:"column"}}>
      <div style={{padding:"12px 16px",borderBottom:"1px solid rgba(148,163,184,0.14)",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <p style={{fontSize:13,fontWeight:800,color:"var(--lab-text-primary)"}}>Element Comparison</p>
        <button onClick={onClear} style={{fontSize:11,fontWeight:700,color:"#be123c",background:"rgba(255,228,230,0.8)",border:"1px solid rgba(190,18,60,0.2)",
          padding:"3px 10px",borderRadius:8,cursor:"pointer"}}>Clear All</button>
      </div>
      <div style={{overflowX:"auto",overflowY:"auto",flex:1}}>
        <table style={{borderCollapse:"collapse",width:"100%",fontSize:11}}>
          <thead>
            <tr style={{background:"rgba(248,250,252,0.9)"}}>
              <th style={{padding:"8px 12px",textAlign:"left",color:"var(--lab-text-muted)",fontWeight:700,fontSize:10,textTransform:"uppercase",letterSpacing:"0.08em",borderBottom:"1px solid rgba(148,163,184,0.14)",position:"sticky",left:0,background:"rgba(248,250,252,0.98)"}}>Property</th>
              {els.map(el=>(
                <th key={el.number} style={{padding:"8px 12px",borderBottom:"1px solid rgba(148,163,184,0.14)",minWidth:120}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,justifyContent:"space-between"}}>
                    <span style={{fontSize:16,fontWeight:900,color:CAT_COLOR[el.category]}}>{el.symbol}</span>
                    <button onClick={()=>onRemove(el.number)} style={{fontSize:10,color:"var(--lab-text-subtle)",background:"none",border:"none",cursor:"pointer",padding:"2px 4px"}}>✕</button>
                  </div>
                  <div style={{fontSize:10,color:"var(--lab-text-muted)",fontWeight:600,marginTop:2}}>{el.name}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE_PROPS.map(({key,label,get},ri)=>(
              <tr key={key} style={{background:ri%2===0?"rgba(248,250,252,0.4)":"transparent"}}>
                <td style={{padding:"7px 12px",color:"var(--lab-text-muted)",fontWeight:600,borderBottom:"1px solid rgba(148,163,184,0.08)",position:"sticky",left:0,background:ri%2===0?"rgba(248,250,252,0.98)":"rgba(255,255,255,0.98)",whiteSpace:"nowrap"}}>{label}</td>
                {els.map(el=>(
                  <td key={el.number} style={{padding:"7px 12px",color:"var(--lab-text-primary)",borderBottom:"1px solid rgba(148,163,184,0.08)",fontVariantNumeric:"tabular-nums",whiteSpace:"nowrap"}}>{get(el)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ── PT Toolbar ────────────────────────────────────────────────────────────────

const TREND_OPTIONS: {value:TrendProperty;label:string}[] = [
  {value:"atomicRadius",      label:"Atomic Radius"},
  {value:"electronegativity", label:"Electronegativity"},
  {value:"ionizationEnergy",  label:"Ionization Energy"},
  {value:"electronAffinity",  label:"Electron Affinity"},
  {value:"density",           label:"Density"},
  {value:"meltingPointK",     label:"Melting Point"},
  {value:"boilingPointK",     label:"Boiling Point"},
  {value:"atomicMass",        label:"Atomic Mass"},
];

const FILTER_CATEGORIES: {value:ElementCategory|"all";label:string}[] = [
  {value:"all",                  label:"All Categories"},
  {value:"alkali-metal",         label:"Alkali Metals"},
  {value:"alkaline-earth",       label:"Alkaline Earth"},
  {value:"transition-metal",     label:"Transition Metals"},
  {value:"post-transition-metal",label:"Post-Transition"},
  {value:"metalloid",            label:"Metalloids"},
  {value:"nonmetal",             label:"Nonmetals"},
  {value:"halogen",              label:"Halogens"},
  {value:"noble-gas",            label:"Noble Gases"},
  {value:"lanthanide",           label:"Lanthanides"},
  {value:"actinide",             label:"Actinides"},
];

interface ToolbarProps {
  search: string;
  setSearch: (v:string)=>void;
  filterCat: ElementCategory|"all";
  setFilterCat: (v:ElementCategory|"all")=>void;
  trendProp: TrendProperty|null;
  setTrendProp: (v:TrendProperty|null)=>void;
  comparisonMode: boolean;
  setComparisonMode: (v:boolean)=>void;
  comparedCount: number;
  trendLearning: boolean;
  setTrendLearning: (v:boolean)=>void;
  matchCount: number;
}

function PTToolbar({search,setSearch,filterCat,setFilterCat,trendProp,setTrendProp,comparisonMode,setComparisonMode,comparedCount,trendLearning,setTrendLearning,matchCount}:ToolbarProps) {
  return (
    <div className="pt-toolbar" style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:18,alignItems:"center"}}>

      {/* Search */}
      <div style={{position:"relative",flex:"1 1 190px",minWidth:164,maxWidth:300}}>
        <svg style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",
          width:15,height:15,color:"var(--lab-text-subtle)",pointerEvents:"none",flexShrink:0}}
          viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="9" cy="9" r="6"/><path d="m16 16-3.5-3.5"/>
        </svg>
        <input
          type="text" value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search by name, symbol or number…"
          className="pt-search-input"
          aria-label="Search elements by name, symbol, or atomic number"
        />
        {search&&(
          <button onClick={()=>setSearch("")} aria-label="Clear search"
            style={{position:"absolute",right:9,top:"50%",transform:"translateY(-50%)",
              background:"rgba(148,163,184,0.18)",border:"none",cursor:"pointer",
              width:18,height:18,borderRadius:"50%",display:"flex",alignItems:"center",
              justifyContent:"center",fontSize:11,color:"var(--lab-text-muted)"}}>✕</button>
        )}
      </div>

      {/* Category filter */}
      <select value={filterCat} onChange={e=>setFilterCat(e.target.value as ElementCategory|"all")}
        className={`pt-select${filterCat!=="all"?" pt-select--active":""}`}
        style={{flex:"0 1 168px",minWidth:136}}>
        {FILTER_CATEGORIES.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      {/* Trend selector */}
      <select value={trendProp??"none"} onChange={e=>{const v=e.target.value;setTrendProp(v==="none"?null:v as TrendProperty);}}
        className={`pt-select${trendProp?" pt-select--active":""}`}
        style={{flex:"0 1 188px",minWidth:158}}>
        <option value="none">Colour by Property…</option>
        {TREND_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      {/* Comparison mode toggle */}
      <button onClick={()=>setComparisonMode(!comparisonMode)}
        className={`pt-toolbar-btn${comparisonMode?" pt-toolbar-btn--compare-active":""}`}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
        </svg>
        Compare{comparedCount>0?` (${comparedCount})`:""}
      </button>

      {/* Trend learning mode */}
      <button onClick={()=>setTrendLearning(!trendLearning)}
        className={`pt-toolbar-btn${trendLearning?" pt-toolbar-btn--trend-active":""}`}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
        </svg>
        Trends
      </button>

      {/* Match count badge */}
      {(search||filterCat!=="all")&&(
        <span style={{fontSize:11,fontWeight:600,color:"var(--lab-text-muted)",flexShrink:0,
          padding:"4px 10px",borderRadius:100,background:"rgba(248,250,252,0.9)",
          border:"1px solid rgba(148,163,184,0.18)"}}>
          {matchCount}&thinsp;/&thinsp;118
        </span>
      )}
    </div>
  );
}

// ── Trend Learning Panel ──────────────────────────────────────────────────────

function TrendLearningPanel() {
  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:6}}
      transition={{duration:0.3}}
      style={{marginBottom:16,padding:"18px 20px",borderRadius:16,
        background:"linear-gradient(135deg,rgba(237,233,254,0.9),rgba(219,234,254,0.85))",
        border:"1px solid rgba(124,58,237,0.18)"}}>
      <p style={{fontSize:13,fontWeight:800,color:"#7c3aed",marginBottom:10}}>📈 Periodic Trends Guide</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>
        {[
          {icon:"⬤",name:"Atomic Radius",period:"→ decreases",group:"↓ increases",why:"More protons → smaller; new shell → bigger"},
          {icon:"⚡",name:"Electronegativity",period:"→ increases",group:"↓ decreases",why:"More protons pull; larger atoms shield"},
          {icon:"⚛️",name:"Ionization Energy",period:"→ increases",group:"↓ decreases",why:"Tightly held electrons → easier to remove"},
          {icon:"🔩",name:"Metallic Character",period:"→ decreases",group:"↓ increases",why:"Easier e⁻ loss = more metallic"},
        ].map(t=>(
          <div key={t.name} style={{padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,0.75)",border:"1px solid rgba(124,58,237,0.12)"}}>
            <p style={{fontSize:12,fontWeight:700,color:"#7c3aed",marginBottom:4}}>{t.icon} {t.name}</p>
            <p style={{fontSize:10,color:"#1d4ed8",marginBottom:2}}>{t.period}</p>
            <p style={{fontSize:10,color:"#059669",marginBottom:4}}>{t.group}</p>
            <p style={{fontSize:10,color:"var(--lab-text-muted)",lineHeight:1.4}}>{t.why}</p>
          </div>
        ))}
      </div>
      <p style={{fontSize:10,color:"var(--lab-text-subtle)",marginTop:10}}>
        Use <strong>Colour by Property</strong> above to visualise any trend dynamically across the entire table.
      </p>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function PeriodicTable() {
  const router = useRouter();

  const [hovered,     setHovered]     = useState<ChemElement|null>(null);
  const [hoveredRect, setHoveredRect] = useState<DOMRect|null>(null);
  const [selected,    setSelected]    = useState<ChemElement|null>(null);
  const [mounted,     setMounted]     = useState(false);

  // Toolbar state
  const [search,         setSearch]         = useState("");
  const [filterCat,      setFilterCat]      = useState<ElementCategory|"all">("all");
  const [trendProp,      setTrendProp]      = useState<TrendProperty|null>(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparedEls,    setComparedEls]    = useState<ChemElement[]>([]);
  const [trendLearning,  setTrendLearning]  = useState(false);

  const clearTimer = useRef<ReturnType<typeof setTimeout>|null>(null);

  useEffect(()=>{ startTransition(()=>setMounted(true)); },[]);

  // Filter logic
  const matchSet = useMemo(()=>{
    if(!search && filterCat==="all") return null;
    const q=search.toLowerCase().trim();
    return new Set(
      elements.filter(el=>{
        const catOk = filterCat==="all" || el.category===filterCat;
        const searchOk = !q ||
          el.name.toLowerCase().includes(q) ||
          el.symbol.toLowerCase().includes(q) ||
          String(el.number).includes(q) ||
          el.mass.includes(q);
        return catOk && searchOk;
      }).map(el=>el.number)
    );
  },[search,filterCat]);

  const matchCount = matchSet ? matchSet.size : 118;

  const handleHover = useCallback((el:ChemElement|null, rect?:DOMRect)=>{
    if(clearTimer.current) clearTimeout(clearTimer.current);
    if(el!==null){
      setHovered(el);
      setHoveredRect(rect??null);
    } else {
      clearTimer.current=setTimeout(()=>{setHovered(null);setHoveredRect(null);},180);
    }
  },[]);

  const handleClick = useCallback((el:ChemElement)=>{
    if(comparisonMode){
      setComparedEls(prev=>{
        if(prev.some(e=>e.number===el.number)) return prev.filter(e=>e.number!==el.number);
        if(prev.length>=4) return [...prev.slice(1),el];
        return [...prev,el];
      });
    } else {
      setSelected(el);
    }
  },[comparisonMode]);

  const handleNavigate = useCallback((slug:string)=>{
    setSelected(null);
    router.push(`/experiments/${slug}`);
  },[router]);

  const anyHovered = hovered!==null;

  // Tooltip position
  const tooltipStyle = (()=>{
    if(!hoveredRect||!mounted) return null;
    const vw=window.innerWidth, vh=window.innerHeight;
    let top=hoveredRect.bottom+8, left=hoveredRect.left+hoveredRect.width/2-TOOLTIP_W/2;
    if(top+TOOLTIP_H>vh-16) top=hoveredRect.top-TOOLTIP_H-8;
    left=Math.max(8,Math.min(vw-TOOLTIP_W-8,left));
    return {top,left};
  })();

  const isHighlighted = useCallback((el:ChemElement)=>{
    const filterOk = !matchSet || matchSet.has(el.number);
    const catOk    = !anyHovered || hovered!.category===el.category;
    return filterOk && (!anyHovered || catOk);
  },[matchSet,anyHovered,hovered]);

  const getTileTrendOverride = useCallback((el:ChemElement)=>{
    if(!trendProp) return undefined;
    return getTrendColorForTile(el,trendProp)??undefined;
  },[trendProp]);

  const tooltipEl = mounted&&hovered&&tooltipStyle
    ? createPortal(
        <AnimatePresence mode="wait">
          <motion.div key={hovered.number}
            initial={{opacity:0,scale:0.88,y:-6}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.92,y:-4}}
            transition={{duration:0.15,ease:[0.22,1,0.36,1]}}
            className="pt-hover-tooltip"
            style={{position:"fixed",top:tooltipStyle.top,left:tooltipStyle.left,width:TOOLTIP_W,zIndex:9999,
              pointerEvents:"none",border:`1px solid ${CAT_COLOR[hovered.category]}22`}}
            aria-live="polite">
            <HoverTooltip el={hovered} trendProp={trendProp}/>
          </motion.div>
        </AnimatePresence>,
        document.body
      )
    : null;

  const modalEl = mounted&&selected
    ? createPortal(
        <AnimatePresence mode="wait">
          <AtomModal key={selected.number} el={selected} onClose={()=>setSelected(null)} onNavigate={handleNavigate}/>
        </AnimatePresence>,
        document.body
      )
    : null;

  const comparisonEl = mounted&&comparedEls.length>0
    ? createPortal(
        <AnimatePresence>
          <ComparisonPanel key="cp" elements={comparedEls}
            onRemove={(n)=>setComparedEls(prev=>prev.filter(e=>e.number!==n))}
            onClear={()=>setComparedEls([])}/>
        </AnimatePresence>,
        document.body
      )
    : null;

  return (
    <section id="elements" className="pt-section-bg relative overflow-hidden"
      style={{paddingTop:"calc(64px + 3rem)",paddingBottom:"4.5rem"}}>

      {/* Background decoration */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0" style={{backgroundImage:"radial-gradient(circle,rgba(59,130,246,0.065) 1px,transparent 1px)",backgroundSize:"34px 34px",opacity:0.7}}/>
        <div style={{position:"absolute",top:"-80px",left:"50%",transform:"translateX(-50%)",width:1200,height:460,borderRadius:"50%",background:"radial-gradient(ellipse at center,rgba(37,99,235,0.06) 0%,transparent 65%)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:"6%",right:"2%",width:520,height:520,borderRadius:"50%",background:"radial-gradient(circle,rgba(124,58,237,0.04) 0%,transparent 65%)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",top:"28%",left:"-5%",width:360,height:360,borderRadius:"50%",background:"radial-gradient(circle,rgba(14,165,233,0.04) 0%,transparent 70%)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:"20%",left:"30%",width:240,height:240,borderRadius:"50%",background:"radial-gradient(circle,rgba(16,185,129,0.03) 0%,transparent 70%)",pointerEvents:"none"}}/>
      </div>

      {/* Section header */}
      <motion.div initial={{opacity:0,y:28}} whileInView={{opacity:1,y:0}}
        transition={{duration:0.65,ease:[0.22,1,0.36,1]}} viewport={{once:true,margin:"-40px"}}
        className="relative z-10 text-center mb-8 px-4">
        <div style={{display:"inline-flex",alignItems:"center",gap:7,marginBottom:14}}>
          <span className="section-tag section-tag-blue">
            <span style={{width:6,height:6,borderRadius:"50%",background:"#2563eb",flexShrink:0}}/>
            Interactive Exploration Platform
          </span>
        </div>
        <h2 style={{fontSize:"clamp(2rem,5vw,3.25rem)",fontWeight:900,lineHeight:1.08,letterSpacing:"-0.025em",color:"var(--lab-text-primary)",marginTop:4}}>
          Periodic Table of{" "}
          <span style={{background:"linear-gradient(135deg,#1d4ed8 0%,#0ea5e9 55%,#7c3aed 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
            Elements
          </span>
        </h2>
        <p style={{marginTop:10,fontSize:14.5,color:"var(--lab-text-muted)",letterSpacing:"0.005em",maxWidth:580,margin:"10px auto 0",lineHeight:1.6}}>
          118 elements&thinsp;·&thinsp;Hover to preview&thinsp;·&thinsp;Click for 9-tab deep-dive&thinsp;·&thinsp;Compare elements&thinsp;·&thinsp;Visualise periodic trends
        </p>
        <motion.div initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}}
          transition={{duration:0.55,delay:0.15,ease:"easeOut"}} viewport={{once:true}}
          style={{display:"flex",justifyContent:"center",flexWrap:"wrap",gap:10,marginTop:20}}>
          {[
            {label:"Elements",   value:"118", accent:"#1d4ed8"},
            {label:"Periods",    value:"7",   accent:"#059669"},
            {label:"Groups",     value:"18",  accent:"#7c3aed"},
            {label:"Trend Maps", value:"8",   accent:"#0891b2"},
          ].map(({label,value,accent})=>(
            <div key={label} className="pt-stat-chip"
              style={{border:`1px solid ${accent}18`,boxShadow:`0 2px 12px ${accent}0E,0 1px 3px rgba(15,23,42,0.04),0 0 0 1px rgba(255,255,255,0.75) inset`}}>
              <p style={{fontSize:22,fontWeight:900,color:accent,lineHeight:1,letterSpacing:"-0.02em"}}>{value}</p>
              <p style={{fontSize:9.5,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.11em",color:"var(--lab-text-muted)",marginTop:4}}>{label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Table + controls (full width) */}
      <div className="relative z-10 max-w-[1520px] mx-auto px-4">

        {/* Toolbar */}
        <PTToolbar
          search={search} setSearch={setSearch}
          filterCat={filterCat} setFilterCat={setFilterCat}
          trendProp={trendProp} setTrendProp={setTrendProp}
          comparisonMode={comparisonMode} setComparisonMode={setComparisonMode}
          comparedCount={comparedEls.length}
          trendLearning={trendLearning} setTrendLearning={setTrendLearning}
          matchCount={matchCount}
        />

        {/* Trend learning panel */}
        <AnimatePresence>
          {trendLearning && <TrendLearningPanel key="tl"/>}
        </AnimatePresence>

        {/* Comparison mode banner */}
        <AnimatePresence>
          {comparisonMode&&(
            <motion.div key="cmpbanner" initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
              style={{overflow:"hidden",marginBottom:10}}>
              <div style={{padding:"11px 18px",borderRadius:11,
                background:"linear-gradient(135deg,rgba(186,230,253,0.85),rgba(224,242,254,0.80))",
                border:"1px solid rgba(3,105,161,0.22)",
                display:"flex",alignItems:"center",gap:10,marginBottom:8,
                boxShadow:"0 2px 8px rgba(3,105,161,0.08)"}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0369a1"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
                </svg>
                <p style={{fontSize:12.5,fontWeight:600,color:"#0369a1",lineHeight:1.4}}>
                  Comparison mode — click up to 4 elements.
                  {comparedEls.length>0&&<span style={{marginLeft:6,fontWeight:800}}>Selected: {comparedEls.map(e=>e.symbol).join(", ")}</span>}
                  {comparedEls.length===0&&<span style={{marginLeft:6,opacity:0.7}}>No elements selected yet.</span>}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}}
          transition={{duration:0.60,delay:0.08,ease:"easeOut"}} viewport={{once:true,margin:"-40px"}}
          className="overflow-x-auto pb-4"
          style={{WebkitOverflowScrolling:"touch",display:"flex",flexDirection:"column",alignItems:"center"}}>

          {/* Main grid */}
          <div className="pt-grid" style={{width:"fit-content"}}>
            {mainElements.map(el=>{
              const trendOverride=getTileTrendOverride(el);
              const isCompared=comparedEls.some(e=>e.number===el.number);
              return (
                <ElementTile
                  key={el.number} element={el}
                  onHover={handleHover} onClick={handleClick}
                  isHighlighted={isHighlighted(el)}
                  isActive={anyHovered&&hovered!.category===el.category}
                  isSelected={isCompared||(selected?.number===el.number)}
                  trendBg={trendOverride?.bg}
                  trendBorder={trendOverride?.border}
                />
              );
            })}
            <div className="elem-placeholder" style={{gridRow:6,gridColumn:3}} title="Lanthanides 57–71"><span>57–71</span><span>Ln</span></div>
            <div className="elem-placeholder" style={{gridRow:7,gridColumn:3}} title="Actinides 89–103"><span>89–103</span><span>An</span></div>
          </div>

          {/* Connector */}
          <div style={{margin:"8px 0 4px",width:"calc(18 * var(--tile-w) + 17 * var(--tile-gap))",paddingLeft:"calc(2 * (var(--tile-w) + var(--tile-gap)))"}}>
            <div style={{height:1,background:"linear-gradient(90deg,rgba(148,163,184,0.40) 0%,rgba(148,163,184,0.06) 100%)"}}/>
          </div>

          {/* F-block */}
          <div className="fblock-grid" style={{width:"fit-content"}}>
            <div className="fblock-label" style={{gridRow:1,gridColumn:"1 / 3"}}>Lanthanides</div>
            <div className="fblock-label" style={{gridRow:2,gridColumn:"1 / 3"}}>Actinides</div>
            {lanthanides.map(el=>{
              const trendOverride=getTileTrendOverride(el);
              const isCompared=comparedEls.some(e=>e.number===el.number);
              return (
                <ElementTile key={el.number} element={el} gridRow={1} gridCol={el.col}
                  onHover={handleHover} onClick={handleClick}
                  isHighlighted={isHighlighted(el)}
                  isActive={anyHovered&&hovered!.category===el.category}
                  isSelected={isCompared}
                  trendBg={trendOverride?.bg} trendBorder={trendOverride?.border}/>
              );
            })}
            {actinides.map(el=>{
              const trendOverride=getTileTrendOverride(el);
              const isCompared=comparedEls.some(e=>e.number===el.number);
              return (
                <ElementTile key={el.number} element={el} gridRow={2} gridCol={el.col}
                  onHover={handleHover} onClick={handleClick}
                  isHighlighted={isHighlighted(el)}
                  isActive={anyHovered&&hovered!.category===el.category}
                  isSelected={isCompared}
                  trendBg={trendOverride?.bg} trendBorder={trendOverride?.border}/>
              );
            })}
          </div>
        </motion.div>

        {/* Trend legend */}
        <AnimatePresence>
          {trendProp&&<TrendLegend key={trendProp} prop={trendProp}/>}
        </AnimatePresence>

        {/* Category legend */}
        <motion.div initial={{opacity:0}} whileInView={{opacity:1}}
          transition={{duration:0.55,delay:0.35}} viewport={{once:true}}
          style={{marginTop:18,display:"flex",flexWrap:"wrap",gap:6}}>
          {LEGEND_CATEGORIES.map(({cat,label})=>{
            const isActive=filterCat===cat;
            return (
              <button key={cat} onClick={()=>setFilterCat(isActive?"all":cat)}
                className="pt-legend-pill"
                style={{
                  background: isActive ? CAT_COLOR[cat] : CAT_BG[cat],
                  borderColor: `${CAT_COLOR[cat]}${isActive?"88":"38"}`,
                  color: isActive ? "#fff" : CAT_COLOR[cat],
                  boxShadow: isActive ? `0 2px 10px ${CAT_COLOR[cat]}40` : "none",
                }}>
                <span style={{width:9,height:9,borderRadius:"50%",flexShrink:0,
                  background: isActive ? "rgba(255,255,255,0.80)" : CAT_COLOR[cat],
                  boxShadow: isActive ? "none" : `0 0 5px ${CAT_COLOR[cat]}80`}}/>
                {label}
              </button>
            );
          })}
        </motion.div>
      </div>

      {tooltipEl}
      {modalEl}
      {comparisonEl}
    </section>
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
