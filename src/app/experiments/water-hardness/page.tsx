import type { Metadata } from "next";
import WaterHardnessPage from "@/components/experiments/water-hardness/WaterHardnessPage";

export const metadata: Metadata = {
  title: "Water Hardness Test — ChemLab Virtual Laboratory",
  description: "Determine water hardness using EDTA titration with Eriochrome Black T indicator. A Class 11-12 analytical chemistry experiment.",
};

export default function WaterHardnessRoute() {
  return <WaterHardnessPage />;
}
