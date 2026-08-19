"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { DomainStatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/format";
import type { PaymentDoc } from "@/types/firestore";

const columns: ColumnDef<PaymentDoc, unknown>[] = [
  { accessorKey: "reference", header: "Reference" },
  { accessorKey: "method", header: "Method" },
  { id: "gross", header: "Gross Amount", cell: ({ row }) => formatCurrency(row.original.grossAmount) },
  { id: "commission", header: "Commission", cell: ({ row }) => formatCurrency(row.original.platformCommission) },
  { id: "earning", header: "Supplier Earning", cell: ({ row }) => formatCurrency(row.original.supplierEarning) },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <DomainStatusBadge domain="payment" status={row.original.status} />,
  },
];

export function PaymentsTable({ data }: { data: PaymentDoc[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      emptyTitle="No payments yet"
      emptyDescription="Payment records appear here once orders are paid for."
    />
  );
}
