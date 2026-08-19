"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { requireRole } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import type { PlatformSettingsDoc, RoleDoc } from "@/types/firestore";

const DEFAULT_SETTINGS: Omit<PlatformSettingsDoc, "updatedAt" | "updatedBy"> = {
  companyName: "Lumière Beauty",
  currency: "GHS",
  defaultTaxPercent: 0,
  platformServiceFee: 0,
  platformCommissionPercent: 10,
  productRequestExpiryMinutes: 60,
  supplierResponseWindowMinutes: 15,
  automaticReassignment: false,
  yangoEnabled: false,
  fileUploadMaxSizeMB: 25,
};

export async function getPlatformSettings(): Promise<PlatformSettingsDoc | null> {
  const snap = await adminDb.collection("settings").doc("platform").get();
  return snap.exists ? (snap.data() as PlatformSettingsDoc) : null;
}

export async function updateGeneralSettings(input: {
  companyName: string;
  supportEmail?: string;
  supportPhone?: string;
  currency: string;
  platformCommissionPercent: number;
  productRequestExpiryMinutes: number;
  supplierResponseWindowMinutes: number;
}) {
  const user = await requireRole(["super_admin", "admin"]);

  if (user.role === "admin") {
    const roleDoc = user.roleId
      ? ((await adminDb.collection("roles").doc(user.roleId).get()).data() as RoleDoc | undefined)
      : undefined;
    if (!hasPermission(user, PERMISSIONS.SETTINGS_MANAGE, roleDoc)) {
      throw new Error("You do not have permission to update platform settings.");
    }
  }

  const existing = await getPlatformSettings();

  await adminDb
    .collection("settings")
    .doc("platform")
    .set(
      {
        ...DEFAULT_SETTINGS,
        ...existing,
        ...input,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: user.uid,
      },
      { merge: true }
    );

  revalidatePath("/admin/settings");
}
