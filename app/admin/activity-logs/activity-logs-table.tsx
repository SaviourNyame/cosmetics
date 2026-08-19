"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import type { ActivityLogDoc } from "@/types/firestore";

const columns: ColumnDef<ActivityLogDoc, unknown>[] = [
  { accessorKey: "userName", header: "User" },
  { id: "role", header: "Role", cell: ({ row }) => <Badge variant="neutral">{row.original.userRole}</Badge> },
  { accessorKey: "action", header: "Action" },
  { accessorKey: "description", header: "Description" },
  { accessorKey: "ipAddress", header: "IP Address" },
];

export function ActivityLogsTable({ data }: { data: ActivityLogDoc[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      emptyTitle="No activity recorded yet"
      emptyDescription="Every approval, status change, and settings update will be logged here."
    />
  );
}
