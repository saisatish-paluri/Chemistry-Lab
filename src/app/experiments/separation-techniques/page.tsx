import type { Metadata } from "next";
import SeparationTechniquesPage from "@/components/experiments/separation-techniques/SeparationTechniquesPage";

export const metadata: Metadata = {
  title: "Separation Techniques — ChemLab",
  description: "Perform filtration, evaporation, distillation and chromatography to separate and purify mixtures.",
};

export default function Page() {
  return <SeparationTechniquesPage />;
}
