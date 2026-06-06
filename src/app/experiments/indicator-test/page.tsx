import type { Metadata } from "next";
import IndicatorPage from "@/components/experiments/indicator-test/IndicatorPage";

export const metadata: Metadata = {
  title: "Indicator Test — ChemLab Virtual Laboratory",
  description: "Test household substances with turmeric and litmus indicators to identify acids and bases. A Class 7 chemistry experiment.",
};

export default function IndicatorTestPage() {
  return <IndicatorPage />;
}
