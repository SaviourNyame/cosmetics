"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { DomainStatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/format";
import type { OrderDoc } from "@/types/firestore";

const columns: ColumnDef<OrderDoc, unknown>[] = [
  { accessorKey: "orderNumber", header: "Order #" },
  { accessorKey: "quantity", header: "Quantity" },
  { id: "finalPrice", header: "Price", cell: ({ row }) => formatCurrency(row.original.finalPrice) },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <DomainStatusBadge domain="order" status={row.original.status} />,
  },
];

export function SupplierOrdersTable({ data }: { data: OrderDoc[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      emptyTitle="No orders yet"
      emptyDescription="Orders you accept will appear here for you to prepare and update."
    />
  );
}
