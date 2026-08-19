"use server";

import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import type { OrderDoc, ProductRequestDoc, RequestInvitationDoc } from "@/types/firestore";

export class RequestAlreadyTakenError extends Error {}

/**
 * Awards a product request to the supplier whose invitation is being
 * accepted. This is the "first eligible supplier wins" rule from the spec,
 * and it has to be race-safe: two suppliers could tap "Accept" within
 * milliseconds of each other.
 *
 * Firestore transactions give us the same guarantee Postgres row-locking
 * would: the transaction re-reads the request doc, and if another
 * transaction already committed a winner in the meantime, this one is
 * retried by the SDK and will see `winningSupplierId` already set — at
 * which point it aborts with RequestAlreadyTakenError instead of creating a
 * second order. Only one transaction can ever win.
 *
 * The order document is created inside the same transaction so "won
 * request" and "order exists" are atomic — there is never a state where a
 * request is accepted but no order was created, or vice versa.
 */
export async function acceptInvitation(
  requestId: string,
  supplierId: string
): Promise<{ orderId: string }> {
  const requestRef = adminDb.collection("productRequests").doc(requestId);
  const invitationRef = requestRef.collection("invitations").doc(supplierId);
  const orderRef = adminDb.collection("orders").doc();

  const result = await adminDb.runTransaction(async (tx) => {
    const [requestSnap, invitationSnap] = await Promise.all([
      tx.get(requestRef),
      tx.get(invitationRef),
    ]);

    if (!requestSnap.exists) throw new Error("Request not found.");
    if (!invitationSnap.exists) throw new Error("Invitation not found.");

    const request = requestSnap.data() as ProductRequestDoc;
    const invitation = invitationSnap.data() as RequestInvitationDoc;

    const stillOpen =
      !request.winningSupplierId &&
      (request.status === "sent_to_suppliers" || request.status === "awaiting_response");

    if (!stillOpen || invitation.status !== "pending") {
      throw new RequestAlreadyTakenError(
        "This request has already been accepted by another supplier."
      );
    }

    const now = FieldValue.serverTimestamp();

    tx.update(requestRef, {
      status: "accepted",
      winningSupplierId: supplierId,
      confirmedFinalPrice: invitation.customerFinalPrice ?? invitation.supplierPrice ?? null,
      acceptedAt: now,
      updatedAt: now,
    });

    tx.update(invitationRef, {
      status: "accepted",
      respondedAt: now,
    });

    const orderData: Omit<OrderDoc, "createdAt" | "updatedAt"> & {
      createdAt: FirebaseFirestore.FieldValue;
      updatedAt: FirebaseFirestore.FieldValue;
    } = {
      id: orderRef.id,
      orderNumber: `LM-${orderRef.id.slice(0, 8).toUpperCase()}`,
      requestId,
      customerId: request.customerId,
      supplierId,
      productId: request.productId,
      variantId: request.variantId ?? null,
      quantity: request.quantity,
      finalPrice:
        invitation.customerFinalPrice ??
        invitation.supplierPrice ??
        request.productSnapshot.displayPrice ??
        0,
      platformFee: 0,
      platformCommission: 0,
      supplierEarning: 0,
      status: "pending_customer_confirmation",
      paymentStatus: "pending",
      deliveryMethod: request.preferredDeliveryMethod ?? "customer_pickup",
      createdAt: now,
      updatedAt: now,
    };

    tx.set(orderRef, orderData);

    return { orderId: orderRef.id };
  });

  // Outside the transaction (no longer contended): close every other
  // still-pending invitation so suppliers stop seeing the request as open.
  const otherPending = await requestRef
    .collection("invitations")
    .where("status", "==", "pending")
    .get();

  if (!otherPending.empty) {
    const batch = adminDb.batch();
    otherPending.docs.forEach((doc) => {
      if (doc.id !== supplierId) batch.update(doc.ref, { status: "closed" });
    });
    await batch.commit();
  }

  return result;
}
