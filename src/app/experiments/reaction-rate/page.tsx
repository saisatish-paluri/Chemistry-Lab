import type { Metadata } from "next";
import ReactionRatePage from "@/components/experiments/reaction-rate/ReactionRatePage";

export const metadata: Metadata = {
  title:       "Reaction Rate — ChemLab",
  description: "Explore how temperature, concentration, and surface area affect the rate of a chemical reaction.",
};

export default function Page() {
  return <ReactionRatePage />;
}
