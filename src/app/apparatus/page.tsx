import type { Metadata } from "next";
import ApparatusPage from "@/components/ApparatusPage";

export const metadata: Metadata = {
  title: "Apparatus — ChemLab Virtual Laboratory",
  description: "Explore all the laboratory apparatus and instruments used in ChemLab virtual experiments, with detailed descriptions and interactive SVG illustrations.",
};

export default function Page() {
  return <ApparatusPage />;
}
