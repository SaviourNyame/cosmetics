import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc } from "@/lib/firestore/serialize";
import { PageHeader } from "@/components/shared/page-header";
import { FilterBar } from "@/components/shared/filter-bar";
import { PayoutsTable } from "./payouts-table";
import type { SupplierPayoutDoc } from "@/types/firestore";

export const dynamic = "force-dynamic";

export default async function PayoutsPage() {
  const snap = await adminDb.collection("supplierPayouts").orderBy("createdAt", "desc").get().catch(() => null);
  const payouts = (snap?.docs.map((d) => serializeDoc(d.data())) ?? []) as SupplierPayoutDoc[];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Supplier Payouts" description="Net earnings owed to each supplier." />
      <FilterBar searchPlaceholder="Search payouts..." />
      <PayoutsTable data={payouts} />
    </div>
  );
}
