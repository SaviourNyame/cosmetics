import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc } from "@/lib/firestore/serialize";
import { PageHeader } from "@/components/shared/page-header";
import { FilterBar } from "@/components/shared/filter-bar";
import { OrdersTable } from "./orders-table";
import type { OrderDoc } from "@/types/firestore";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const snap = await adminDb.collection("orders").orderBy("createdAt", "desc").get().catch(() => null);
  const orders = (snap?.docs.map((d) => serializeDoc(d.data())) ?? []) as OrderDoc[];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Orders" description="Orders created once a supplier accepts a request." />
      <FilterBar searchPlaceholder="Search orders..." />
      <OrdersTable data={orders} />
    </div>
  );
}
