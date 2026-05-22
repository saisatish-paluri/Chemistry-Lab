import type { Metadata } from "next";
import TitrationPage from "@/components/experiments/titration/TitrationPage";

export const metadata: Metadata = {
  title:       "Acid-Base Titration — ChemLab",
  description: "Simulate a strong acid–strong base titration with live pH tracking, indicators, and endpoint detection.",
};

export default function Page() {
  return <TitrationPage />;
}
