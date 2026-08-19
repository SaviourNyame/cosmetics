import { requireRole } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc } from "@/lib/firestore/serialize";
import { PageHeader } from "@/components/shared/page-header";
import { SupplierPayoutsTable } from "./payouts-table";
import type { SupplierPayoutDoc } from "@/types/firestore";

export const dynamic = "force-dynamic";

export default async function SupplierPayoutsPage() {
  const user = await requireRole(["supplier"]);
  const snap = await adminDb
    .collection("supplierPayouts")
    .where("supplierId", "==", user.supplierId)
    .orderBy("createdAt", "desc")
    .get()
    .catch(() => null);
  const payouts = (snap?.docs.map((d) => serializeDoc(d.data())) ?? []) as SupplierPayoutDoc[];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Payouts" description="Your payout history." />
      <SupplierPayoutsTable data={payouts} />
    </div>
  );
}
