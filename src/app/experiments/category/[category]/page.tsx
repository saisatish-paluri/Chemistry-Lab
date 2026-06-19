import CategoryPage from "@/components/experiments/CategoryPage";
import { CATEGORIES, type ChemCategory } from "@/lib/experiments-catalog";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.id }));
}

// In Next.js 16 params is a Promise — must be awaited
export default async function Page({
  params,
}: {
  params: Promise<{ category: ChemCategory }>;
}) {
  const { category } = await params;
  return <CategoryPage categoryId={category} />;
}
