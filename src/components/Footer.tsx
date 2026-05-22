"use client";

import Link from "next/link";

const LINKS: Record<string, { label: string; href: string }[]> = {
  Platform: [
    { label: "Dashboard",     href: "/dashboard" },
    { label: "Experiments",   href: "/experiments" },
    { label: "Apparatus",     href: "/apparatus" },
    { label: "Periodic Table",href: "/#elements" },
  ],
  Resources: [
    { label: "Safety Guide",  href: "/safety" },
    { label: "About ChemLab", href: "/about" },
    { label: "Flame Test Lab",href: "/experiments/flame-test" },
    { label: "Titration Lab", href: "/experiments/titration" },
  ],
  Explore: [
    { label: "Electrolysis",        href: "/experiments/electrolysis" },
    { label: "Gas Laws",            href: "/experiments/gas-laws" },
    { label: "Chemical Equilibrium",href: "/experiments/chemical-equilibrium" },
    { label: "Calorimetry",         href: "/experiments/calorimetry" },
  ],
};

export default function Footer() {
  return (
    <footer style={{ background: "var(--lab-off-white)", borderTop: "1px solid var(--lab-glass-border)" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)" }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M6 2v5.5L2.5 13a1.5 1.5 0 001.3 2.25h8.4a1.5 1.5 0 001.3-2.25L10 7.5V2"
                        stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5.5 2h5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                  <circle cx="6.5" cy="11" r="1" fill="rgba(255,255,255,0.7)" />
                </svg>
              </div>
              <span className="text-base font-bold tracking-tight" style={{ color: "var(--lab-text-primary)" }}>
                Chem<span className="gradient-text">Lab</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--lab-text-muted)" }}>
              Advancing chemistry education through immersive, accurate virtual laboratory experiences.
            </p>

            <div className="flex items-center gap-2 mt-5">
              <Link
                href="/about"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors hover:bg-blue-50"
                style={{ borderColor: "var(--lab-glass-border)", color: "var(--lab-text-muted)" }}
              >
                About Us
              </Link>
              <Link
                href="/safety"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors hover:bg-amber-50"
                style={{ borderColor: "var(--lab-glass-border)", color: "var(--lab-text-muted)" }}
              >
                Safety
              </Link>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([section, items]) => (
            <div key={section}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-4"
                 style={{ color: "var(--lab-text-subtle)" }}>
                {section}
              </p>
              <ul className="space-y-2.5">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm transition-colors duration-150 hover:text-blue-600"
                      style={{ color: "var(--lab-text-muted)" }}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderColor: "var(--lab-glass-border)" }}
        >
          <p className="text-xs" style={{ color: "var(--lab-text-subtle)" }}>
            &copy; 2025 ChemLab. Built for curious minds.
          </p>
          <div className="flex items-center gap-5">
            {([
              { label: "About",     href: "/about" },
              { label: "Safety",    href: "/safety" },
              { label: "Dashboard", href: "/dashboard" },
            ] as { label: string; href: string }[]).map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-xs transition-colors duration-150 hover:text-blue-600"
                style={{ color: "var(--lab-text-subtle)" }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
