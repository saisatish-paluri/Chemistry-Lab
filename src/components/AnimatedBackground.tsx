import type { CSSProperties } from "react";

export default function AnimatedBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none absolute inset-0 overflow-hidden"
    >
      {/* Fine dot grid — subtle lab-paper texture */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(59,130,246,0.09) 1px, transparent 1px)",
          backgroundSize:  "28px 28px",
        }}
      />

      {/* Primary glow — top center (overhead lab light) */}
      <div
        className="absolute"
        style={{
          top:       "-16%",
          left:      "50%",
          transform: "translateX(-50%)",
          width:     "1100px",
          height:    "700px",
          background:
            "radial-gradient(ellipse at center, rgba(37,99,235,0.10) 0%, rgba(14,165,233,0.04) 40%, transparent 70%)",
          animation: "pulse-glow 9s ease-in-out infinite",
        }}
      />
      {/* Secondary glow — bottom-right */}
      <div
        className="absolute"
        style={{
          bottom:    "-6%",
          right:     "-4%",
          width:     "680px",
          height:    "680px",
          background:
            "radial-gradient(ellipse at center, rgba(6,182,212,0.07) 0%, transparent 65%)",
          animation: "pulse-glow 12s ease-in-out 4s infinite",
        }}
      />
      {/* Accent glow — top-left */}
      <div
        className="absolute"
        style={{
          top:       "8%",
          left:      "-4%",
          width:     "440px",
          height:    "440px",
          background:
            "radial-gradient(ellipse at center, rgba(124,58,237,0.05) 0%, transparent 70%)",
          animation: "pulse-glow 15s ease-in-out 7s infinite",
        }}
      />

      {/* Lab bench horizon line — faint surface suggestion at ~70% vertical */}
      <div
        className="absolute left-0 right-0"
        style={{
          top:        "72%",
          height:     "1px",
          background: "linear-gradient(90deg, transparent 0%, rgba(148,163,184,0.10) 20%, rgba(148,163,184,0.10) 80%, transparent 100%)",
        }}
      />

      {/* Floating chemistry molecules */}
      <MoleculeBenzene style={{ top: "7%",  right: "5%",   animationDuration: "70s" }} />
      <MoleculeWater   style={{ top: "58%", left: "3%",    animationDuration: "18s", animationDelay: "3s" }} />
      <MoleculeChain   style={{ bottom: "10%", right: "16%", animationDuration: "28s", animationDelay: "2s" }} />
      <MoleculeRing    style={{ top: "28%", left: "7%",    animationDuration: "90s" }} />
      <MoleculeTriangle style={{ bottom: "28%", left: "54%", animationDuration: "22s", animationDelay: "5s" }} />
      <AtomOrbit       style={{ top: "45%", right: "12%",  animationDuration: "50s", animationDelay: "1s" }} />
      <DNAHelix        style={{ bottom: "5%",  left: "30%",  animationDuration: "24s", animationDelay: "6s" }} />

      {/* Extra lab apparatus hints */}
      <BuretteHint     style={{ top: "14%", left: "18%",   animationDuration: "20s", animationDelay: "4s"  }} />
      <FlaskHint       style={{ bottom: "16%", right: "30%", animationDuration: "26s", animationDelay: "8s" }} />
      <BeakerHint      style={{ top: "65%", left: "42%",   animationDuration: "32s", animationDelay: "2s"  }} />

      {/* Floating element symbols */}
      {SYMBOLS.map(({ sym, top, left, size, delay, dur }) => (
        <span
          key={sym + top}
          className="absolute font-black tabular-nums select-none"
          style={{
            top,
            left,
            fontSize:      size,
            color:         "rgba(37,99,235,0.060)",
            animation:     `float-xy ${dur} ease-in-out ${delay} infinite`,
            fontFamily:    "var(--font-geist-sans)",
            letterSpacing: "-0.02em",
          }}
        >
          {sym}
        </span>
      ))}
    </div>
  );
}

type SvgProps = { style: CSSProperties };

function MoleculeBenzene({ style }: SvgProps) {
  return (
    <svg
      width="120" height="120" viewBox="0 0 120 120"
      className="absolute"
      style={{ opacity: 0.062, animation: "spin-slow 70s linear infinite", ...style }}
    >
      {[0, 60, 120, 180, 240, 300].map((deg) => {
        const r  = (deg * Math.PI) / 180;
        const r2 = ((deg + 60) * Math.PI) / 180;
        return (
          <line key={deg}
            x1={60 + 40 * Math.cos(r)}  y1={60 + 40 * Math.sin(r)}
            x2={60 + 40 * Math.cos(r2)} y2={60 + 40 * Math.sin(r2)}
            stroke="#2563eb" strokeWidth="2.2"
          />
        );
      })}
      <circle cx="60" cy="60" r="24" stroke="#2563eb" strokeWidth="1.2" strokeDasharray="4 3" fill="none" />
      {[0, 60, 120, 180, 240, 300].map((deg) => {
        const r = (deg * Math.PI) / 180;
        return <circle key={deg} cx={60 + 40 * Math.cos(r)} cy={60 + 40 * Math.sin(r)} r="4.5" fill="#2563eb" />;
      })}
    </svg>
  );
}

