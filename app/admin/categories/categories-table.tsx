"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import type { CategoryDoc } from "@/types/firestore";

const columns: ColumnDef<CategoryDoc, unknown>[] = [
  { accessorKey: "name", header: "Category" },
  { accessorKey: "slug", header: "Slug" },
  { accessorKey: "displayOrder", header: "Order" },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "success" : "neutral"}>
        {row.original.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    id: "featured",
    header: "Featured",
    cell: ({ row }) => (row.original.isFeatured ? <Badge variant="info">Featured</Badge> : "—"),
  },
];

export function CategoriesTable({ data }: { data: CategoryDoc[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      emptyTitle="No categories yet"
      emptyDescription="Categories like Skincare, Makeup, and Haircare will appear here."
    />
  );
}
