import type { Metadata } from "next";
import ExperimentsIndex from "@/components/experiments/ExperimentsIndex";

export const metadata: Metadata = {
  title: "Experiments — ChemLab Virtual Laboratory",
  description: "Choose from 10 fully interactive chemistry experiments covering titration, electrolysis, flame tests, gas laws, equilibrium, and more.",
};

export default function ExperimentsPage() {
  return <ExperimentsIndex />;
}
