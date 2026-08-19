import { requireRole } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { hasPermission } from "@/lib/permissions";
import { ADMIN_NAV_ITEMS } from "@/lib/nav-config";
import { serializeDoc } from "@/lib/firestore/serialize";
import { AppSidebar, MobileNavSheet } from "@/components/shared/app-sidebar";
import { AppTopbar } from "@/components/shared/app-topbar";
import type { RoleDoc, NotificationDoc } from "@/types/firestore";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["super_admin", "admin"]);

  const roleDoc =
    user.role === "admin" && user.roleId
      ? ((await adminDb.collection("roles").doc(user.roleId).get()).data() as RoleDoc | undefined)
      : null;

  const visibleHrefs = ADMIN_NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(user, item.permission, roleDoc)
  ).map((item) => item.href);

  const notificationsSnap = await adminDb
    .collection("notifications")
    .where("targetType", "==", "admin")
    .orderBy("createdAt", "desc")
    .limit(10)
    .get()
    .catch(() => null);

  const notifications = (notificationsSnap?.docs.map((d) => serializeDoc(d.data())) ?? []) as NotificationDoc[];
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex min-h-screen bg-surface-container-low">
      <AppSidebar variant="admin" visibleHrefs={visibleHrefs} homeHref="/admin" />
      <div className="flex-1 flex flex-col min-w-0">
        <AppTopbar
          user={{
            name: user.name,
            roleLabel: user.role === "super_admin" ? "Super Admin" : "Admin",
            photoURL: user.photoURL,
          }}
          sidebarTrigger={<MobileNavSheet variant="admin" visibleHrefs={visibleHrefs} homeHref="/admin" />}
          quickAddItems={[
            { label: "Add Product", href: "/admin/products/new" },
            { label: "Add Supplier", href: "/admin/suppliers?new=1" },
            { label: "Add Category", href: "/admin/categories?new=1" },
            { label: "Add Brand", href: "/admin/brands?new=1" },
          ]}
          notifications={notifications}
          unreadCount={unreadCount}
          profileHref="/admin/settings"
        />
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
