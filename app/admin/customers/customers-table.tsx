"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { DomainStatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/format";
import type { CustomerDoc } from "@/types/firestore";

const columns: ColumnDef<CustomerDoc, unknown>[] = [
  { accessorKey: "name", header: "Customer" },
  { accessorKey: "phone", header: "Phone" },
  { id: "requests", header: "Requests", cell: ({ row }) => row.original.stats?.requestCount ?? 0 },
  { id: "orders", header: "Orders", cell: ({ row }) => row.original.stats?.completedOrderCount ?? 0 },
  {
    id: "spent",
    header: "Total Spent",
    cell: ({ row }) => formatCurrency(row.original.stats?.totalSpent ?? 0),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <DomainStatusBadge domain="customer" status={row.original.status} />,
  },
];

export function CustomersTable({ data }: { data: CustomerDoc[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      emptyTitle="No customers yet"
      emptyDescription="Customers appear here after their first product request."
    />
  );
}
