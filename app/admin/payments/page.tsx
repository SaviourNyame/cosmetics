import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc } from "@/lib/firestore/serialize";
import { PageHeader } from "@/components/shared/page-header";
import { FilterBar } from "@/components/shared/filter-bar";
import { PaymentsTable } from "./payments-table";
import type { PaymentDoc } from "@/types/firestore";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const snap = await adminDb.collection("payments").orderBy("createdAt", "desc").get().catch(() => null);
  const payments = (snap?.docs.map((d) => serializeDoc(d.data())) ?? []) as PaymentDoc[];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Payments" description="Customer payments, fees, commission, and refunds." />
      <FilterBar searchPlaceholder="Search payments..." />
      <PaymentsTable data={payments} />
    </div>
  );
}
