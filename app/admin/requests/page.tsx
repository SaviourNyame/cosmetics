import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc } from "@/lib/firestore/serialize";
import { PageHeader } from "@/components/shared/page-header";
import { FilterBar } from "@/components/shared/filter-bar";
import { RequestsTable } from "./requests-table";
import type { ProductRequestDoc } from "@/types/firestore";

export const dynamic = "force-dynamic";

export default async function ProductRequestsPage() {
  const snap = await adminDb.collection("productRequests").orderBy("createdAt", "desc").get().catch(() => null);
  const requests = (snap?.docs.map((d) => serializeDoc(d.data())) ?? []) as ProductRequestDoc[];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Product Requests"
        description="Customer requests routed to eligible suppliers, first-to-accept wins."
      />
      <FilterBar searchPlaceholder="Search requests..." />
      <RequestsTable data={requests} />
    </div>
  );
}
