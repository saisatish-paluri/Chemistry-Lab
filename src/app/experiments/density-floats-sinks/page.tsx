import type { Metadata } from "next";
import DensityPage from "@/components/experiments/density-floats-sinks/DensityPage";

export const metadata: Metadata = {
  title: "Density & Floating/Sinking — ChemLab Virtual Laboratory",
  description: "Discover why objects float or sink by comparing their density to water. An interactive Class 6 physics experiment.",
};

export default function DensityFloatsSinksPage() {
  return <DensityPage />;
}
