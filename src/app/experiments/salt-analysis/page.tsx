import type { Metadata } from "next";
import SaltAnalysisPage from "@/components/experiments/salt-analysis/SaltAnalysisPage";

export const metadata: Metadata = {
  title: "Qualitative Salt Analysis — ChemLab Virtual Laboratory",
  description: "Identify unknown salts using systematic cation and anion tests. A Class 10-11 analytical chemistry experiment.",
};

export default function SaltAnalysisRoute() {
  return <SaltAnalysisPage />;
}