function MoleculeWater({ style }: SvgProps) {
  return (
    <svg
      width="88" height="66" viewBox="0 0 88 66"
      className="absolute"
      style={{ opacity: 0.078, animation: "float-y 18s ease-in-out infinite", ...style }}
    >
      <line x1="44" y1="34" x2="16" y2="16" stroke="#06b6d4" strokeWidth="2.2" />
      <line x1="44" y1="34" x2="72" y2="16" stroke="#06b6d4" strokeWidth="2.2" />
      <circle cx="44" cy="34" r="7"   fill="#06b6d4" />
      <circle cx="16" cy="16" r="4.5" fill="#06b6d4" />
      <circle cx="72" cy="16" r="4.5" fill="#06b6d4" />
      <path d="M 30 26 Q 44 20 58 26" stroke="#06b6d4" strokeWidth="1" fill="none" strokeDasharray="2 2" />
    </svg>
  );
}

function MoleculeChain({ style }: SvgProps) {
  return (
    <svg
      width="150" height="44" viewBox="0 0 150 44"
      className="absolute"
      style={{ opacity: 0.062, animation: "float-xy 28s ease-in-out infinite", ...style }}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1={14 + i * 28} y1="22" x2={42 + i * 28} y2="22" stroke="#3b82f6" strokeWidth="2" />
      ))}
      <line x1="70" y1="18" x2="98" y2="18" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <circle key={i} cx={14 + i * 28} cy="22" r="5.5" fill="#3b82f6" />
      ))}
    </svg>
  );
}

function MoleculeRing({ style }: SvgProps) {
  return (
    <svg
      width="100" height="100" viewBox="0 0 100 100"
      className="absolute"
      style={{ opacity: 0.052, animation: "spin-rev 90s linear infinite", ...style }}
    >
      <circle cx="50" cy="50" r="38" stroke="#0ea5e9" strokeWidth="1.8" fill="none" />
      <circle cx="50" cy="50" r="24" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="3 3" fill="none" />
      {[0, 72, 144, 216, 288].map((deg) => {
        const r = (deg * Math.PI) / 180;
        return <circle key={deg} cx={50 + 38 * Math.cos(r)} cy={50 + 38 * Math.sin(r)} r="4.5" fill="#0ea5e9" />;
      })}
    </svg>
  );
}

function MoleculeTriangle({ style }: SvgProps) {
  return (
    <svg
      width="86" height="86" viewBox="0 0 86 86"
      className="absolute"
      style={{ opacity: 0.062, animation: "float-y 22s ease-in-out infinite", ...style }}
    >
      <line x1="43" y1="10" x2="10" y2="72" stroke="#2563eb" strokeWidth="2" />
      <line x1="43" y1="10" x2="76" y2="72" stroke="#2563eb" strokeWidth="2" />
      <line x1="10" y1="72" x2="76" y2="72" stroke="#2563eb" strokeWidth="2" />
      <circle cx="43" cy="10" r="5.5" fill="#2563eb" />
      <circle cx="10" cy="72" r="5.5" fill="#2563eb" />
      <circle cx="76" cy="72" r="5.5" fill="#2563eb" />
      <circle cx="26.5" cy="41"  r="3" fill="#2563eb" opacity="0.5" />
      <circle cx="59.5" cy="41"  r="3" fill="#2563eb" opacity="0.5" />
      <circle cx="43"   cy="72"  r="3" fill="#2563eb" opacity="0.5" />
    </svg>
  );
}

function AtomOrbit({ style }: SvgProps) {
  return (
    <svg
      width="110" height="110" viewBox="0 0 110 110"
      className="absolute"
      style={{ opacity: 0.052, ...style }}
    >
      <circle cx="55" cy="55" r="6" fill="#7c3aed" style={{ animation: "pulse-glow 3s ease-in-out infinite" }} />
      <ellipse cx="55" cy="55" rx="40" ry="14" stroke="#7c3aed" strokeWidth="1.4" fill="none"
               style={{ animation: `spin-slow ${style.animationDuration ?? "50s"} linear infinite` }} />
      <ellipse cx="55" cy="55" rx="40" ry="14" stroke="#2563eb" strokeWidth="1.2" fill="none"
               transform="rotate(60 55 55)"
               style={{ animation: "spin-rev 80s linear infinite" }} />
      <ellipse cx="55" cy="55" rx="40" ry="14" stroke="#0ea5e9" strokeWidth="1" fill="none"
               transform="rotate(120 55 55)"
               style={{ animation: "spin-slow 120s linear infinite" }} />
      <circle cx="95" cy="55" r="3.5" fill="#7c3aed" style={{ animation: "spin-slow 8s linear infinite", transformOrigin: "55px 55px" }} />
      <circle cx="55" cy="15" r="3"   fill="#2563eb" style={{ animation: "spin-slow 12s linear infinite", transformOrigin: "55px 55px" }} />
    </svg>
  );
}

