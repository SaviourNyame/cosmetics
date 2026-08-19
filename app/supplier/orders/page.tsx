import { requireRole } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc } from "@/lib/firestore/serialize";
import { PageHeader } from "@/components/shared/page-header";
import { SupplierOrdersTable } from "./orders-table";
import type { OrderDoc } from "@/types/firestore";

export const dynamic = "force-dynamic";

export default async function SupplierOrdersPage() {
  const user = await requireRole(["supplier"]);
  const snap = await adminDb
    .collection("orders")
    .where("supplierId", "==", user.supplierId)
    .orderBy("createdAt", "desc")
    .get()
    .catch(() => null);
  const orders = (snap?.docs.map((d) => serializeDoc(d.data())) ?? []) as OrderDoc[];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Orders" description="Orders you've won and are fulfilling." />
      <SupplierOrdersTable data={orders} />
    </div>
  );
}
