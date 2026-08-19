import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc } from "@/lib/firestore/serialize";
import { PageHeader } from "@/components/shared/page-header";
import { RolesTable } from "./roles-table";
import type { RoleDoc } from "@/types/firestore";

export const dynamic = "force-dynamic";

export default async function RolesPage() {
  const snap = await adminDb.collection("roles").orderBy("name", "asc").get().catch(() => null);
  const roles = (snap?.docs.map((d) => serializeDoc(d.data())) ?? []) as RoleDoc[];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Roles and Permissions"
        description="Super Admin and Admin are system roles; custom roles can be layered in later."
      />
      <RolesTable data={roles} />
    </div>
  );
}
