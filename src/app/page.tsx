import Navbar        from "@/components/Navbar";
import HeroSection   from "@/components/HeroSection";
import FeatureStrip  from "@/components/FeatureStrip";
import SectionCards  from "@/components/SectionCards";
import PeriodicTable from "@/components/PeriodicTable";
import Footer        from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="top">
        <HeroSection />
        <FeatureStrip />
        <SectionCards />
        {/* PeriodicTable has id="elements" internally — Elements nav link targets this */}
        <PeriodicTable />
      </main>
      <Footer />
    </>
  );
}
