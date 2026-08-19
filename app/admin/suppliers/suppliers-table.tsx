"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { DomainStatusBadge } from "@/components/shared/status-badge";
import type { SupplierDoc } from "@/types/firestore";

const columns: ColumnDef<SupplierDoc, unknown>[] = [
  { accessorKey: "businessName", header: "Business Name" },
  { accessorKey: "businessEmail", header: "Email" },
  { accessorKey: "country", header: "Country" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <DomainStatusBadge domain="supplier" status={row.original.status} />,
  },
  {
    id: "requests",
    header: "Requests",
    cell: ({ row }) => row.original.stats?.requestsReceived ?? 0,
  },
  {
    id: "completedOrders",
    header: "Completed Orders",
    cell: ({ row }) => row.original.stats?.completedOrders ?? 0,
  },
];

export function SuppliersTable({ data }: { data: SupplierDoc[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      emptyTitle="No suppliers yet"
      emptyDescription="Onboarded suppliers will appear here once the Suppliers module goes live."
    />
  );
}
