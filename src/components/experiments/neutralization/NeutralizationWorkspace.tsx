"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { NeutralizationState } from "@/lib/engine/types";

interface Props {
  state: Pick<NeutralizationState,
    "currentStep" | "hclVolumeMl" | "naohVolumeMl" | "isMixing" |
    "mixProgress" | "initialTempC" | "currentTempC" | "saltFormed" | "reactionDone"
  >;
}

interface Ripple { id: number; cx: number; cy: number }

const W = 560;
const H = 660;

const C  = 0.1;   // mol/L (both acids)
const V  = 0.025; // L
const DH = 55.8;  // kJ/mol

export default function NeutralizationWorkspace({ state }: Props) {
  const { currentStep, hclVolumeMl, isMixing, mixProgress, initialTempC, currentTempC, saltFormed } = state;
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const rippleId  = useRef(0);
  const rippleRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isMixing) { if (rippleRef.current) clearInterval(rippleRef.current); return; }
    rippleRef.current = setInterval(() => {
      rippleId.current += 1;
      const nid = rippleId.current;
      const cx  = 258 + (Math.random() - 0.5) * 68;
      const cy  = 430 + (Math.random() - 0.5) * 18;
      startTransition(() => setRipples(p => [...p.slice(-5), { id: nid, cx, cy }]));
      setTimeout(() => startTransition(() => setRipples(p => p.filter(r => r.id !== nid))), 900);
    }, 280);
    return () => { if (rippleRef.current) clearInterval(rippleRef.current); };
  }, [isMixing]);

  const hclFill      = currentStep === "measure-hcl" ? 0 : Math.min(hclVolumeMl / 40, 1);
  const naohVisible  = !["mix", "observe", "record"].includes(currentStep);
  const rxnPhase     = ["mix", "observe", "record"].includes(currentStep);
  const rxnFill      = rxnPhase ? (isMixing ? mixProgress * 0.72 : 0.72) : 0;

  const prog = Math.min(mixProgress, 1);
  const rColor = `rgba(${Math.round(200 + 30*(1-prog))},${Math.round(230-38*prog)},${Math.round(255-110*prog)},${0.35 + 0.35*prog})`;

  const tempRange  = 10;
  const tempPct    = Math.min((currentTempC - initialTempC) / tempRange, 1);
  const mercH      = 10 + tempPct * 80;
  const mercColor  = tempPct > 0.65 ? "#dc2626" : tempPct > 0.3 ? "#f97316" : "#3b82f6";

  const nMol      = C * V;
  const nReacted  = nMol * prog;
  const heatKJ    = nReacted * DH;
  const deltaT    = (currentTempC - initialTempC).toFixed(1);
  const showCalc  = prog > 0.08;

  return (
    <div className="lab-ws-area" style={{ width: "100%", height: "auto", maxHeight: "100%", aspectRatio: `${W}/${H}` }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
        <defs>
          <pattern id="neut-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.75" fill="rgba(148,163,184,0.22)" />
          </pattern>
          <linearGradient id="ng-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0f6ff" />
            <stop offset="100%" stopColor="#f8fafc" />
          </linearGradient>
          <linearGradient id="ng-bench" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id="ng-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="rgba(255,255,255,0.65)" />
            <stop offset="45%" stopColor="rgba(255,255,255,0.06)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.25)" />
          </linearGradient>
          <filter id="ng-drop">
            <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="rgba(0,0,0,0.11)" />
          </filter>
          <filter id="ng-glow">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <clipPath id="hcl-c"><rect x="58" y="200" width="94" height="195" /></clipPath>
          <clipPath id="naoh-c"><rect x="380" y="186" width="54" height="212" /></clipPath>
          <clipPath id="rxn-c"><rect x="182" y="268" width="160" height="200" /></clipPath>
          <clipPath id="thm-c"><rect x="476" y="198" width="12" height="206" /></clipPath>
        </defs>

        {/* Background */}
        <rect width={W} height={H} fill="url(#ng-wall)" />
        <rect width={W} height={H} fill="url(#neut-dots)" opacity="0.7" />

        {/* Header bar */}
        <rect x="0" y="0" width={W} height="52" fill="rgba(248,250,252,0.97)" />
        <line x1="0" y1="52" x2={W} y2="52" stroke="rgba(226,232,240,0.9)" strokeWidth="1" />
        <text x={W/2} y="32" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1e293b" letterSpacing="-0.3">
          Neutralisation: HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)
        </text>
        <text x={W/2} y="45" textAnchor="middle" fontSize="9.5" fill="#94a3b8">
          Exothermic reaction · ΔH ≈ −55.8 kJ/mol
        </text>

        {/* Lab bench */}
        <rect x="0" y={H - 128} width={W} height="128" fill="url(#ng-bench)" />
        <rect x="0" y={H - 130} width={W} height="4"   fill="#94a3b8" opacity="0.4" />
        {[1, 2, 3].map(i => (
          <line key={i} x1={i * 140} y1={H-130} x2={i*140} y2={H} stroke="rgba(148,163,184,0.2)" strokeWidth="1" />
        ))}

        {/* Step pill */}
        <rect x="14" y="62" width="190" height="24" rx="7"
          fill="rgba(255,255,255,0.94)" stroke="rgba(148,163,184,0.3)" strokeWidth="1" />
        <circle cx="26" cy="74" r="4.5" fill="#2563eb" />
        <text x="35" y="78" fontSize="10" fontWeight="600" fill="#1d4ed8">
          {currentStep === "measure-hcl"  ? "Step 1 — Measure HCl" :
           currentStep === "measure-naoh" ? "Step 2 — Measure NaOH" :
           currentStep === "mix"          ? "Step 3 — Pour & Mix" :
           currentStep === "observe"      ? "Step 4 — Observe Temp." :
           "Step 5 — Record Results"}
        </text>

        {/* ─── HCl BEAKER (left) ─── */}
        <g filter="url(#ng-drop)">
          <path d="M58 200 L58 390 Q58 402 70 402 L150 402 Q162 402 162 390 L162 200 Z"
            fill="rgba(241,245,249,0.55)" stroke="#94a3b8" strokeWidth="1.9" />
          <path d="M58 205 Q45 190 52 177 Q58 169 60 190"
            fill="rgba(241,245,249,0.42)" stroke="#94a3b8" strokeWidth="1.2" />
          {[{y:250,v:"30"},{y:297,v:"20"},{y:344,v:"10"}].map(({y,v}) => (
            <g key={v}>
              <line x1="60" y1={y} x2="72" y2={y} stroke="#94a3b8" strokeWidth="1" />
              <text x="75" y={y+4} fontSize="8.5" fill="#64748b">{v}</text>
            </g>
          ))}
          <motion.rect x="60" y={402 - 190*hclFill} width="100" height={190*hclFill}
            fill="rgba(254,215,170,0.72)" clipPath="url(#hcl-c)"
            animate={{ y: 402-190*hclFill, height: 190*hclFill }}
            transition={{ duration: 1.3, ease: "easeOut" }}
          />
          {hclFill > 0.05 && (
            <motion.path
              d={`M60 ${402-190*hclFill} Q110 ${402-190*hclFill-7} 160 ${402-190*hclFill}`}
              fill="none" stroke="rgba(251,191,36,0.6)" strokeWidth="1.5"
              animate={{ d: `M60 ${402-190*hclFill} Q110 ${402-190*hclFill-7} 160 ${402-190*hclFill}` }}
            />
          )}
          <rect x="60" y="202" width="14" height="196" fill="url(#ng-sheen)" opacity="0.85" rx="4" />
          {hclFill > 0.05 && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <rect x="163" y={402-190*hclFill-11} width="38" height="17" rx="4"
                fill="rgba(254,235,160,0.97)" stroke="rgba(251,191,36,0.4)" strokeWidth="0.8" />
              <text x="182" y={402-190*hclFill+1} textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#92400e">
                {(hclFill*40).toFixed(0)} mL
              </text>
            </motion.g>
          )}
        </g>
        <text x="110" y="424" textAnchor="middle" fontSize="12.5" fontWeight="800" fill="#b45309">HCl</text>
        <text x="110" y="438" textAnchor="middle" fontSize="9" fill="#78716c">0.1 M · 25 mL</text>

        {/* ─── NaOH CYLINDER (right) ─── */}
        {naohVisible && (
          <g filter="url(#ng-drop)">
            <rect x="380" y="186" width="54" height="212" rx="5"
              fill="rgba(241,245,249,0.55)" stroke="#94a3b8" strokeWidth="1.9" />
            <rect x="378" y="181" width="58" height="9" rx="5"
              fill="rgba(241,245,249,0.55)" stroke="#94a3b8" strokeWidth="1.3" />
            {[{y:220,v:"25"},{y:258,v:"18"},{y:300,v:"11"},{y:342,v:"5"}].map(({y,v}) => (
              <g key={v}>
                <line x1="382" y1={y} x2="392" y2={y} stroke="#94a3b8" strokeWidth="0.9" />
                <text x="394" y={y+3} fontSize="7.5" fill="#64748b">{v}</text>
              </g>
            ))}
            {currentStep !== "measure-hcl" && (
              <>
                <motion.rect x="382" y={398-200*0.72} width="50" height={200*0.72}
                  fill="rgba(187,247,208,0.72)" clipPath="url(#naoh-c)"
                  initial={{ height:0, y:398 }}
                  animate={{ height:200*0.72, y:398-200*0.72 }}
                  transition={{ duration: 1.1, ease: "easeOut" }}
                />
                <motion.path d="M382 258 Q407 252 432 258"
                  fill="none" stroke="rgba(34,197,94,0.55)" strokeWidth="1.5"
                  initial={{ opacity:0 }} animate={{ opacity:1 }}
                />
              </>
            )}
            <rect x="382" y="188" width="9" height="208" fill="url(#ng-sheen)" opacity="0.75" rx="3" />
          </g>
        )}
        {naohVisible && (
          <>
            <text x="407" y="422" textAnchor="middle" fontSize="12.5" fontWeight="800" fill="#166534">NaOH</text>
            <text x="407" y="436" textAnchor="middle" fontSize="9" fill="#78716c">0.1 M · 25 mL</text>
          </>
        )}

        {/* ─── POUR STREAM ─── */}
        <AnimatePresence>
          {isMixing && prog < 0.55 && (
            <motion.g initial={{ opacity:0 }} animate={{ opacity:0.9 }} exit={{ opacity:0 }}>
              <motion.path
                d="M407 396 Q380 415 340 442 Q308 458 282 468"
                fill="none" stroke="rgba(187,247,208,0.78)" strokeWidth="7" strokeLinecap="round"
                strokeDasharray="9 6"
                animate={{ strokeDashoffset: [0,-22] }}
                transition={{ duration: 0.55, repeat: Infinity, ease: "linear" }}
              />
              {/* Droplets */}
              {[0,1,2].map(i => (
                <motion.circle key={i}
                  cx={340 + i*12} cy={442} r="2.5"
                  fill="rgba(187,247,208,0.9)"
                  animate={{ cy:[442,468], opacity:[0.9,0] }}
                  transition={{ duration:0.4, repeat:Infinity, delay:i*0.15, ease:"easeIn" }}
                />
              ))}
            </motion.g>
          )}
        </AnimatePresence>

        {/* ─── REACTION BEAKER (center) ─── */}
        <g filter="url(#ng-drop)">
          <path d="M182 268 L182 456 Q182 470 196 470 L328 470 Q342 470 342 456 L342 268 Z"
            fill="rgba(241,245,249,0.50)" stroke="#64748b" strokeWidth="2.3" />
          <path d="M182 273 Q167 258 174 244 Q181 236 184 258"
            fill="rgba(241,245,249,0.4)" stroke="#64748b" strokeWidth="1.4" />
          {[{y:315,v:"50"},{y:358,v:"35"},{y:400,v:"20"}].map(({y,v}) => (
            <g key={v}>
              <line x1="185" y1={y} x2="200" y2={y} stroke="#94a3b8" strokeWidth="1" />
              <text x="203" y={y+4} fontSize="8.5" fill="#64748b">{v}</text>
            </g>
          ))}
          <motion.rect x="185" y={470-196*rxnFill} width="155" height={196*rxnFill}
            fill={rColor} clipPath="url(#rxn-c)"
            animate={{ y:470-196*rxnFill, height:196*rxnFill, fill:rColor }}
            transition={{ duration:0.9 }}
          />
          {rxnFill > 0.06 && (
            <motion.path
              d={`M185 ${470-196*rxnFill} Q262 ${470-196*rxnFill-9} 339 ${470-196*rxnFill}`}
              fill="none" stroke="rgba(148,163,184,0.5)" strokeWidth="1.5"
              animate={{ d:`M185 ${470-196*rxnFill} Q262 ${470-196*rxnFill-9} 339 ${470-196*rxnFill}` }}
            />
          )}
          <rect x="185" y="270" width="16" height="198" fill="url(#ng-sheen)" opacity="0.88" rx="4" />
        </g>
        <text x="262" y="494" textAnchor="middle" fontSize="11" fontWeight="700" fill="#475569">Reaction Beaker</text>

        {/* Ripples */}
        <AnimatePresence>
          {ripples.map(r => (
            <motion.ellipse key={r.id}
              cx={r.cx} cy={r.cy} rx="0" ry="0"
              fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"
              animate={{ rx:28, ry:7, opacity:[0.85,0] }}
              transition={{ duration:0.9, ease:"easeOut" }}
            />
          ))}
        </AnimatePresence>

        {/* Swirl */}
        <AnimatePresence>
          {isMixing && (
            <motion.g initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
              {[0,120,240].map((ang, i) => (
                <motion.path key={i}
                  d={`M262 420 Q${262+34*Math.cos((ang+42)*Math.PI/180)} ${420+34*Math.sin((ang+42)*Math.PI/180)} ${262+40*Math.cos(ang*Math.PI/180)} ${420+40*Math.sin(ang*Math.PI/180)}`}
                  fill="none" stroke="rgba(255,255,255,0.52)" strokeWidth="2.2" strokeLinecap="round"
                  animate={{ rotate:360 }}
                  transition={{ duration:1.35, repeat:Infinity, ease:"linear", delay:i*0.46 }}
                  style={{ transformOrigin:"262px 420px" }}
                />
              ))}
            </motion.g>
          )}
        </AnimatePresence>

        {/* Heat waves */}
        <AnimatePresence>
          {prog > 0.25 && !state.reactionDone && (
            <motion.g initial={{ opacity:0 }} animate={{ opacity:0.78 }} exit={{ opacity:0 }}>
              {[218,248,278,308].map((x, i) => (
                <motion.path key={x}
                  d={`M${x} ${470-196*rxnFill-7} Q${x+10} ${470-196*rxnFill-26} ${x} ${470-196*rxnFill-44}`}
                  fill="none"
                  stroke={tempPct>0.55 ? "rgba(239,68,68,0.55)" : "rgba(249,115,22,0.48)"}
                  strokeWidth="2" strokeLinecap="round"
                  animate={{ y:[-3,3,-3] }}
                  transition={{ duration:1.5+i*0.2, repeat:Infinity, delay:i*0.28 }}
                />
              ))}
            </motion.g>
          )}
        </AnimatePresence>

        {/* Stirring rod */}
        {(isMixing || currentStep==="observe" || currentStep==="record") && (
          <motion.g>
            <motion.line x1="258" y1="236" x2="266" y2="463"
              stroke="#94a3b8" strokeWidth="4.5" strokeLinecap="round"
              animate={{ x1:[253,272,253], x2:[258,275,258] }}
              transition={{ duration:1.3, repeat:isMixing?Infinity:0, ease:"easeInOut" }}
            />
            <motion.circle cx="262" cy="236" r="5.5" fill="#64748b"
              animate={{ cx:[255,272,255] }}
              transition={{ duration:1.3, repeat:isMixing?Infinity:0, ease:"easeInOut" }}
            />
          </motion.g>
        )}

        {/* NaCl crystals */}
        <AnimatePresence>
          {saltFormed && (
            <motion.g initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
              {[[228,445],[252,460],[276,452],[298,459],[243,440],[270,444]].map(([cx,cy],i) => (
                <motion.rect key={i}
                  x={cx-4} y={cy-4} width="8" height="8"
                  fill="rgba(255,255,255,0.9)" stroke="rgba(186,230,253,0.6)" strokeWidth="0.9"
                  transform={`rotate(45 ${cx} ${cy})`}
                  animate={{ opacity:[0.4,1,0.4] }}
                  transition={{ duration:2.2, repeat:Infinity, delay:i*0.38 }}
                />
              ))}
            </motion.g>
          )}
        </AnimatePresence>

        {/* ─── THERMOMETER ─── */}
        <g>
          <rect x="473" y="200" width="18" height="205" rx="9"
            fill="rgba(241,245,249,0.72)" stroke="#94a3b8" strokeWidth="1.6" />
          <circle cx="482" cy="414" r="14" fill="rgba(241,245,249,0.72)" stroke="#94a3b8" strokeWidth="1.6" />
          <motion.rect x="478" y={402-mercH} width="8" height={mercH}
            fill={mercColor} rx="2" clipPath="url(#thm-c)"
            animate={{ y:402-mercH, height:mercH, fill:mercColor }}
            transition={{ duration:1.6, ease:"easeOut" }}
          />
          <motion.circle cx="482" cy="411" r="11" fill={mercColor}
            animate={{ fill:mercColor }} transition={{ duration:1.6 }}
          />
          {[20,25,30,35,40,45].map((t,i) => {
            const ty = 396 - i*16.5;
            return (
              <g key={t}>
                <line x1="491" y1={ty} x2="498" y2={ty} stroke="#94a3b8" strokeWidth="1" />
                <text x="501" y={ty+4} fontSize="8" fill="#64748b">{t}°</text>
              </g>
            );
          })}
          {/* Temperature reading label */}
          <motion.g
            animate={{ y: -(402-mercH-220) }}
            style={{ y: -(402-mercH-220) }}
          >
            <rect x="456" y={398-mercH-26} width="52" height="18" rx="5"
              fill={tempPct>0.3 ? "rgba(254,226,226,0.97)" : "rgba(219,234,254,0.97)"}
              stroke={tempPct>0.3 ? "rgba(239,68,68,0.3)" : "rgba(37,99,235,0.22)"} strokeWidth="1" />
            <motion.text x="482" y={398-mercH-14} textAnchor="middle" fontSize="9.5" fontWeight="700"
              fill={tempPct>0.3 ? "#dc2626" : "#2563eb"}
              animate={{ fill:tempPct>0.3?"#dc2626":"#2563eb" }}
            >
              {currentTempC.toFixed(1)}°C
            </motion.text>
          </motion.g>
        </g>

        {/* ΔT badge */}
        <AnimatePresence>
          {currentTempC > initialTempC + 0.6 && (
            <motion.g
              initial={{ opacity:0, scale:0.7 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
              style={{ transformOrigin:"418px 140px" }}
            >
              <rect x="386" y="120" width="100" height="44" rx="11"
                fill="rgba(254,226,226,0.98)" stroke="rgba(239,68,68,0.38)" strokeWidth="1.6" />
              <text x="436" y="140" textAnchor="middle" fontSize="12" fontWeight="800" fill="#b91c1c">
                ΔT = +{deltaT}°C
              </text>
              <text x="436" y="154" textAnchor="middle" fontSize="9" fill="#991b1b">Exothermic ↑</text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* ─── LIVE CALCULATION PANEL ─── */}
        <AnimatePresence>
          {showCalc && (
            <motion.g initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}>
              <rect x="14" y="62" width="162" height="158" rx="11"
                fill="rgba(239,246,255,0.97)" stroke="rgba(37,99,235,0.22)" strokeWidth="1.3" />
              <rect x="14" y="62" width="162" height="30" rx="11"
                fill="rgba(219,234,254,0.55)" />
              <rect x="14" y="86" width="162" height="6" rx="0"
                fill="rgba(219,234,254,0.35)" />
              <text x="95" y="82" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#1d4ed8" letterSpacing="0.4">
                LIVE CALCULATIONS
              </text>
              {[
                { label:"n(HCl)  = C×V",  value:`${nMol.toFixed(4)} mol`, color:"#b45309" },
                { label:"n(NaOH) = C×V",  value:`${nMol.toFixed(4)} mol`, color:"#166534" },
                { label:`Progress`,        value:`${(prog*100).toFixed(0)}%`,  color:"#7c3aed" },
                { label:"n reacted",       value:`${nReacted.toFixed(5)} mol`, color:"#0284c7" },
                { label:"ΔH = n×55.8",    value:`${heatKJ.toFixed(3)} kJ`,    color:"#dc2626" },
                { label:"ΔT (observed)",   value:`+${deltaT}°C`,              color:tempPct>0.3?"#dc2626":"#64748b" },
                { label:"pH final",        value:saltFormed ? "≈ 7.0" : "—",   color:"#059669" },
              ].map(({ label, value, color }, i) => (
                <g key={label}>
                  {i > 0 && <line x1="24" y1={107+i*16} x2="168" y2={107+i*16} stroke="rgba(148,163,184,0.18)" strokeWidth="0.6" />}
                  <text x="24" y={118+i*16} fontSize="8" fill="#475569">{label}</text>
                  <text x="168" y={118+i*16} textAnchor="end" fontSize="8.5" fontWeight="700" fill={color}>
                    {value}
                  </text>
                </g>
              ))}
            </motion.g>
          )}
        </AnimatePresence>

        {/* ─── PRODUCT BADGE ─── */}
        <AnimatePresence>
          {saltFormed && (
            <motion.g
              initial={{ opacity:0, scale:0.65, y:18 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0 }}
              style={{ transformOrigin:"262px 560px" }}
            >
              <rect x="182" y="500" width="162" height="44" rx="11"
                fill="rgba(240,253,244,0.98)" stroke="rgba(34,197,94,0.48)" strokeWidth="1.8"
                filter="url(#ng-glow)"
              />
              <text x="263" y="519" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#166534">
                NaCl(aq) + H₂O formed ✓
              </text>
              <text x="263" y="533" textAnchor="middle" fontSize="9" fill="#059669">
                Neutral (pH ≈ 7) · Exothermic complete
              </text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* ─── EMPTY STATE ─── */}
        {!rxnPhase && !naohVisible && (
          <g opacity="0.4">
            <rect x="182" y="268" width="162" height="200" rx="6"
              fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="6 4" />
            <text x="263" y="366" textAnchor="middle" fontSize="10" fill="#94a3b8">
              Reaction beaker
            </text>
          </g>
        )}

        {/* ─── EQUATION OVERLAY (final) ─── */}
        <AnimatePresence>
          {state.reactionDone && (
            <motion.g initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
              <rect x="14" y="228" width="162" height="34" rx="9"
                fill="rgba(240,253,244,0.97)" stroke="rgba(34,197,94,0.35)" strokeWidth="1.2" />
              <text x="95" y="243" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#166534">
                Reaction Complete ✓
              </text>
              <text x="95" y="255" textAnchor="middle" fontSize="8.5" fill="#059669">
                1:1 stoichiometry confirmed
              </text>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
    </div>
  );
}
