import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc } from "@/lib/firestore/serialize";
import { PageHeader } from "@/components/shared/page-header";
import { FilterBar } from "@/components/shared/filter-bar";
import { BrandsTable } from "./brands-table";
import type { BrandDoc } from "@/types/firestore";

export const dynamic = "force-dynamic";

export default async function BrandsPage() {
  const snap = await adminDb.collection("brands").orderBy("name", "asc").get().catch(() => null);
  const brands = (snap?.docs.map((d) => serializeDoc(d.data())) ?? []) as BrandDoc[];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Brands" description="Cosmetic brands available on the platform." />
      <FilterBar searchPlaceholder="Search brands..." />
      <BrandsTable data={brands} />
    </div>
  );
}
