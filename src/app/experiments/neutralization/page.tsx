import type { Metadata } from "next";
import NeutralizationPage from "@/components/experiments/neutralization/NeutralizationPage";

export const metadata: Metadata = {
  title: "Neutralization Reaction — ChemLab Virtual Laboratory",
  description: "Study the neutralization of HCl with NaOH, observe heat generation and salt formation. A Class 9-10 chemistry experiment.",
};

export default function NeutralizationRoute() {
  return <NeutralizationPage />;
}
