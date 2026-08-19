import { NextResponse, type NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { DEFAULT_ADMIN_PERMISSIONS } from "@/lib/permissions";

/**
 * One-time bootstrap for the very first Super Admin account. Gated by
 * BOOTSTRAP_SECRET (set in .env.local, never exposed to the client) and
 * refuses to run a second time once a super_admin admin doc exists.
 *
 * Usage:
 *   curl -X POST http://localhost:3000/api/auth/bootstrap-admin \
 *     -H "x-bootstrap-secret: $BOOTSTRAP_SECRET" \
 *     -H "Content-Type: application/json" \
 *     -d '{"name":"...","email":"...","password":"..."}'
 */
export async function POST(request: NextRequest) {
  const providedSecret = request.headers.get("x-bootstrap-secret");
  const expectedSecret = process.env.BOOTSTRAP_SECRET;

  if (!expectedSecret || !providedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await adminDb
    .collection("admins")
    .where("roleId", "==", "super_admin")
    .limit(1)
    .get();

  if (!existing.empty) {
    return NextResponse.json({ error: "A Super Admin already exists." }, { status: 409 });
  }

  const { name, email, password } = await request.json();
  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "name, email, and password are required" },
      { status: 400 }
    );
  }

  const userRecord = await adminAuth.createUser({ email, password, displayName: name });
  await adminAuth.setCustomUserClaims(userRecord.uid, { role: "super_admin" });

  const now = FieldValue.serverTimestamp();

  await adminDb.collection("admins").doc(userRecord.uid).set({
    id: userRecord.uid,
    name,
    email,
    roleId: "super_admin",
    status: "active",
    createdAt: now,
    updatedAt: now,
  });

  // Seed the two system roles so the Roles & Permissions screen (built
  // later) has real data to display from day one.
  await adminDb
    .collection("roles")
    .doc("super_admin")
    .set(
      { id: "super_admin", name: "Super Admin", permissions: [], isSystem: true, createdAt: now, updatedAt: now },
      { merge: true }
    );

  await adminDb
    .collection("roles")
    .doc("admin")
    .set(
      {
        id: "admin",
        name: "Admin",
        permissions: DEFAULT_ADMIN_PERMISSIONS,
        isSystem: false,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true }
    );

  return NextResponse.json({ ok: true, uid: userRecord.uid });
}
