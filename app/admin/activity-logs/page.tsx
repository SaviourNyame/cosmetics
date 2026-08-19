import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc } from "@/lib/firestore/serialize";
import { PageHeader } from "@/components/shared/page-header";
import { FilterBar } from "@/components/shared/filter-bar";
import { ActivityLogsTable } from "./activity-logs-table";
import type { ActivityLogDoc } from "@/types/firestore";

export const dynamic = "force-dynamic";

export default async function ActivityLogsPage() {
  const snap = await adminDb
    .collection("activityLogs")
    .orderBy("createdAt", "desc")
    .limit(100)
    .get()
    .catch(() => null);
  const logs = (snap?.docs.map((d) => serializeDoc(d.data())) ?? []) as ActivityLogDoc[];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Activity Logs" description="An audit trail of important platform actions." />
      <FilterBar searchPlaceholder="Search activity..." />
      <ActivityLogsTable data={logs} />
    </div>
  );
}
