import type { Metadata } from "next";
import FlameTestPage from "@/components/experiments/flame-test/FlameTestPage";

export const metadata: Metadata = {
  title:       "Flame Test — ChemLab",
  description: "Identify metal ions by the characteristic colours they produce in a Bunsen burner flame.",
};

export default function Page() {
  return <FlameTestPage />;
}