function DNAHelix({ style }: SvgProps) {
  return (
    <svg
      width="60" height="100" viewBox="0 0 60 100"
      className="absolute"
      style={{ opacity: 0.058, animation: "float-y 24s ease-in-out infinite", ...style }}
    >
      <path d="M 10 5 C 50 15 10 30 50 40 C 10 50 50 65 10 75 C 50 85 10 95 50 100"
            stroke="#06b6d4" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 50 5 C 10 15 50 30 10 40 C 50 50 10 65 50 75 C 10 85 50 95 10 100"
            stroke="#7c3aed" strokeWidth="2" fill="none" strokeLinecap="round" />
      {[18, 36, 54, 72, 90].map((y) => (
        <line key={y} x1="10" y1={y} x2="50" y2={y} stroke="#94a3b8" strokeWidth="1.2" />
      ))}
    </svg>
  );
}

// ── Lab apparatus hint silhouettes ────────────────────────────────────────────

function BuretteHint({ style }: SvgProps) {
  return (
    <svg
      width="24" height="80" viewBox="0 0 24 80"
      className="absolute"
      style={{ opacity: 0.055, animation: "float-y 20s ease-in-out infinite", ...style }}
    >
      {/* Tube */}
      <rect x="9" y="2" width="6" height="56" rx="2" fill="#3b82f6" />
      {/* Stopcock */}
      <rect x="5" y="58" width="14" height="5" rx="2.5" fill="#3b82f6" />
      {/* Tip */}
      <rect x="10.5" y="63" width="3" height="12" rx="1" fill="#3b82f6" />
      {/* Clamp */}
      <rect x="0" y="14" width="9" height="4" rx="1.5" fill="#3b82f6" opacity="0.6" />
    </svg>
  );
}

function FlaskHint({ style }: SvgProps) {
  return (
    <svg
      width="50" height="60" viewBox="0 0 50 60"
      className="absolute"
      style={{ opacity: 0.050, animation: "float-xy 26s ease-in-out infinite", ...style }}
    >
      <path
        d="M 19 2 L 19 22 Q 14 28 4 50 L 4 55 L 46 55 L 46 50 Q 36 28 31 22 L 31 2 Z"
        stroke="#3b82f6" strokeWidth="1.5" fill="rgba(59,130,246,0.12)"
        strokeLinejoin="round"
      />
      {/* Liquid hint */}
      <path
        d="M 9 44 Q 25 40 41 44 L 46 55 L 4 55 Z"
        fill="rgba(59,130,246,0.18)"
        clipPath="url(#fh-clip)"
      />
      <line x1="19" y1="2" x2="31" y2="2" stroke="#3b82f6" strokeWidth="2" />
    </svg>
  );
}

function BeakerHint({ style }: SvgProps) {
  return (
    <svg
      width="44" height="48" viewBox="0 0 44 48"
      className="absolute"
      style={{ opacity: 0.048, animation: "float-y 32s ease-in-out infinite", ...style }}
    >
      {/* Body */}
      <path d="M 4 6 L 4 44 L 40 44 L 40 6" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Rim */}
      <path d="M 2 6 L 42 6" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
      {/* Spout */}
      <path d="M 38 3 Q 44 6 42 6" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Liquid */}
      <rect x="5" y="30" width="34" height="13" rx="1" fill="rgba(6,182,212,0.15)" />
      {/* Scale lines */}
      {[16, 24, 32].map((y) => (
        <line key={y} x1="4" y1={y} x2="10" y2={y} stroke="#06b6d4" strokeWidth="0.8" />
      ))}
    </svg>
  );
}

const SYMBOLS = [
  { sym: "H",  top: "14%", left: "11%",  size: "52px", delay: "0s",  dur: "17s" },
  { sym: "O",  top: "70%", left: "20%",  size: "56px", delay: "2s",  dur: "20s" },
  { sym: "Fe", top: "18%", left: "77%",  size: "44px", delay: "5s",  dur: "23s" },
  { sym: "Au", top: "48%", left: "87%",  size: "48px", delay: "1s",  dur: "19s" },
  { sym: "C",  top: "78%", left: "63%",  size: "42px", delay: "8s",  dur: "22s" },
  { sym: "Na", top: "38%", left: "1%",   size: "38px", delay: "3s",  dur: "18s" },
  { sym: "Cu", top: "86%", left: "40%",  size: "34px", delay: "6s",  dur: "24s" },
  { sym: "N",  top: "4%",  left: "48%",  size: "32px", delay: "9s",  dur: "16s" },
  { sym: "Cl", top: "55%", left: "48%",  size: "30px", delay: "11s", dur: "21s" },
  { sym: "K",  top: "92%", left: "80%",  size: "28px", delay: "4s",  dur: "25s" },
];
