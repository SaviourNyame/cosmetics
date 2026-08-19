import {
  Building2,
  CheckCircle2,
  Clock,
  Ban,
  Package,
  PackageCheck,
  PackageX,
  Inbox,
  Hourglass,
  ThumbsUp,
  TimerOff,
  ShoppingCart,
  Loader,
  CircleCheck,
  XCircle,
  Wallet,
  Landmark,
  HandCoins,
  Users,
  AlertTriangle,
} from "lucide-react";
import { getDashboardSummary, getDashboardLists } from "@/lib/actions/dashboard";
import { resolvePreset, type DateRangePreset } from "@/lib/date-range";
import { DashboardFilter } from "@/components/admin/dashboard-filter";
import { SummaryCard } from "@/components/admin/summary-card";
import { ChartCard, CHART_COLORS } from "@/components/shared/chart-card";
import { SimpleBarChart } from "@/components/shared/simple-bar-chart";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; start?: string; end?: string }>;
}) {
  const params = await searchParams;
  const preset = (params.range as DateRangePreset) ?? "this_month";
  const range = resolvePreset(
    preset,
    params.start && params.end ? { start: new Date(params.start), end: new Date(params.end) } : undefined
  );

  let summary: Awaited<ReturnType<typeof getDashboardSummary>> | null = null;
  let loadError = false;
  try {
    summary = await getDashboardSummary(range);
  } catch {
    loadError = true;
  }

  const lists = await getDashboardLists().catch(() => null);

  const requestChartData = summary
    ? [
        { name: "Pending", value: summary.requests.pending },
        { name: "Accepted", value: summary.requests.accepted },
        { name: "Expired", value: summary.requests.expired },
        { name: "Rejected", value: summary.requests.rejected },
        { name: "Cancelled", value: summary.requests.cancelled },
      ]
    : [];

  const orderChartData = summary
    ? [
        { name: "Pending", value: summary.orders.pending },
        { name: "In Progress", value: summary.orders.inProgress },
        { name: "Completed", value: summary.orders.completed },
        { name: "Cancelled", value: summary.orders.cancelled },
      ]
    : [];

  const hasRequestData = requestChartData.some((d) => d.value > 0);
  const hasOrderData = orderChartData.some((d) => d.value > 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-on-surface">Dashboard</h1>
          <p className="text-on-surface-variant mt-1">Platform overview and performance at a glance.</p>
        </div>
        <DashboardFilter preset={preset} />
      </div>

      {loadError && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertTriangle className="size-4 shrink-0" />
          Dashboard data could not be loaded. Confirm the Firebase Admin credentials in .env.local are set and
          that Firestore indexes have been deployed (firebase deploy --only firestore:indexes).
        </div>
      )}

      {summary && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard label="Total Suppliers" value={formatNumber(summary.suppliers.total)} icon={Building2} />
            <SummaryCard label="Approved Suppliers" value={formatNumber(summary.suppliers.approved)} icon={CheckCircle2} />
            <SummaryCard label="Pending Applications" value={formatNumber(summary.suppliers.pending)} icon={Clock} />
            <SummaryCard label="Suspended Suppliers" value={formatNumber(summary.suppliers.suspended)} icon={Ban} />

            <SummaryCard label="Total Products" value={formatNumber(summary.products.total)} icon={Package} />
            <SummaryCard label="Active Products" value={formatNumber(summary.products.active)} icon={PackageCheck} />
            <SummaryCard label="Inactive Products" value={formatNumber(summary.products.inactive)} icon={PackageX} />
            <SummaryCard label="Total Requests" value={formatNumber(summary.requests.total)} icon={Inbox} />

            <SummaryCard label="Pending Requests" value={formatNumber(summary.requests.pending)} icon={Hourglass} />
            <SummaryCard label="Accepted Requests" value={formatNumber(summary.requests.accepted)} icon={ThumbsUp} />
            <SummaryCard label="Expired Requests" value={formatNumber(summary.requests.expired)} icon={TimerOff} />
            <SummaryCard label="Total Orders" value={formatNumber(summary.orders.total)} icon={ShoppingCart} />

            <SummaryCard label="Pending Orders" value={formatNumber(summary.orders.pending)} icon={Loader} />
            <SummaryCard label="Completed Orders" value={formatNumber(summary.orders.completed)} icon={CircleCheck} />
            <SummaryCard label="Cancelled Orders" value={formatNumber(summary.orders.cancelled)} icon={XCircle} />
            <SummaryCard label="Total Customers" value={formatNumber(summary.customers.total)} icon={Users} />

            <SummaryCard label="Total Sales" value={formatCurrency(summary.finance.totalSales)} icon={Wallet} tone="accent" />
            <SummaryCard
              label="Platform Commission"
              value={formatCurrency(summary.finance.platformCommission)}
              icon={Landmark}
              tone="accent"
            />
            <SummaryCard
              label="Supplier Earnings"
              value={formatCurrency(summary.finance.supplierEarnings)}
              icon={HandCoins}
              tone="accent"
            />
            <SummaryCard
              label="Supplier Payouts"
              value={formatCurrency(summary.finance.supplierPayouts)}
              icon={Landmark}
              tone="accent"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Requests by Status" subtitle="Within selected period">
              {hasRequestData ? (
                <SimpleBarChart data={requestChartData} color={CHART_COLORS[0]} />
              ) : (
                <EmptyState
                  title="No requests yet"
                  description="Once customers start submitting product requests, this chart will populate."
                  className="border-none"
                />
              )}
            </ChartCard>

            <ChartCard title="Orders by Status" subtitle="Within selected period">
              {hasOrderData ? (
                <SimpleBarChart data={orderChartData} color={CHART_COLORS[1]} />
              ) : (
                <EmptyState
                  title="No orders yet"
                  description="Orders are created once a supplier accepts a customer's request."
                  className="border-none"
                />
              )}
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Sales Performance" subtitle="Within selected period">
              <EmptyState
                title="No sales yet"
                description="A daily sales trend line will appear here once orders start completing."
                className="border-none"
              />
            </ChartCard>
            <ChartCard title="Products by Category" subtitle="Catalogue distribution">
              <EmptyState
                title="No categories yet"
                description="Add product categories to see catalogue distribution here."
                className="border-none"
              />
            </ChartCard>
          </div>

          {/* Leaderboards & recent activity */}
          {lists && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <DashboardListCard title="Top-Requested Products" items={lists.topRequestedProducts} render={(p) => p.name} emptyLabel="No product requests recorded yet." />
              <DashboardListCard title="Top-Selling Products" items={lists.topSellingProducts} render={(p) => p.name} emptyLabel="No completed orders yet." />
              <DashboardListCard title="Top-Performing Suppliers" items={lists.topPerformingSuppliers} render={(s) => s.businessName} emptyLabel="No supplier orders completed yet." />
              <DashboardListCard title="Fastest Responding Suppliers" items={lists.fastestRespondingSuppliers} render={(s) => s.businessName} emptyLabel="No supplier responses recorded yet." />
              <DashboardListCard title="Recent Supplier Applications" items={lists.recentSupplierApplications} render={(s) => s.businessName} emptyLabel="No pending supplier applications." />
              <DashboardListCard title="Recent Product Requests" items={lists.recentRequests} render={(r) => r.productSnapshot.name} emptyLabel="No product requests yet." />
              <DashboardListCard title="Recent Orders" items={lists.recentOrders} render={(o) => o.orderNumber} emptyLabel="No orders yet." />
              <DashboardListCard title="Recent Admin Activity" items={lists.recentAdminActivity} render={(a) => a.description} emptyLabel="No admin activity recorded yet." />
              <DashboardListCard title="Recent Customer Activity" items={lists.recentCustomerActivity} render={(a) => a.description} emptyLabel="No customer activity recorded yet." />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DashboardListCard<T>({
  title,
  items,
  render,
  emptyLabel,
}: {
  title: string;
  items: T[];
  render: (item: T) => string;
  emptyLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl p-6">
      <h3 className="font-display text-base text-on-surface mb-4">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-on-surface-variant">{emptyLabel}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item, i) => (
            <li key={i} className="text-sm text-on-surface truncate">
              {render(item)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
