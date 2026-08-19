import { Package, Inbox, ShoppingCart, Wallet } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { AggregateField } from "firebase-admin/firestore";
import { SummaryCard } from "@/components/admin/summary-card";
import { formatCurrency, formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SupplierDashboardPage() {
  const user = await requireRole(["supplier"]);
  const supplierId = user.supplierId!;

  const [assignedProducts, pendingInvitations, activeOrders, earningsSnap] = await Promise.all([
    adminDb.collection("productSuppliers").where("supplierId", "==", supplierId).count().get(),
    adminDb
      .collectionGroup("invitations")
      .where("supplierId", "==", supplierId)
      .where("status", "==", "pending")
      .count()
      .get()
      .catch(() => null),
    adminDb
      .collection("orders")
      .where("supplierId", "==", supplierId)
      .where("status", "in", ["new", "supplier_confirmed", "preparing", "ready_for_pickup", "assigned_to_rider", "out_for_delivery"])
      .count()
      .get(),
    adminDb
      .collection("supplierEarnings")
      .where("supplierId", "==", supplierId)
      .aggregate({ total: AggregateField.sum("netEarning") })
      .get(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl text-on-surface">Welcome back, {user.name.split(" ")[0]}</h1>
        <p className="text-on-surface-variant mt-1">Here&apos;s what&apos;s happening with your account.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Assigned Products" value={formatNumber(assignedProducts.data().count)} icon={Package} />
        <SummaryCard
          label="Pending Requests"
          value={formatNumber(pendingInvitations?.data().count ?? 0)}
          icon={Inbox}
        />
        <SummaryCard label="Active Orders" value={formatNumber(activeOrders.data().count)} icon={ShoppingCart} />
        <SummaryCard
          label="Total Earnings"
          value={formatCurrency((earningsSnap.data().total as number) ?? 0)}
          icon={Wallet}
          tone="accent"
        />
      </div>
    </div>
  );
}
