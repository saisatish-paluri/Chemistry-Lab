import MolecularViewerPage from "@/components/experiments/molecular-viewer/MolecularViewerPage";

export const metadata = {
  title: "3D Molecular & Vibration Spectroscope — ChemLab",
  description: "Interactive 3D molecular structures, VSEPR geometries, conformers, orbitals, and vibrational spectroscopy.",
};

export default function Page() {
  return <MolecularViewerPage />;
}
