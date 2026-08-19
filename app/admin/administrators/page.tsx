import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc } from "@/lib/firestore/serialize";
import { PageHeader } from "@/components/shared/page-header";
import { FilterBar } from "@/components/shared/filter-bar";
import { AdministratorsTable } from "./administrators-table";
import type { AdminDoc } from "@/types/firestore";

export const dynamic = "force-dynamic";

export default async function AdministratorsPage() {
  const snap = await adminDb.collection("admins").orderBy("createdAt", "desc").get().catch(() => null);
  const admins = (snap?.docs.map((d) => serializeDoc(d.data())) ?? []) as AdminDoc[];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Administrators" description="Everyone with access to this dashboard." />
      <FilterBar searchPlaceholder="Search administrators..." />
      <AdministratorsTable data={admins} />
    </div>
  );
}
