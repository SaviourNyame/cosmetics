import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc } from "@/lib/firestore/serialize";
import { PageHeader } from "@/components/shared/page-header";
import { FilterBar } from "@/components/shared/filter-bar";
import { ApplicationsTable } from "./applications-table";
import type { SupplierDoc } from "@/types/firestore";

export const dynamic = "force-dynamic";

export default async function SupplierApplicationsPage() {
  const snap = await adminDb
    .collection("suppliers")
    .where("status", "in", ["pending", "under_review"])
    .orderBy("createdAt", "desc")
    .get()
    .catch(() => null);
  const applications = (snap?.docs.map((d) => serializeDoc(d.data())) ?? []) as SupplierDoc[];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Supplier Applications"
        description="Review new supplier applications awaiting approval."
      />
      <FilterBar searchPlaceholder="Search applications..." />
      <ApplicationsTable data={applications} />
    </div>
  );
}
