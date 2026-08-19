"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import type { BrandDoc } from "@/types/firestore";

const columns: ColumnDef<BrandDoc, unknown>[] = [
  { accessorKey: "name", header: "Brand" },
  { accessorKey: "countryOfOrigin", header: "Country of Origin" },
  { accessorKey: "productCount", header: "Products" },
  { accessorKey: "assignedSupplierCount", header: "Suppliers" },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "success" : "neutral"}>
        {row.original.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
];

export function BrandsTable({ data }: { data: BrandDoc[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      emptyTitle="No brands yet"
      emptyDescription="Brands linked to your products will appear here."
    />
  );
}
