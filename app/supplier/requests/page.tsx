import { requireRole } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc } from "@/lib/firestore/serialize";
import { PageHeader } from "@/components/shared/page-header";
import { SupplierRequestsTable, type SupplierRequestRow } from "./requests-table";
import type { ProductRequestDoc, RequestInvitationDoc } from "@/types/firestore";

export const dynamic = "force-dynamic";

export default async function SupplierRequestsPage() {
  const user = await requireRole(["supplier"]);

  const invitationsSnap = await adminDb
    .collectionGroup("invitations")
    .where("supplierId", "==", user.supplierId)
    .orderBy("notifiedAt", "desc")
    .limit(50)
    .get()
    .catch(() => null);

  const invitations = invitationsSnap?.docs ?? [];

  const rows: SupplierRequestRow[] = await Promise.all(
    invitations.map(async (doc) => {
      const invitation = serializeDoc(doc.data()) as RequestInvitationDoc;
      const requestSnap = await doc.ref.parent.parent?.get();
      const request = requestSnap?.exists
        ? (serializeDoc(requestSnap.data()) as ProductRequestDoc)
        : null;
      return { invitation, request };
    })
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Product Requests"
        description="New customer requests for products you supply. First to accept wins the order."
      />
      <SupplierRequestsTable data={rows} />
    </div>
  );
}
