import type { Metadata } from "next";
import StatesOfMatterPage from "@/components/experiments/states-of-matter/StatesOfMatterPage";

export const metadata: Metadata = {
  title:       "States of Matter — ChemLab",
  description: "Examine solid-liquid-gas transitions, verify latent heat fusion and vaporisation plateaus, and adjust altitude pressure dependencies.",
};

export default function Page() {
  return <StatesOfMatterPage />;
}
