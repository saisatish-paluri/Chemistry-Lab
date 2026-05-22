import type { CSSProperties } from "react";

export default function AnimatedBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none absolute inset-0 overflow-hidden"
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(59,130,246,0.12) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Radial glow — top center */}
      <div
        className="absolute"
        style={{
          top: "-20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "900px",
          height: "600px",
          background:
            "radial-gradient(ellipse at center, rgba(59,130,246,0.08) 0%, transparent 70%)",
          animation: "pulse-glow 8s ease-in-out infinite",
        }}
      />
      {/* Radial glow — bottom right */}
      <div
        className="absolute"
        style={{
          bottom: "-10%",
          right: "-5%",
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(ellipse at center, rgba(6,182,212,0.06) 0%, transparent 70%)",
          animation: "pulse-glow 10s ease-in-out 3s infinite",
        }}
      />

      {/* Floating molecule SVGs */}
      <MoleculeBenzene style={{ top: "8%", right: "6%", animationDelay: "0s", animationDuration: "18s" }} />
      <MoleculeWater   style={{ top: "60%", left: "4%", animationDelay: "4s", animationDuration: "22s" }} />
      <MoleculeChain   style={{ bottom: "12%", right: "18%", animationDelay: "2s", animationDuration: "26s" }} />
      <MoleculeRing    style={{ top: "30%", left: "8%", animationDelay: "7s", animationDuration: "20s" }} />
      <MoleculeTriangle style={{ bottom: "30%", left: "55%", animationDelay: "5s", animationDuration: "24s" }} />

      {/* Floating element symbols */}
      {SYMBOLS.map(({ sym, top, left, size, delay, dur }) => (
        <span
          key={sym + top}
          className="absolute font-black tabular-nums select-none"
          style={{
            top,
            left,
            fontSize: size,
            color: "rgba(59,130,246,0.07)",
            animation: `float-xy ${dur} ease-in-out ${delay} infinite`,
            fontFamily: "var(--font-geist-sans)",
          }}
        >
          {sym}
        </span>
      ))}
    </div>
  );
}

/* ── Molecule shapes ─────────────────────────────────────── */

type SvgProps = { style: CSSProperties };

function MoleculeBenzene({ style }: SvgProps) {
  return (
    <svg
      width="110" height="110" viewBox="0 0 110 110"
      className="absolute"
      style={{ opacity: 0.07, animation: `spin-slow 60s linear infinite`, ...style }}
    >
      {/* Benzene ring */}
      {[0, 60, 120, 180, 240, 300].map((deg) => {
        const r = (deg * Math.PI) / 180;
        const r2 = ((deg + 60) * Math.PI) / 180;
        const f = (v: number) => Math.round(v * 1000) / 1000;
        const nx = f(55 + 36 * Math.cos(r));
        const ny = f(55 + 36 * Math.sin(r));
        const nx2 = f(55 + 36 * Math.cos(r2));
        const ny2 = f(55 + 36 * Math.sin(r2));
        return <line key={deg} x1={nx} y1={ny} x2={nx2} y2={ny2} stroke="#2563eb" strokeWidth="2" />;
      })}
      {[0, 60, 120, 180, 240, 300].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const f = (v: number) => Math.round(v * 1000) / 1000;
        return <circle key={deg} cx={f(55 + 36 * Math.cos(rad))} cy={f(55 + 36 * Math.sin(rad))} r="4" fill="#2563eb" />;
      })}
    </svg>
  );
}

function MoleculeWater({ style }: SvgProps) {
  return (
    <svg
      width="80" height="60" viewBox="0 0 80 60"
      className="absolute"
      style={{ opacity: 0.09, animation: `float-y 14s ease-in-out infinite`, ...style }}
    >
      <line x1="40" y1="30" x2="14" y2="14" stroke="#06b6d4" strokeWidth="2" />
      <line x1="40" y1="30" x2="66" y2="14" stroke="#06b6d4" strokeWidth="2" />
      <circle cx="40" cy="30" r="6" fill="#06b6d4" />
      <circle cx="14" cy="14" r="4" fill="#06b6d4" />
      <circle cx="66" cy="14" r="4" fill="#06b6d4" />
    </svg>
  );
}

function MoleculeChain({ style }: SvgProps) {
  return (
    <svg
      width="130" height="40" viewBox="0 0 130 40"
      className="absolute"
      style={{ opacity: 0.07, animation: `float-xy 20s ease-in-out infinite`, ...style }}
    >
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={15 + i * 30} y1="20" x2={45 + i * 30} y2="20" stroke="#3b82f6" strokeWidth="2" />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={15 + i * 30} cy="20" r="5" fill="#3b82f6" />
      ))}
    </svg>
  );
}

function MoleculeRing({ style }: SvgProps) {
  return (
    <svg
      width="90" height="90" viewBox="0 0 90 90"
      className="absolute"
      style={{ opacity: 0.06, animation: `spin-rev 80s linear infinite`, ...style }}
    >
      <circle cx="45" cy="45" r="34" stroke="#0ea5e9" strokeWidth="1.5" fill="none" />
      {[0, 72, 144, 216, 288].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const f = (v: number) => Math.round(v * 1000) / 1000;
        return <circle key={deg} cx={f(45 + 34 * Math.cos(rad))} cy={f(45 + 34 * Math.sin(rad))} r="4" fill="#0ea5e9" />;
      })}
    </svg>
  );
}

function MoleculeTriangle({ style }: SvgProps) {
  return (
    <svg
      width="80" height="80" viewBox="0 0 80 80"
      className="absolute"
      style={{ opacity: 0.07, animation: `float-y 17s ease-in-out 3s infinite`, ...style }}
    >
      <line x1="40" y1="10" x2="10" y2="66" stroke="#2563eb" strokeWidth="2" />
      <line x1="40" y1="10" x2="70" y2="66" stroke="#2563eb" strokeWidth="2" />
      <line x1="10"  y1="66" x2="70" y2="66" stroke="#2563eb" strokeWidth="2" />
      <circle cx="40" cy="10" r="5" fill="#2563eb" />
      <circle cx="10" cy="66" r="5" fill="#2563eb" />
      <circle cx="70" cy="66" r="5" fill="#2563eb" />
    </svg>
  );
}

/* Floating symbol data */
const SYMBOLS = [
  { sym: "H",  top: "15%", left: "12%",  size: "48px", delay: "0s",  dur: "16s", opacity: 0.06 },
  { sym: "O",  top: "72%", left: "22%",  size: "52px", delay: "2s",  dur: "19s", opacity: 0.06 },
  { sym: "Fe", top: "20%", left: "78%",  size: "40px", delay: "5s",  dur: "22s", opacity: 0.06 },
  { sym: "Au", top: "50%", left: "88%",  size: "44px", delay: "1s",  dur: "18s", opacity: 0.06 },
  { sym: "C",  top: "80%", left: "65%",  size: "38px", delay: "8s",  dur: "21s", opacity: 0.06 },
  { sym: "Na", top: "40%", left: "2%",   size: "36px", delay: "3s",  dur: "17s", opacity: 0.06 },
  { sym: "Cu", top: "88%", left: "42%",  size: "32px", delay: "6s",  dur: "23s", opacity: 0.06 },
  { sym: "N",  top: "5%",  left: "50%",  size: "30px", delay: "9s",  dur: "15s", opacity: 0.06 },
];
