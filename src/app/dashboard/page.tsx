import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardClient from "@/components/DashboardClient";

export const metadata = {
  title: "Dashboard — ChemLab",
  description: "Track your experiment progress, review recent activity, and access quick actions.",
};

export default function DashboardPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16" style={{ background: "var(--lab-off-white)" }}>
        <DashboardClient />
      </main>
      <Footer />
    </>
  );
}
