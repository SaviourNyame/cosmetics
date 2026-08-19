import { BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Reports"
        description="Sales, requests, supplier performance, and payment reports — filterable and exportable."
      />
      <EmptyState
        icon={BarChart3}
        title="Reports populate once there's platform activity"
        description="Sales, request/order/supplier performance, and payment reports (CSV, Excel, PDF export) ship after the core transactional modules."
      />
    </div>
  );
}
