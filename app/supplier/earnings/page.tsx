import { requireRole } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc } from "@/lib/firestore/serialize";
import { PageHeader } from "@/components/shared/page-header";
import { EarningsTable } from "./earnings-table";
import type { SupplierEarningDoc } from "@/types/firestore";

export const dynamic = "force-dynamic";

export default async function SupplierEarningsPage() {
  const user = await requireRole(["supplier"]);
  const snap = await adminDb
    .collection("supplierEarnings")
    .where("supplierId", "==", user.supplierId)
    .orderBy("createdAt", "desc")
    .get()
    .catch(() => null);
  const earnings = (snap?.docs.map((d) => serializeDoc(d.data())) ?? []) as SupplierEarningDoc[];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Earnings" description="Your net earnings from completed orders." />
      <EarningsTable data={earnings} />
    </div>
  );
}
