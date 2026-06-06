import type { Metadata } from "next";
import FunctionalGroupsPage from "@/components/experiments/functional-groups/FunctionalGroupsPage";

export const metadata: Metadata = {
  title: "Functional Group Identification — ChemLab Virtual Laboratory",
  description: "Identify organic functional groups using Lucas, Tollen's, 2,4-DNP, NaHCO₃, and Hinsberg tests. A Class 11-12 organic chemistry experiment.",
};

export default function FunctionalGroupsRoute() {
  return <FunctionalGroupsPage />;
}
