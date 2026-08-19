import { requireRole } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc } from "@/lib/firestore/serialize";
import { PageHeader } from "@/components/shared/page-header";
import { SupplierProductsTable } from "./products-table";
import type { ProductSupplierDoc } from "@/types/firestore";

export const dynamic = "force-dynamic";

export default async function SupplierProductsPage() {
  const user = await requireRole(["supplier"]);
  const snap = await adminDb
    .collection("productSuppliers")
    .where("supplierId", "==", user.supplierId)
    .get()
    .catch(() => null);
  const assignments = (snap?.docs.map((d) => serializeDoc(d.data())) ?? []) as ProductSupplierDoc[];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My Products"
        description="Products the admin has assigned to you, and the prices you've set."
      />
      <SupplierProductsTable data={assignments} />
    </div>
  );
}
