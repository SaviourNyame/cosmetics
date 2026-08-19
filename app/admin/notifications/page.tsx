import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc } from "@/lib/firestore/serialize";
import { PageHeader } from "@/components/shared/page-header";
import { NotificationList } from "./notification-list";
import type { NotificationDoc } from "@/types/firestore";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const snap = await adminDb
    .collection("notifications")
    .where("targetType", "==", "admin")
    .orderBy("createdAt", "desc")
    .limit(50)
    .get()
    .catch(() => null);

  const notifications = (snap?.docs.map((d) => serializeDoc(d.data())) ?? []) as NotificationDoc[];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Notifications" description="Everything happening across the platform." />
      <NotificationList notifications={notifications} />
    </div>
  );
}
