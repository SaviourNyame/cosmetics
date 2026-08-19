"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import type { ProductSupplierDoc } from "@/types/firestore";

const columns: ColumnDef<ProductSupplierDoc, unknown>[] = [
  { accessorKey: "productId", header: "Product" },
  { accessorKey: "supplierProductCode", header: "Your Product Code" },
  {
    id: "supplyPrice",
    header: "Your Supply Price",
    cell: ({ row }) => (row.original.supplyPrice != null ? formatCurrency(row.original.supplyPrice) : "—"),
  },
  { accessorKey: "usualPreparationTimeMinutes", header: "Prep Time (min)" },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "success" : "neutral"}>
        {row.original.isActive ? "Active" : "Disabled"}
      </Badge>
    ),
  },
];

export function SupplierProductsTable({ data }: { data: ProductSupplierDoc[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      emptyTitle="No products assigned yet"
      emptyDescription="Once the admin assigns you to a product, it will appear here."
    />
  );
}
