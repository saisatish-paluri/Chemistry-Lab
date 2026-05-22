import type { Metadata } from "next";
import SolubilityPage from "@/components/experiments/solubility/SolubilityPage";

export const metadata: Metadata = {
  title:       "Solubility & Precipitation — ChemLab",
  description: "Mix aqueous ionic solutions and observe precipitation reactions governed by solubility rules.",
};

export default function Page() {
  return <SolubilityPage />;
}
