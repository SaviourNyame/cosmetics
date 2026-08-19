"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { DomainStatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import type { AdminDoc } from "@/types/firestore";

const columns: ColumnDef<AdminDoc, unknown>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  {
    id: "role",
    header: "Role",
    cell: ({ row }) => (
      <Badge variant={row.original.roleId === "super_admin" ? "dark" : "neutral"}>
        {row.original.roleId === "super_admin" ? "Super Admin" : "Admin"}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <DomainStatusBadge domain="admin" status={row.original.status} />,
  },
];

export function AdministratorsTable({ data }: { data: AdminDoc[] }) {
  return <DataTable columns={columns} data={data} emptyTitle="No administrators found" />;
}
