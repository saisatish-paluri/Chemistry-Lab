"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ApparatusSection from "@/components/ApparatusSection";

export default function ApparatusPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--lab-off-white)" }}>
      <Navbar />
      <main className="flex-1 pt-16">
        <ApparatusSection />
      </main>
      <Footer />
    </div>
  );
}
