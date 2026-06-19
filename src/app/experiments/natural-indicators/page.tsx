import type { Metadata } from "next";
import NaturalIndicatorsPage from "@/components/experiments/natural-indicators/NaturalIndicatorsPage";

export const metadata: Metadata = {
  title:       "Natural pH Indicators — ChemLab",
  description: "Extract organic pigments from natural sources and examine their color transitions under varying pH concentrations.",
};

export default function Page() {
  return <NaturalIndicatorsPage />;
}
