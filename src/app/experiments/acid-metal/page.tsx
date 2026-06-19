import type { Metadata } from "next";
import AcidMetalPage from "@/components/experiments/acid-metal/AcidMetalPage";

export const metadata: Metadata = {
  title:       "Acid-Metal Reactions — ChemLab",
  description: "Examine displacement kinetics of active metals reacting with acids, collect hydrogen gas, and perform splint pop tests.",
};

export default function Page() {
  return <AcidMetalPage />;
}
