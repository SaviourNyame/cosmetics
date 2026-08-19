import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc } from "@/lib/firestore/serialize";
import { PageHeader } from "@/components/shared/page-header";
import { FilterBar } from "@/components/shared/filter-bar";
import { CustomersTable } from "./customers-table";
import type { CustomerDoc } from "@/types/firestore";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const snap = await adminDb.collection("customers").orderBy("createdAt", "desc").get().catch(() => null);
  const customers = (snap?.docs.map((d) => serializeDoc(d.data())) ?? []) as CustomerDoc[];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Customers" description="Everyone who has requested or ordered through the platform." />
      <FilterBar searchPlaceholder="Search customers..." />
      <CustomersTable data={customers} />
    </div>
  );
}
