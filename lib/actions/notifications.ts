"use server";

import { revalidatePath } from "next/cache";
import { adminDb } from "@/lib/firebase-admin";
import { requireRole } from "@/lib/auth";

export async function markNotificationRead(notificationId: string) {
  await requireRole(["super_admin", "admin"]);
  await adminDb.collection("notifications").doc(notificationId).update({ read: true });
  revalidatePath("/admin/notifications");
  revalidatePath("/admin");
}

export async function markAllNotificationsRead() {
  await requireRole(["super_admin", "admin"]);
  const snap = await adminDb
    .collection("notifications")
    .where("targetType", "==", "admin")
    .where("read", "==", false)
    .get();

  if (!snap.empty) {
    const batch = adminDb.batch();
    snap.docs.forEach((doc) => batch.update(doc.ref, { read: true }));
    await batch.commit();
  }

  revalidatePath("/admin/notifications");
  revalidatePath("/admin");
}
