import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth, adminDb } from "./firebase-admin";
import { SESSION_COOKIE_NAME } from "./session-constants";
import type { AdminDoc, SupplierDoc } from "@/types/firestore";

export { SESSION_COOKIE_NAME };
const SESSION_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export type SessionRole = "super_admin" | "admin" | "supplier";

export interface SessionUser {
  uid: string;
  email: string;
  name: string;
  role: SessionRole;
  roleId?: string; // for admins, the RoleDoc id (defaults to role for the two system roles)
  supplierId?: string; // for suppliers
  photoURL?: string;
}

export async function createSessionCookie(idToken: string): Promise<string> {
  return adminAuth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_MS });
}

/**
 * Verifies the session cookie and loads the corresponding admin/supplier
 * profile. Returns null if there is no valid session, the account is
 * disabled, or the backing profile document is missing.
 *
 * This is the real security boundary for the /admin and /supplier route
 * groups (enforced in their layouts) — middleware only does a soft
 * redirect based on cookie presence, since firebase-admin cannot run in
 * the Edge runtime.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  let decoded;
  try {
    decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
  } catch {
    return null;
  }

  const role = decoded.role as SessionRole | undefined;
  if (!role) return null;

  if (role === "supplier") {
    const supplierId = decoded.supplierId as string | undefined;
    if (!supplierId) return null;
    const snap = await adminDb.collection("suppliers").doc(supplierId).get();
    if (!snap.exists) return null;
    const supplier = snap.data() as SupplierDoc;
    if (supplier.status !== "approved") return null;
    return {
      uid: decoded.uid,
      email: decoded.email ?? supplier.representativeEmail,
      name: supplier.representativeName,
      role: "supplier",
      supplierId,
      photoURL: supplier.representativePhotoURL,
    };
  }

  // super_admin / admin
  const snap = await adminDb.collection("admins").doc(decoded.uid).get();
  if (!snap.exists) return null;
  const admin = snap.data() as AdminDoc;
  if (admin.status !== "active") return null;

  return {
    uid: decoded.uid,
    email: admin.email,
    name: admin.name,
    role: role === "super_admin" ? "super_admin" : "admin",
    roleId: admin.roleId,
    photoURL: admin.photoURL,
  };
}

/**
 * Guards a Server Component (layout or page) to a set of allowed roles,
 * redirecting to /login when unauthenticated and to a role-appropriate
 * home when authenticated but disallowed.
 */
export async function requireRole(allowed: SessionRole[]): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!allowed.includes(user.role)) {
    redirect(user.role === "supplier" ? "/supplier" : "/admin");
  }
  return user;
}
