"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { DomainStatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/format";
import type { OrderDoc } from "@/types/firestore";

const columns: ColumnDef<OrderDoc, unknown>[] = [
  { accessorKey: "orderNumber", header: "Order #" },
  { accessorKey: "quantity", header: "Quantity" },
  {
    id: "finalPrice",
    header: "Final Price",
    cell: ({ row }) => formatCurrency(row.original.finalPrice),
  },
  {
    id: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => <DomainStatusBadge domain="payment" status={row.original.paymentStatus} />,
  },
  {
    accessorKey: "status",
    header: "Order Status",
    cell: ({ row }) => <DomainStatusBadge domain="order" status={row.original.status} />,
  },
  { accessorKey: "deliveryMethod", header: "Delivery Method" },
];

export function OrdersTable({ data }: { data: OrderDoc[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      emptyTitle="No orders yet"
      emptyDescription="Orders appear here once a supplier accepts a customer's product request."
    />
  );
}
