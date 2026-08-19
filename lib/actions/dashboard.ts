import "server-only";
import { AggregateField, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc } from "@/lib/firestore/serialize";
import type {
  SupplierDoc,
  ProductDoc,
  ProductRequestDoc,
  OrderDoc,
  ActivityLogDoc,
} from "@/types/firestore";

export interface DashboardSummary {
  suppliers: { total: number; approved: number; pending: number; suspended: number };
  products: { total: number; active: number; inactive: number };
  requests: { total: number; pending: number; accepted: number; expired: number; rejected: number; cancelled: number };
  orders: { total: number; pending: number; inProgress: number; completed: number; cancelled: number };
  finance: { totalSales: number; platformCommission: number; supplierEarnings: number; supplierPayouts: number };
  customers: { total: number };
}

async function count(query: FirebaseFirestore.Query) {
  const snap = await query.count().get();
  return snap.data().count;
}

async function sum(query: FirebaseFirestore.Query, field: string) {
  const snap = await query.aggregate({ total: AggregateField.sum(field) }).get();
  return snap.data().total ?? 0;
}

/**
 * Every figure here comes from a live Firestore query — none of it is
 * placeholder data. Until the Suppliers/Products/Requests/Orders modules
 * exist, the platform genuinely has no records, so these legitimately
 * read as zero rather than showing fabricated demo numbers.
 */
export async function getDashboardSummary(range: { start: Date; end: Date }): Promise<DashboardSummary> {
  const start = Timestamp.fromDate(range.start);
  const end = Timestamp.fromDate(range.end);

  const suppliers = adminDb.collection("suppliers");
  const products = adminDb.collection("products");
  const requests = adminDb.collection("productRequests");
  const orders = adminDb.collection("orders");
  const customers = adminDb.collection("customers");

  const requestsInRange = requests.where("createdAt", ">=", start).where("createdAt", "<=", end);
  const ordersInRange = orders.where("createdAt", ">=", start).where("createdAt", "<=", end);

  const [
    suppliersTotal,
    suppliersApproved,
    suppliersPending,
    suppliersSuspended,
    productsTotal,
    productsActive,
    productsInactive,
    requestsTotal,
    requestsPending,
    requestsAccepted,
    requestsExpired,
    requestsRejected,
    requestsCancelled,
    ordersTotal,
    ordersPending,
    ordersInProgress,
    ordersCompleted,
    ordersCancelled,
    totalSales,
    platformCommission,
    supplierEarnings,
    payoutsTotal,
    customersTotal,
  ] = await Promise.all([
    count(suppliers),
    count(suppliers.where("status", "==", "approved")),
    count(suppliers.where("status", "==", "pending")),
    count(suppliers.where("status", "==", "suspended")),
    count(products),
    count(products.where("status", "==", "active")),
    count(products.where("status", "==", "inactive")),
    count(requestsInRange),
    count(requestsInRange.where("status", "in", ["pending", "sent_to_suppliers", "awaiting_response"])),
    count(requestsInRange.where("status", "==", "accepted")),
    count(requestsInRange.where("status", "==", "expired")),
    count(requestsInRange.where("status", "==", "rejected_by_all")),
    count(requestsInRange.where("status", "==", "cancelled")),
    count(ordersInRange),
    count(ordersInRange.where("status", "in", ["pending_customer_confirmation", "new"])),
    count(
      ordersInRange.where("status", "in", [
        "supplier_confirmed",
        "preparing",
        "ready_for_pickup",
        "assigned_to_rider",
        "out_for_delivery",
      ])
    ),
    count(ordersInRange.where("status", "in", ["delivered", "completed"])),
    count(ordersInRange.where("status", "in", ["cancelled", "refunded"])),
    sum(ordersInRange, "finalPrice"),
    sum(ordersInRange, "platformCommission"),
    sum(ordersInRange, "supplierEarning"),
    sum(adminDb.collection("supplierPayouts").where("createdAt", ">=", start).where("createdAt", "<=", end), "netPayout"),
    count(customers),
  ]);

  return {
    suppliers: { total: suppliersTotal, approved: suppliersApproved, pending: suppliersPending, suspended: suppliersSuspended },
    products: { total: productsTotal, active: productsActive, inactive: productsInactive },
    requests: {
      total: requestsTotal,
      pending: requestsPending,
      accepted: requestsAccepted,
      expired: requestsExpired,
      rejected: requestsRejected,
      cancelled: requestsCancelled,
    },
    orders: {
      total: ordersTotal,
      pending: ordersPending,
      inProgress: ordersInProgress,
      completed: ordersCompleted,
      cancelled: ordersCancelled,
    },
    finance: {
      totalSales: totalSales as number,
      platformCommission: platformCommission as number,
      supplierEarnings: supplierEarnings as number,
      supplierPayouts: payoutsTotal as number,
    },
    customers: { total: customersTotal },
  };
}

export interface DashboardLists {
  topRequestedProducts: ProductDoc[];
  topSellingProducts: ProductDoc[];
  topPerformingSuppliers: SupplierDoc[];
  fastestRespondingSuppliers: SupplierDoc[];
  recentSupplierApplications: SupplierDoc[];
  recentRequests: ProductRequestDoc[];
  recentOrders: OrderDoc[];
  recentAdminActivity: ActivityLogDoc[];
  recentCustomerActivity: ActivityLogDoc[];
}

async function docs<T>(query: FirebaseFirestore.Query) {
  const snap = await query.get().catch(() => null);
  return (snap?.docs.map((d) => serializeDoc(d.data())) ?? []) as T[];
}

/** Leaderboards and recent-activity feeds shown on the dashboard, all backed by live queries. */
export async function getDashboardLists(): Promise<DashboardLists> {
  const suppliers = adminDb.collection("suppliers");
  const products = adminDb.collection("products");

  const [
    topRequestedProducts,
    topSellingProducts,
    topPerformingSuppliers,
    fastestRespondingSuppliers,
    recentSupplierApplications,
    recentRequests,
    recentOrders,
    recentAdminActivity,
    recentCustomerActivity,
  ] = await Promise.all([
    docs<ProductDoc>(products.orderBy("stats.requestCount", "desc").limit(5)),
    docs<ProductDoc>(products.orderBy("stats.completedOrderCount", "desc").limit(5)),
    docs<SupplierDoc>(suppliers.orderBy("stats.completedOrders", "desc").limit(5)),
    docs<SupplierDoc>(
      suppliers.where("stats.averageResponseSeconds", ">", 0).orderBy("stats.averageResponseSeconds", "asc").limit(5)
    ),
    docs<SupplierDoc>(
      suppliers.where("status", "in", ["pending", "under_review"]).orderBy("createdAt", "desc").limit(5)
    ),
    docs<ProductRequestDoc>(adminDb.collection("productRequests").orderBy("createdAt", "desc").limit(5)),
    docs<OrderDoc>(adminDb.collection("orders").orderBy("createdAt", "desc").limit(5)),
    docs<ActivityLogDoc>(
      adminDb.collection("activityLogs").where("userRole", "in", ["admin", "super_admin"]).orderBy("createdAt", "desc").limit(5)
    ),
    docs<ActivityLogDoc>(
      adminDb.collection("activityLogs").where("userRole", "==", "customer").orderBy("createdAt", "desc").limit(5)
    ),
  ]);

  return {
    topRequestedProducts,
    topSellingProducts,
    topPerformingSuppliers,
    fastestRespondingSuppliers,
    recentSupplierApplications,
    recentRequests,
    recentOrders,
    recentAdminActivity,
    recentCustomerActivity,
  };
}
