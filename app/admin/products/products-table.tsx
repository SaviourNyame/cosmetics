"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { DomainStatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/format";
import type { ProductDoc } from "@/types/firestore";

const columns: ColumnDef<ProductDoc, unknown>[] = [
  { accessorKey: "name", header: "Product" },
  {
    accessorKey: "displayPrice",
    header: "Display Price",
    cell: ({ row }) =>
      row.original.displayPrice != null ? formatCurrency(row.original.displayPrice) : "—",
  },
  { accessorKey: "pricingMethod", header: "Pricing Method" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <DomainStatusBadge domain="product" status={row.original.status} />,
  },
  {
    id: "suppliers",
    header: "Suppliers",
    cell: ({ row }) => row.original.stats?.assignedSupplierCount ?? 0,
  },
  {
    id: "requests",
    header: "Requests",
    cell: ({ row }) => row.original.stats?.requestCount ?? 0,
  },
];

export function ProductsTable({ data }: { data: ProductDoc[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      emptyTitle="No products yet"
      emptyDescription="Add your first product to start building the catalogue."
    />
  );
}
