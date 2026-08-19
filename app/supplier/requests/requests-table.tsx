"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import type { ProductRequestDoc, RequestInvitationDoc } from "@/types/firestore";

export interface SupplierRequestRow {
  invitation: RequestInvitationDoc;
  request: ProductRequestDoc | null;
}

const columns: ColumnDef<SupplierRequestRow, unknown>[] = [
  { id: "product", header: "Product", accessorFn: (r) => r.request?.productSnapshot.name ?? "—" },
  { id: "quantity", header: "Quantity", accessorFn: (r) => r.request?.quantity ?? "—" },
  { id: "area", header: "Delivery Area", accessorFn: (r) => r.request?.deliveryArea ?? "—" },
  {
    id: "status",
    header: "Invitation Status",
    cell: ({ row }) => <Badge variant="neutral">{row.original.invitation.status}</Badge>,
  },
];

export function SupplierRequestsTable({ data }: { data: SupplierRequestRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      emptyTitle="No requests yet"
      emptyDescription="You'll be notified here the moment a customer requests a product you supply."
    />
  );
}
