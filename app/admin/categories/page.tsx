import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc } from "@/lib/firestore/serialize";
import { PageHeader } from "@/components/shared/page-header";
import { FilterBar } from "@/components/shared/filter-bar";
import { CategoriesTable } from "./categories-table";
import type { CategoryDoc } from "@/types/firestore";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const snap = await adminDb.collection("categories").orderBy("displayOrder", "asc").get().catch(() => null);
  const categories = (snap?.docs.map((d) => serializeDoc(d.data())) ?? []) as CategoryDoc[];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Categories" description="Organize the catalogue into browsable categories." />
      <FilterBar searchPlaceholder="Search categories..." />
      <CategoriesTable data={categories} />
    </div>
  );
}
