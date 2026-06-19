import type { Metadata } from "next";
import AcidCarbonatePage from "@/components/experiments/acid-carbonate/AcidCarbonatePage";

export const metadata: Metadata = {
  title:       "Acid-Carbonate Reactions — ChemLab",
  description: "Examine stoichiometric carbon dioxide gas evolution, test stopper seals, and check limewater precipitate thresholds.",
};

export default function Page() {
  return <AcidCarbonatePage />;
}
