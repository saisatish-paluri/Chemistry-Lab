import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AboutClient from "@/components/AboutClient";

export const metadata = {
  title: "About — ChemLab",
  description: "Learn about ChemLab's mission to make chemistry education accessible through interactive virtual experiments.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        <AboutClient />
      </main>
      <Footer />
    </>
  );
}
