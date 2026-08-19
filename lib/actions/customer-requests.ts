"use server";

import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc } from "@/lib/firestore/serialize";
import type { ProductDoc, ProductRequestDoc, SupplierDoc } from "@/types/firestore";

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

export interface SubmitRequestInput {
  productId: string;
  quantity: number;
  customerNotes?: string;
  name: string;
  phone: string;
  alternativePhone?: string;
  email?: string;
}

/**
 * Creates the customer (or updates their running stats if they've requested
 * before) and the product request itself. No customer auth exists yet, so
 * a normalized phone number stands in as the customer's identity.
 */
export async function submitProductRequest(input: SubmitRequestInput): Promise<{ requestId: string }> {
  const productSnap = await adminDb.collection("products").doc(input.productId).get();
  if (!productSnap.exists) throw new Error("Product not found.");
  const product = productSnap.data() as ProductDoc;

  const customerId = normalizePhone(input.phone);
  if (!customerId) throw new Error("A valid phone number is required.");
  if (!input.quantity || input.quantity < 1) throw new Error("Quantity must be at least 1.");

  const now = FieldValue.serverTimestamp();
  const customerRef = adminDb.collection("customers").doc(customerId);
  const customerSnap = await customerRef.get();

  if (customerSnap.exists) {
    await customerRef.update({
      name: input.name,
      phone: input.phone,
      email: input.email ?? null,
      "stats.requestCount": FieldValue.increment(1),
      lastRequestAt: now,
      updatedAt: now,
    });
  } else {
    await customerRef.set({
      id: customerId,
      name: input.name,
      phone: input.phone,
      email: input.email ?? null,
      status: "active",
      stats: { requestCount: 1, completedOrderCount: 0, totalSpent: 0 },
      lastRequestAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Only suppliers actively assigned to this product are eligible to see the
  // request once it's sent — there are none yet since the Suppliers and
  // Supplier-Product-assignment modules haven't been built, so this
  // legitimately comes back empty for now rather than a fabricated match.
  const assignmentsSnap = await adminDb
    .collection("productSuppliers")
    .where("productId", "==", input.productId)
    .where("isActive", "==", true)
    .get();
  const eligibleSupplierIds = assignmentsSnap.docs.map((d) => d.data().supplierId as string);

  const requestRef = adminDb.collection("productRequests").doc();
  await requestRef.set({
    id: requestRef.id,
    customerId,
    productId: input.productId,
    quantity: input.quantity,
    customerNotes: input.customerNotes ?? null,
    contactPhone: input.phone,
    alternativePhone: input.alternativePhone ?? null,
    productSnapshot: {
      name: product.name,
      displayPrice: product.displayPrice ?? null,
      pricingMethod: product.pricingMethod,
    },
    customerSnapshot: { name: input.name, phone: input.phone },
    status: "pending",
    eligibleSupplierIds,
    winningSupplierId: null,
    responseWindowMinutes: 30,
    createdAt: now,
    updatedAt: now,
  });

  return { requestId: requestRef.id };
}

export interface ChooseDeliveryInput {
  requestId: string;
  method: "platform_delivery" | "yango_delivery" | "customer_pickup";
  region?: string;
  city?: string;
  area?: string;
  digitalAddress?: string;
  landmark?: string;
  preferredDeliveryTime?: string;
}

export async function chooseRequestDelivery(input: ChooseDeliveryInput): Promise<void> {
  const requestRef = adminDb.collection("productRequests").doc(input.requestId);
  const snap = await requestRef.get();
  if (!snap.exists) throw new Error("Request not found.");
  const request = snap.data() as ProductRequestDoc;
  if (request.preferredDeliveryMethod) {
    throw new Error("Delivery has already been chosen for this request.");
  }

  const deliveryLocation = [input.area, input.city, input.region, input.digitalAddress]
    .filter(Boolean)
    .join(", ");
  const now = FieldValue.serverTimestamp();
  const hasEligibleSuppliers = request.eligibleSupplierIds.length > 0;

  await requestRef.update({
    preferredDeliveryMethod: input.method,
    deliveryLocation: deliveryLocation || null,
    deliveryArea: input.area ?? null,
    preferredDeliveryTime: input.preferredDeliveryTime ?? null,
    status: hasEligibleSuppliers ? "sent_to_suppliers" : "pending",
    sentAt: hasEligibleSuppliers ? now : null,
    updatedAt: now,
  });

  if (hasEligibleSuppliers) {
    const supplierRefs = request.eligibleSupplierIds.map((id) => adminDb.collection("suppliers").doc(id));
    const supplierDocs = await adminDb.getAll(...supplierRefs);
    const batch = adminDb.batch();
    for (const doc of supplierDocs) {
      const supplier = doc.data() as SupplierDoc | undefined;
      batch.set(requestRef.collection("invitations").doc(doc.id), {
        id: doc.id,
        supplierId: doc.id,
        supplierName: supplier?.businessName ?? "Supplier",
        status: "pending",
        notifiedAt: now,
      });
    }
    await batch.commit();
  }
}

export interface CartCheckoutItem {
  productId: string;
  quantity: number;
}

export interface CartCheckoutInput {
  items: CartCheckoutItem[];
  contact: {
    name: string;
    phone: string;
    alternativePhone?: string;
    email?: string;
  };
  delivery: Omit<ChooseDeliveryInput, "requestId">;
}

/**
 * A cart can hold several different products at once, but the underlying
 * data model creates one productRequest per product (each may go to a
 * different supplier). This just runs the same single-item submit +
 * delivery-selection steps once per line item, collecting every requestId
 * so the confirmation page can show/link all of them.
 */
export async function submitCartOrder(input: CartCheckoutInput): Promise<{ requestIds: string[] }> {
  if (input.items.length === 0) throw new Error("Your cart is empty.");

  const requestIds: string[] = [];
  for (const item of input.items) {
    const { requestId } = await submitProductRequest({
      productId: item.productId,
      quantity: item.quantity,
      name: input.contact.name,
      phone: input.contact.phone,
      alternativePhone: input.contact.alternativePhone,
      email: input.contact.email,
    });
    await chooseRequestDelivery({ requestId, ...input.delivery });
    requestIds.push(requestId);
  }

  return { requestIds };
}

export async function getProductRequestById(requestId: string): Promise<ProductRequestDoc | null> {
  const snap = await adminDb.collection("productRequests").doc(requestId).get();
  if (!snap.exists) return null;
  return { ...serializeDoc(snap.data()), id: snap.id } as ProductRequestDoc;
}
