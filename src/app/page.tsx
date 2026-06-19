"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HomeCategorySection from "@/components/HomeCategorySection";
import FeatureStrip from "@/components/FeatureStrip";
import SectionCards from "@/components/SectionCards";
import LabEntrancePortal from "@/components/LabEntrancePortal";
import Footer from "@/components/Footer";

const PeriodicTable = dynamic(() => import("@/components/PeriodicTable"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full flex items-center justify-center font-semibold text-slate-400">
      Loading Periodic Table...
    </div>
  ),
});

export default function HomePage() {
  const [showPortal, setShowPortal] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const sessionEntered = sessionStorage.getItem("lab_entered");
    if (sessionEntered === "true") {
      setShowPortal(false);
    }
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  if (showPortal) {
    return <LabEntrancePortal onEnter={() => setShowPortal(false)} />;
  }

  return (
    <>
      <Navbar />
      <main id="top" className="relative overflow-hidden" aria-label="ChemLab homepage">
        {/* 1. Hero — chemistry lab scene + ambient motion */}
        <HeroSection />
        {/* 2. Experiment categories — 5 cinematic cards */}
        <HomeCategorySection />
        {/* 3. Platform showcase — animated stats + experiments */}
        <FeatureStrip />
        {/* 4. Quick nav panels — Virtual Labs + Apparatus */}
        <SectionCards />
        {/* 5. Periodic table — full interactive 118-element table */}
        <PeriodicTable />
      </main>
      <Footer />
    </>
  );
}


