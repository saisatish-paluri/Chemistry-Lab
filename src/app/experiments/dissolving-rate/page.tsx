import type { Metadata } from "next";
import DissolvingPage from "@/components/experiments/dissolving-rate/DissolvingPage";

export const metadata: Metadata = {
  title: "Dissolving Rate — ChemLab Virtual Laboratory",
  description: "Investigate how stirring, temperature, and particle size affect how fast sugar dissolves. A Class 6-7 chemistry experiment.",
};

export default function DissolvingRatePage() {
  return <DissolvingPage />;
}
