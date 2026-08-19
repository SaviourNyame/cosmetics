import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Building2,
  FileClock,
  Package,
  PackagePlus,
  LayoutGrid,
  Tag,
  Inbox,
  ShoppingCart,
  Truck,
  Users,
  CreditCard,
  Banknote,
  BarChart3,
  Bell,
  ShieldCheck,
  KeyRound,
  History,
  Settings,
  Wallet,
  UserCog,
} from "lucide-react";
import type { Permission } from "@/lib/permissions";
import { PERMISSIONS } from "@/lib/permissions";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Omitted for items every admin/super_admin can see regardless of granted permissions. */
  permission?: Permission;
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, permission: PERMISSIONS.DASHBOARD_VIEW },
  { label: "Suppliers", href: "/admin/suppliers", icon: Building2, permission: PERMISSIONS.SUPPLIERS_VIEW },
  {
    label: "Supplier Applications",
    href: "/admin/suppliers/applications",
    icon: FileClock,
    permission: PERMISSIONS.SUPPLIERS_VIEW,
  },
  { label: "Products", href: "/admin/products", icon: Package, permission: PERMISSIONS.PRODUCTS_VIEW },
  { label: "Add Product", href: "/admin/products/new", icon: PackagePlus, permission: PERMISSIONS.PRODUCTS_MANAGE },
  { label: "Categories", href: "/admin/categories", icon: LayoutGrid, permission: PERMISSIONS.CATEGORIES_MANAGE },
  { label: "Brands", href: "/admin/brands", icon: Tag, permission: PERMISSIONS.BRANDS_MANAGE },
  { label: "Product Requests", href: "/admin/requests", icon: Inbox, permission: PERMISSIONS.REQUESTS_VIEW },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart, permission: PERMISSIONS.ORDERS_VIEW },
  { label: "Deliveries", href: "/admin/deliveries", icon: Truck, permission: PERMISSIONS.DELIVERIES_VIEW },
  { label: "Customers", href: "/admin/customers", icon: Users, permission: PERMISSIONS.CUSTOMERS_VIEW },
  { label: "Payments", href: "/admin/payments", icon: CreditCard, permission: PERMISSIONS.PAYMENTS_VIEW },
  { label: "Supplier Payouts", href: "/admin/payouts", icon: Banknote, permission: PERMISSIONS.PAYOUTS_VIEW },
  { label: "Reports", href: "/admin/reports", icon: BarChart3, permission: PERMISSIONS.REPORTS_VIEW },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  {
    label: "Administrators",
    href: "/admin/administrators",
    icon: ShieldCheck,
    permission: PERMISSIONS.ADMINISTRATORS_MANAGE,
  },
  { label: "Roles and Permissions", href: "/admin/roles", icon: KeyRound, permission: PERMISSIONS.ROLES_MANAGE },
  {
    label: "Activity Logs",
    href: "/admin/activity-logs",
    icon: History,
    permission: PERMISSIONS.ACTIVITY_LOGS_VIEW,
  },
  { label: "Settings", href: "/admin/settings", icon: Settings, permission: PERMISSIONS.SETTINGS_VIEW },
];

export const SUPPLIER_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/supplier", icon: LayoutDashboard },
  { label: "My Products", href: "/supplier/products", icon: Package },
  { label: "Product Requests", href: "/supplier/requests", icon: Inbox },
  { label: "Orders", href: "/supplier/orders", icon: ShoppingCart },
  { label: "Earnings", href: "/supplier/earnings", icon: Wallet },
  { label: "Payouts", href: "/supplier/payouts", icon: Banknote },
  { label: "Profile", href: "/supplier/profile", icon: UserCog },
];
