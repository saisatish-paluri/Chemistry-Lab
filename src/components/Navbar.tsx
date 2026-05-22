"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

const NAV_LINKS = [
  { label: "Home",        href: "/",           exact: true  },
  { label: "Dashboard",   href: "/dashboard",  exact: false },
  { label: "Experiments", href: "/experiments",exact: false },
  { label: "Safety",      href: "/safety",     exact: false },
  { label: "About",       href: "/about",      exact: false },
  { label: "Apparatus",   href: "/apparatus",  exact: false },
  { label: "Elements",    href: "/#elements",  exact: false },
];

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const pathname = usePathname();
  const router   = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string, exact: boolean) => {
    if (href.startsWith("/#")) return false;
    if (exact) return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleElementsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    if (pathname === "/") {
      document.getElementById("elements")?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/#elements");
      setTimeout(() => {
        document.getElementById("elements")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background:           scrolled ? "var(--lab-glass-heavy)" : "transparent",
        backdropFilter:       scrolled ? "blur(24px) saturate(1.6)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(24px) saturate(1.6)" : "none",
        borderBottom:         scrolled ? "1px solid var(--lab-glass-border)" : "none",
        boxShadow:            scrolled ? "0 1px 0 rgba(255,255,255,0.8) inset, var(--lab-shadow-sm)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-3">

        {/* ── Logo ── */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group flex-shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          aria-label="ChemLab — go to homepage"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 100%)",
              boxShadow:  "0 2px 8px rgba(37,99,235,0.32)",
            }}
          >
            <FlaskIcon />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-black tracking-tight" style={{ color: "var(--lab-text-primary)" }}>
              Chem<span className="gradient-text">Lab</span>
            </span>
            <span className="text-[9px] font-medium" style={{ color: "var(--lab-text-subtle)" }}>
              Virtual Laboratory
            </span>
          </div>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center" aria-label="Main navigation">
          {NAV_LINKS.map(({ label, href, exact }) => {
            const active = isActive(href, exact);
            if (href === "/#elements") {
              return (
                <a
                  key={label}
                  href={href}
                  onClick={handleElementsClick}
                  className="px-3 py-2 text-[13px] font-medium rounded-lg transition-all duration-150 hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 cursor-pointer"
                  style={{
                    color:      "var(--lab-text-tertiary)",
                    fontWeight: 500,
                    background: "transparent",
                  }}
                >
                  {label}
                </a>
              );
            }
            return (
              <Link
                key={label}
                href={href}
                className="px-3 py-2 text-[13px] font-medium rounded-lg transition-all duration-150 hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                style={{
                  color:      active ? "var(--lab-blue-600)" : "var(--lab-text-tertiary)",
                  fontWeight: active ? 600 : 500,
                  background: active ? "rgba(37,99,235,0.06)" : "transparent",
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* ── CTA + mobile toggle ── */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <Link
            href="/experiments"
            className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-150 hover:opacity-90 hover:-translate-y-0.5 hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            style={{
              background: "linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 100%)",
              boxShadow:  "0 2px 10px rgba(37,99,235,0.28)",
            }}
          >
            Open Lab
            <ArrowIcon />
          </Link>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
          >
            <span
              className="block w-5 h-0.5 bg-slate-600 transition-all duration-200 origin-center"
              style={{ transform: menuOpen ? "rotate(45deg) translateY(4px)" : "none" }}
            />
            <span
              className="block w-5 h-0.5 bg-slate-600 transition-all duration-200"
              style={{ opacity: menuOpen ? 0 : 1 }}
            />
            <span
              className="block w-5 h-0.5 bg-slate-600 transition-all duration-200 origin-center"
              style={{ transform: menuOpen ? "rotate(-45deg) translateY(-4px)" : "none" }}
            />
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden overflow-hidden"
          >
            <div
              className="glass-heavy border-t px-4 py-4 flex flex-col gap-0.5"
              style={{ borderColor: "var(--lab-glass-border)" }}
            >
              {NAV_LINKS.map(({ label, href, exact }) => {
                const active = isActive(href, exact);
                if (href === "/#elements") {
                  return (
                    <a
                      key={label}
                      href={href}
                      onClick={handleElementsClick}
                      className="py-2.5 px-3 text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
                      style={{
                        color:      "var(--lab-text-tertiary)",
                        background: "transparent",
                      }}
                    >
                      {label}
                    </a>
                  );
                }
                return (
                  <Link
                    key={label}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="py-2.5 px-3 text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    style={{
                      color:      active ? "var(--lab-blue-600)" : "var(--lab-text-tertiary)",
                      fontWeight: active ? 600 : 500,
                      background: active ? "rgba(37,99,235,0.06)" : "transparent",
                    }}
                  >
                    {label}
                  </Link>
                );
              })}
              <Link
                href="/experiments"
                onClick={() => setMenuOpen(false)}
                className="mt-2 py-2.5 px-3 text-sm font-semibold text-white rounded-lg text-center active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 100%)" }}
              >
                Open Laboratory
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function FlaskIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 2v5.5L2.5 13a1.5 1.5 0 001.3 2.25h8.4a1.5 1.5 0 001.3-2.25L10 7.5V2"
            stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 2h5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="6.5" cy="11"   r="1"    fill="rgba(255,255,255,0.7)" />
      <circle cx="9.5" cy="12.5" r="0.75" fill="rgba(255,255,255,0.5)" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M2 6.5h9M8 3l3.5 3.5L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
