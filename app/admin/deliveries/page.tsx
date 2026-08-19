import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc } from "@/lib/firestore/serialize";
import { PageHeader } from "@/components/shared/page-header";
import { FilterBar } from "@/components/shared/filter-bar";
import { DeliveriesTable } from "./deliveries-table";
import type { DeliveryDoc } from "@/types/firestore";

export const dynamic = "force-dynamic";

export default async function DeliveriesPage() {
  const snap = await adminDb.collection("deliveries").orderBy("createdAt", "desc").get().catch(() => null);
  const deliveries = (snap?.docs.map((d) => serializeDoc(d.data())) ?? []) as DeliveryDoc[];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Deliveries"
        description="Platform delivery, Yango delivery, and customer pickup tracking."
      />
      <FilterBar searchPlaceholder="Search deliveries..." />
      <DeliveriesTable data={deliveries} />
    </div>
  );
}
