import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc } from "@/lib/firestore/serialize";
import { PageHeader } from "@/components/shared/page-header";
import { FilterBar } from "@/components/shared/filter-bar";
import { SuppliersTable } from "./suppliers-table";
import type { SupplierDoc } from "@/types/firestore";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const snap = await adminDb.collection("suppliers").orderBy("createdAt", "desc").get().catch(() => null);
  const suppliers = (snap?.docs.map((d) => serializeDoc(d.data())) ?? []) as SupplierDoc[];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Suppliers"
        description="Approved cosmetic suppliers connected to the marketplace."
      />
      <FilterBar searchPlaceholder="Search suppliers..." />
      <SuppliersTable data={suppliers} />
    </div>
  );
}
