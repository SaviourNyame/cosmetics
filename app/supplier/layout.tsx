import { requireRole } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc } from "@/lib/firestore/serialize";
import { AppSidebar, MobileNavSheet } from "@/components/shared/app-sidebar";
import { AppTopbar } from "@/components/shared/app-topbar";
import type { NotificationDoc } from "@/types/firestore";

export default async function SupplierLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["supplier"]);

  const notificationsSnap = await adminDb
    .collection("notifications")
    .where("targetType", "==", "supplier")
    .where("targetId", "==", user.supplierId)
    .orderBy("createdAt", "desc")
    .limit(10)
    .get()
    .catch(() => null);

  const notifications = (notificationsSnap?.docs.map((d) => serializeDoc(d.data())) ?? []) as NotificationDoc[];
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex min-h-screen bg-surface-container-low">
      <AppSidebar variant="supplier" homeHref="/supplier" />
      <div className="flex-1 flex flex-col min-w-0">
        <AppTopbar
          user={{ name: user.name, roleLabel: "Supplier", photoURL: user.photoURL }}
          sidebarTrigger={<MobileNavSheet variant="supplier" homeHref="/supplier" />}
          notifications={notifications}
          unreadCount={unreadCount}
          profileHref="/supplier/profile"
        />
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
