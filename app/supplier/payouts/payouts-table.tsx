"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { DomainStatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/format";
import { toDate } from "@/lib/firestore/serialize";
import type { SupplierPayoutDoc } from "@/types/firestore";

const columns: ColumnDef<SupplierPayoutDoc, unknown>[] = [
  {
    id: "period",
    header: "Period",
    // periodStart/periodEnd have already been through serializeDoc() by the
    // time this reaches the client, so they're plain Dates at runtime even
    // though the type still says TimestampLike — toDate() handles both.
    accessorFn: (p) =>
      `${toDate(p.periodStart)?.toLocaleDateString()} – ${toDate(p.periodEnd)?.toLocaleDateString()}`,
  },
  { id: "net", header: "Net Payout", cell: ({ row }) => formatCurrency(row.original.netPayout) },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <DomainStatusBadge domain="payout" status={row.original.status} />,
  },
];

export function SupplierPayoutsTable({ data }: { data: SupplierPayoutDoc[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      emptyTitle="No payouts yet"
      emptyDescription="Payout batches will appear here once processed by the platform."
    />
  );
}
