"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { formatCurrency } from "@/lib/format";
import type { SupplierEarningDoc } from "@/types/firestore";

const columns: ColumnDef<SupplierEarningDoc, unknown>[] = [
  { accessorKey: "orderId", header: "Order" },
  { id: "gross", header: "Gross Amount", cell: ({ row }) => formatCurrency(row.original.grossAmount) },
  { id: "commission", header: "Platform Commission", cell: ({ row }) => formatCurrency(row.original.platformCommission) },
  { id: "net", header: "Net Earning", cell: ({ row }) => formatCurrency(row.original.netEarning) },
];

export function EarningsTable({ data }: { data: SupplierEarningDoc[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      emptyTitle="No earnings yet"
      emptyDescription="Earnings from completed orders will appear here."
    />
  );
}
