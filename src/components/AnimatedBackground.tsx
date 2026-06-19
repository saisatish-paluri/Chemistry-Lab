"use client";

import React, { useEffect, useRef } from "react";

interface QuantumParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  seed: number;
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    // Initialize quantum wave packets
    const particles: QuantumParticle[] = Array.from({ length: 24 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: 1.5 + Math.random() * 2.0,
      color: Math.random() > 0.5 ? "rgba(34, 211, 238, 0.4)" : "rgba(168, 85, 247, 0.35)",
      seed: Math.random() * 100,
    }));

    let animId: number;

    const renderLoop = () => {
      const isDark = document.documentElement.classList.contains("dark");
      ctx.clearRect(0, 0, width, height);

      const time = Date.now() / 1000;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mActive = mouseRef.current.active;

      // ── Draw Space-Time Grid Warp ──
      // Dynamic styling based on theme
      ctx.strokeStyle = isDark
        ? "rgba(34, 211, 238, 0.035)"
        : "rgba(37, 99, 235, 0.045)";
      ctx.lineWidth = 0.6;

      const gridSpacing = 48;

      // Warp calculation helper
      const warpPoint = (x: number, y: number) => {
        let px = x;
        let py = y;

        // Wave ripple background
        const wave = Math.sin(x / 70 + time * 1.2) * Math.cos(y / 70 + time * 1.2) * 8;
        py += wave;

        if (mActive) {
          const dx = x - mx;
          const dy = y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 280;

          if (dist < maxDist) {
            // Rubber pull deflection
            const influence = Math.pow(1 - dist / maxDist, 2.2);
            // Create a bunching/warp effect towards the mouse coordinates
            const pullScale = 0.38 * Math.sin(time * 2.2 + dist / 45);
            px += -dx * influence * pullScale;
            py += -dy * influence * pullScale;
          }
        }

        return { x: px, y: py };
      };

      // Draw horizontal lines
      for (let y = 0; y < height + gridSpacing; y += gridSpacing) {
        ctx.beginPath();
        for (let x = 0; x < width + 15; x += 15) {
          const pt = warpPoint(x, y);
          if (x === 0) {
            ctx.moveTo(pt.x, pt.y);
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }
        ctx.stroke();
      }

      // Draw vertical lines
      for (let x = 0; x < width + gridSpacing; x += gridSpacing) {
        ctx.beginPath();
        for (let y = 0; y < height + 15; y += 15) {
          const pt = warpPoint(x, y);
          if (y === 0) {
            ctx.moveTo(pt.x, pt.y);
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }
        ctx.stroke();
      }

      // ── Draw Covalent Energy Strings (Bezier Waves) ──
      const drawEnergyString = (
        colorDark: string,
        colorLight: string,
        offsetY: number,
        freq: number,
        amp: number,
        lineWidth: number
      ) => {
        ctx.beginPath();
        ctx.strokeStyle = isDark ? colorDark : colorLight;
        ctx.lineWidth = lineWidth;

        for (let x = 0; x < width + 20; x += 20) {
          // Vibrational calculation
          const yBase = offsetY + Math.sin(x / 180 + time * freq) * amp;
          const pt = warpPoint(x, yBase);
          if (x === 0) {
            ctx.moveTo(pt.x, pt.y);
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }
        ctx.stroke();
      };

      // Cyan wave
      drawEnergyString(
        "rgba(34, 211, 238, 0.08)",
        "rgba(6, 182, 212, 0.09)",
        height * 0.45,
        1.1,
        60,
        1.2
      );
      // Indigo/Purple wave
      drawEnergyString(
        "rgba(168, 85, 247, 0.06)",
        "rgba(99, 102, 241, 0.07)",
        height * 0.55,
        0.8,
        80,
        0.9
      );
      // Blue wave
      drawEnergyString(
        "rgba(59, 130, 246, 0.07)",
        "rgba(29, 78, 216, 0.08)",
        height * 0.35,
        1.4,
        45,
        1.0
      );

      // ── Render Quantum Spark Particles ──
      particles.forEach((p) => {
        // Update physics
        p.x += p.vx;
        p.y += p.vy;

        // Bounce boundaries
        if (p.x < -10 || p.x > width + 10) p.vx *= -1;
        if (p.y < -10 || p.y > height + 10) p.vy *= -1;

        // Wave motion overlay
        const waveX = p.x + Math.sin(time + p.seed) * 12;
        const waveY = p.y + Math.cos(time * 0.8 + p.seed) * 12;

        // Draw particle coordinates warped by grid math
        const pt = warpPoint(waveX, waveY);

        // Particle kinetic excitation near mouse
        let scale = 1.0;
        let glow = 0.0;
        if (mActive) {
          const dx = pt.x - mx;
          const dy = pt.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            const inf = 1 - dist / 200;
            scale = 1.0 + inf * 1.5;
            glow = inf * 0.4;
            // Attract slightly towards mouse
            p.x += -dx * inf * 0.01;
            p.y += -dy * inf * 0.01;
          }
        }

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, p.radius * scale, 0, Math.PI * 2);
        
        if (isDark) {
          ctx.fillStyle = p.color;
        } else {
          // Make colors darker in light mode
          ctx.fillStyle = p.color.replace("0.4", "0.55").replace("0.35", "0.5");
        }
        ctx.fill();

        // Draw energy aura
        if (glow > 0) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, p.radius * scale * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = p.color.replace(/[\d\.]+\)$/, `${glow * 0.3})`);
          ctx.fill();
        }
      });

      animId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none absolute inset-0 overflow-hidden"
    >
      <div
        className="absolute"
        style={{
          top: "-20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "1200px",
          height: "800px",
          background:
            "radial-gradient(ellipse at center, rgba(37,99,235,0.045) 0%, rgba(14,165,233,0.015) 55%, transparent 80%)",
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
        style={{ zIndex: 1 }}
      />
    </div>
  );
}
