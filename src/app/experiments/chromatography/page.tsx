import type { Metadata } from "next";
import ChromatographyPage from "@/components/experiments/chromatography/ChromatographyPage";

export const metadata: Metadata = {
  title: "Paper Chromatography — ChemLab Virtual Laboratory",
  description: "Separate ink dye mixtures using paper chromatography and calculate Rf values. A Class 10-11 analytical chemistry experiment.",
};

export default function ChromatographyRoute() {
  return <ChromatographyPage />;
}
