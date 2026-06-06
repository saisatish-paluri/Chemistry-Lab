import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeatureStrip from "@/components/FeatureStrip";
import PeriodicTable from "@/components/PeriodicTable";
import SectionCards from "@/components/SectionCards";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="top" aria-label="ChemLab homepage">
        {/* 1. Hero — full-bleed, first thing the user sees */}
        <HeroSection />
        {/* 2. Feature highlights */}
        <FeatureStrip />
        {/* 3. Interactive periodic table — centered */}
        <PeriodicTable />
        {/* 4. Navigation cards */}
        <SectionCards />
      </main>
      <Footer />
    </>
  );
}
