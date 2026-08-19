"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { DomainStatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/format";
import type { ProductRequestDoc } from "@/types/firestore";

const columns: ColumnDef<ProductRequestDoc, unknown>[] = [
  { id: "id", header: "Request ID", accessorFn: (r) => r.id.slice(0, 8).toUpperCase() },
  { id: "product", header: "Product", accessorFn: (r) => r.productSnapshot.name },
  { accessorKey: "quantity", header: "Quantity" },
  { accessorKey: "deliveryArea", header: "Delivery Area" },
  {
    id: "confirmedPrice",
    header: "Confirmed Price",
    cell: ({ row }) =>
      row.original.confirmedFinalPrice != null ? formatCurrency(row.original.confirmedFinalPrice) : "—",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <DomainStatusBadge domain="request" status={row.original.status} />,
  },
];

export function RequestsTable({ data }: { data: ProductRequestDoc[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      emptyTitle="No product requests yet"
      emptyDescription="Requests submitted by customers will appear here in real time."
    />
  );
}
