"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { DomainStatusBadge } from "@/components/shared/status-badge";
import type { SupplierDoc } from "@/types/firestore";

const columns: ColumnDef<SupplierDoc, unknown>[] = [
  { accessorKey: "businessName", header: "Business Name" },
  { accessorKey: "representativeName", header: "Representative" },
  { accessorKey: "businessEmail", header: "Email" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <DomainStatusBadge domain="supplier" status={row.original.status} />,
  },
];

export function ApplicationsTable({ data }: { data: SupplierDoc[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      emptyTitle="No pending applications"
      emptyDescription="New supplier applications will show up here for review."
    />
  );
}
