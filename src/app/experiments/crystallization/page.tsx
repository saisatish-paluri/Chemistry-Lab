import type { Metadata } from "next";
import CrystallizationPage from "@/components/experiments/crystallization/CrystallizationPage";

export const metadata: Metadata = {
  title:       "Crystallization & Purification — ChemLab",
  description: "Purify copper(II) sulfate crystals through saturation, filtration, and recrystallization under controlled cooling kinetics.",
};

export default function Page() {
  return <CrystallizationPage />;
}
