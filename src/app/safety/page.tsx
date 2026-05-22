import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SafetyClient from "@/components/SafetyClient";

export const metadata = {
  title: "Safety — ChemLab",
  description: "Essential lab safety rules, PPE requirements, chemical handling protocols, and emergency procedures.",
};

export default function SafetyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        <SafetyClient />
      </main>
      <Footer />
    </>
  );
}
