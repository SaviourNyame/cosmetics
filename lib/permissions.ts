import type { RoleDoc } from "@/types/firestore";
import type { SessionUser } from "./auth";

/**
 * Permission keys, grouped by module. Stored on RoleDoc.permissions and
 * checked via hasPermission(). The two system roles behave specially:
 *  - super_admin: implicitly has every permission, always (isSystem: true).
 *  - admin: starts with DEFAULT_ADMIN_PERMISSIONS below, but is data-driven —
 *    an administrator with roles.manage can grant an Admin role additional
 *    permissions (including the sensitive ones) via the Roles & Permissions
 *    screen. Nothing here is a silent client-side check: every server
 *    action re-verifies via hasPermission() before mutating.
 */
export const PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard.view",

  SUPPLIERS_VIEW: "suppliers.view",
  SUPPLIERS_MANAGE: "suppliers.manage",
  SUPPLIERS_APPROVE: "suppliers.approve",

  PRODUCTS_VIEW: "products.view",
  PRODUCTS_MANAGE: "products.manage",

  CATEGORIES_MANAGE: "categories.manage",
  BRANDS_MANAGE: "brands.manage",

  REQUESTS_VIEW: "requests.view",
  REQUESTS_MANAGE: "requests.manage",

  ORDERS_VIEW: "orders.view",
  ORDERS_MANAGE: "orders.manage",

  DELIVERIES_VIEW: "deliveries.view",
  DELIVERIES_MANAGE: "deliveries.manage",

  CUSTOMERS_VIEW: "customers.view",
  CUSTOMERS_MANAGE: "customers.manage",

  PAYMENTS_VIEW: "payments.view",
  PAYMENTS_MANAGE: "payments.manage",

  PAYOUTS_VIEW: "payouts.view",
  PAYOUTS_MANAGE: "payouts.manage",

  REPORTS_VIEW: "reports.view",

  NOTIFICATIONS_MANAGE: "notifications.manage",

  // Sensitive — excluded from DEFAULT_ADMIN_PERMISSIONS, grantable explicitly.
  ADMINISTRATORS_MANAGE: "administrators.manage",
  ADMINISTRATORS_REMOVE_SUPER_ADMIN: "administrators.remove_super_admin",
  ROLES_MANAGE: "roles.manage",
  ACTIVITY_LOGS_VIEW: "activity_logs.view",
  SETTINGS_VIEW: "settings.view",
  SETTINGS_MANAGE: "settings.manage",
  SETTINGS_SECURITY_MANAGE: "settings.security.manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: Permission[] = Object.values(PERMISSIONS) as Permission[];

const SENSITIVE_PERMISSIONS: Permission[] = [
  PERMISSIONS.ADMINISTRATORS_MANAGE,
  PERMISSIONS.ADMINISTRATORS_REMOVE_SUPER_ADMIN,
  PERMISSIONS.ROLES_MANAGE,
  PERMISSIONS.SETTINGS_SECURITY_MANAGE,
];

/** The permission set a newly created Admin role starts with. */
export const DEFAULT_ADMIN_PERMISSIONS: Permission[] = ALL_PERMISSIONS.filter(
  (p) => !SENSITIVE_PERMISSIONS.includes(p)
);

/**
 * Checks whether a session user holds a permission. `roleDoc` should be the
 * RoleDoc matching `user.roleId` (callers fetch it once and pass it in to
 * avoid a Firestore read per check). Suppliers never hold admin
 * permissions — they're restricted to their own portal's fixed actions.
 */
export function hasPermission(
  user: Pick<SessionUser, "role">,
  permission: Permission,
  roleDoc?: Pick<RoleDoc, "permissions" | "isSystem"> | null
): boolean {
  if (user.role === "super_admin") return true;
  if (user.role === "supplier") return false;
  if (!roleDoc) return false;
  if (roleDoc.isSystem) return true;
  return roleDoc.permissions.includes(permission);
}

/**
 * Independent safety net (not permission-gated): never allow the platform's
 * last remaining super_admin account to be removed or demoted, regardless
 * of who is granted administrators.remove_super_admin. Pass the count of
 * *other* active super_admin accounts.
 */
export function canRemoveSuperAdmin(otherActiveSuperAdminCount: number): boolean {
  return otherActiveSuperAdminCount > 0;
}
