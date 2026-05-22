import type { Metadata } from "next";
import GasLawsPage from "@/components/experiments/gas-laws/GasLawsPage";

export const metadata: Metadata = {
  title:       "Gas Laws — ChemLab",
  description: "Explore Boyle's Law (P–V) and Charles's Law (V–T) with an interactive ideal-gas container.",
};

export default function Page() {
  return <GasLawsPage />;
}
