import type { Metadata } from "next";
import FiltrationPage from "@/components/experiments/filtration-basics/FiltrationPage";

export const metadata: Metadata = {
  title: "Filtration Basics — ChemLab Virtual Laboratory",
  description: "Separate insoluble sand from saltwater using a funnel and filter paper. A Class 6 chemistry experiment.",
};

export default function FiltrationBasicsPage() {
  return <FiltrationPage />;
}
