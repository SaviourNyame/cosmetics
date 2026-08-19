"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import type { RoleDoc } from "@/types/firestore";

const columns: ColumnDef<RoleDoc, unknown>[] = [
  { accessorKey: "name", header: "Role" },
  {
    id: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant={row.original.isSystem ? "dark" : "neutral"}>
        {row.original.isSystem ? "System" : "Custom"}
      </Badge>
    ),
  },
  {
    id: "permissions",
    header: "Permissions",
    cell: ({ row }) =>
      row.original.isSystem ? "All permissions" : `${row.original.permissions.length} granted`,
  },
];

export function RolesTable({ data }: { data: RoleDoc[] }) {
  return <DataTable columns={columns} data={data} emptyTitle="No roles found" />;
}
