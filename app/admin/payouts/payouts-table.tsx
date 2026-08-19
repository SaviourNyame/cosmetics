"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { DomainStatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/format";
import type { SupplierPayoutDoc } from "@/types/firestore";

const columns: ColumnDef<SupplierPayoutDoc, unknown>[] = [
  { accessorKey: "supplierId", header: "Supplier" },
  { accessorKey: "completedOrders", header: "Completed Orders" },
  { id: "gross", header: "Gross Sales", cell: ({ row }) => formatCurrency(row.original.grossSales) },
  { id: "net", header: "Net Payout", cell: ({ row }) => formatCurrency(row.original.netPayout) },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <DomainStatusBadge domain="payout" status={row.original.status} />,
  },
];

export function PayoutsTable({ data }: { data: SupplierPayoutDoc[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      emptyTitle="No payouts yet"
      emptyDescription="Payout batches appear here once suppliers complete orders."
    />
  );
}
