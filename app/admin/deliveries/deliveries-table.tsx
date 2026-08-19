"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { DomainStatusBadge } from "@/components/shared/status-badge";
import type { DeliveryDoc } from "@/types/firestore";

const columns: ColumnDef<DeliveryDoc, unknown>[] = [
  { accessorKey: "orderId", header: "Order" },
  { accessorKey: "method", header: "Method" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <DomainStatusBadge domain="delivery" status={row.original.status} />,
  },
  { accessorKey: "riderName", header: "Rider / Driver" },
];

export function DeliveriesTable({ data }: { data: DeliveryDoc[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      emptyTitle="No deliveries yet"
      emptyDescription="Deliveries are created once an order moves to fulfilment."
    />
  );
}
