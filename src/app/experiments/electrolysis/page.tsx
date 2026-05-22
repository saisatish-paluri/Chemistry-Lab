import type { Metadata } from "next";
import ElectrolysisPage from "@/components/experiments/electrolysis/ElectrolysisPage";

export const metadata: Metadata = {
  title:       "Electrolysis — ChemLab",
  description: "Explore electrolysis of ionic solutions — observe gas evolution, half-reactions, and conductivity.",
};

export default function Page() {
  return <ElectrolysisPage />;
}
