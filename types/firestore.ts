/**
 * Firestore document schema for the Lumière Beauty marketplace platform.
 *
 * This is the schema source of truth (the Firestore equivalent of the
 * relational schema requested in the original spec). Every top-level
 * collection is listed with its document shape; subcollections are noted
 * on their parent.
 */

/** Structurally compatible with both the client and admin SDK Timestamp classes. */
export interface TimestampLike {
  seconds: number;
  nanoseconds: number;
  toDate: () => Date;
}

export type ID = string;

// ---------------------------------------------------------------------------
// Roles & Administrators
// ---------------------------------------------------------------------------

export type AdminRoleId = "super_admin" | "admin" | string;

export interface RoleDoc {
  id: ID;
  name: string;
  description?: string;
  /** Permission keys, e.g. "suppliers.approve", "products.edit". Ignored for isSystem roles. */
  permissions: string[];
  isSystem: boolean; // true for super_admin (implicit all-permissions, cannot be edited/deleted)
  createdAt: TimestampLike;
  updatedAt: TimestampLike;
}

export type AdminStatus = "active" | "suspended" | "deactivated";

export interface AdminDoc {
  id: ID; // Firebase Auth uid
  name: string;
  email: string;
  phone?: string;
  photoURL?: string;
  roleId: AdminRoleId;
  status: AdminStatus;
  lastLoginAt?: TimestampLike;
  createdAt: TimestampLike;
  updatedAt: TimestampLike;
}

// ---------------------------------------------------------------------------
// Suppliers
// ---------------------------------------------------------------------------

export type SupplierStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "rejected"
  | "suspended"
  | "deactivated";

export interface SupplierDoc {
  id: ID;
  authUid?: string; // set once the supplier's login account is created

  // Business information
  businessName: string;
  businessRegistrationNumber?: string;
  taxIdentificationNumber?: string;
  businessType?: string;
  businessDescription?: string;
  yearEstablished?: number;
  businessAddress?: string;
  country?: string;
  region?: string;
  city?: string;
  digitalAddress?: string;
  website?: string;
  businessEmail: string;
  businessPhone: string;
  alternativePhone?: string;

  // Representative
  representativeName: string;
  representativeJobTitle?: string;
  representativeEmail: string;
  representativePhone: string;
  representativePhotoURL?: string;
  representativeIdType?: string;
  representativeIdNumber?: string;
  representativeIdDocumentURL?: string;

  // Status & lifecycle
  status: SupplierStatus;
  rejectionReason?: string;
  suspensionReason?: string;
  suspendedUntil?: TimestampLike;
  approvedAt?: TimestampLike;
  approvedBy?: ID; // admin id

  // Derived performance stats (denormalized, recomputed by server actions)
  stats: {
    requestsReceived: number;
    requestsAccepted: number;
    requestsRejected: number;
    averageResponseSeconds: number;
    completedOrders: number;
    cancelledOrders: number;
    totalEarnings: number;
    totalPayouts: number;
  };

  isDeleted: boolean;
  createdAt: TimestampLike;
  updatedAt: TimestampLike;
}

/** suppliers/{supplierId}/documents/{docId} */
export type SupplierDocumentType =
  | "business_registration"
  | "tax_certificate"
  | "fda_regulatory"
  | "product_certification"
  | "proof_of_address"
  | "supplier_agreement"
  | "identification"
  | "other";

export interface SupplierDocumentDoc {
  id: ID;
  type: SupplierDocumentType;
  label: string;
  fileURL: string;
  fileName: string;
  uploadedBy: ID;
  verified: boolean;
  createdAt: TimestampLike;
}

/** suppliers/{supplierId}/notes/{noteId} — internal admin notes, never visible to the supplier */
export interface SupplierNoteDoc {
  id: ID;
  authorId: ID;
  authorName: string;
  note: string;
  createdAt: TimestampLike;
}

/**
 * suppliers/{supplierId}/private/banking — isolated so Firestore security
 * rules can restrict reads to authorised administrators only.
 */
export interface SupplierBankingDoc {
  accountHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  bankBranch?: string;
  swiftCode?: string;
  mobileMoneyProvider?: string;
  mobileMoneyNumber?: string;
  preferredPayoutMethod?: "bank_transfer" | "mobile_money";
  payoutCurrency?: string;
  updatedAt: TimestampLike;
}

// ---------------------------------------------------------------------------
// Categories & Brands
// ---------------------------------------------------------------------------

export interface CategoryDoc {
  id: ID;
  name: string;
  slug: string;
  imageURL?: string;
  icon?: string;
  description?: string;
  parentCategoryId?: ID | null;
  displayOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: TimestampLike;
  updatedAt: TimestampLike;
}

export interface BrandDoc {
  id: ID;
  name: string;
  logoURL?: string;
  description?: string;
  countryOfOrigin?: string;
  website?: string;
  isActive: boolean;
  isFeatured: boolean;
  // Denormalized counters, kept in sync by server actions
  productCount: number;
  assignedSupplierCount: number;
  createdAt: TimestampLike;
  updatedAt: TimestampLike;
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export type ProductStatus = "draft" | "active" | "inactive" | "archived";

export type PricingMethod =
  | "fixed"
  | "starting_from"
  | "price_range"
  | "supplier_confirmation_required";

export type BeautyConcern =
  | "acne"
  | "dry_skin"
  | "oily_skin"
  | "hyperpigmentation"
  | "dark_spots"
  | "sensitive_skin"
  | "anti_ageing"
  | "hair_loss"
  | "dandruff"
  | "uneven_skin_tone";

export interface ProductDoc {
  id: ID;
  name: string;
  slug: string;
  shortDescription?: string;
  fullDescription?: string;
  productType?: string;
  tags: string[];
  searchKeywords: string[];
  status: ProductStatus;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  customerRequestEnabled: boolean;

  // Classification
  categoryId?: ID;
  subcategoryId?: ID;
  brandId?: ID;
  collection?: string;
  skinType?: string;
  hairType?: string;
  beautyConcerns: BeautyConcern[];
  suitableGender?: "male" | "female" | "unisex";
  ageGroup?: string;
  countryOfOrigin?: string;

  // Pricing
  pricingMethod: PricingMethod;
  displayPrice?: number;
  minEstimatedPrice?: number;
  maxEstimatedPrice?: number;
  recommendedSellingPrice?: number;
  platformServiceFee?: number;
  platformCommissionPercent?: number;
  taxPercent?: number;
  currency: string;
  discountType?: "percentage" | "fixed";
  discountValue?: number;
  discountStartAt?: TimestampLike;
  discountEndAt?: TimestampLike;

  // Cosmetic details
  ingredients?: string;
  keyBenefits?: string;
  howToUse?: string;
  warnings?: string;
  storageInstructions?: string;
  size?: string;
  volume?: string;
  weight?: string;
  dimensions?: string;
  packagingType?: string;
  shelfLife?: string;
  countryOfManufacture?: string;
  certificationInfo?: string;
  fdaRegistrationNumber?: string;
  isCrueltyFree: boolean;
  isVegan: boolean;
  isOrganic: boolean;
  isDermatologicallyTested: boolean;
  isSuitableForSensitiveSkin: boolean;

  // Media
  primaryImageURL?: string;
  videoURL?: string;

  // Denormalized counters
  stats: {
    assignedSupplierCount: number;
    requestCount: number;
    completedOrderCount: number;
  };

  isDeleted: boolean;
  createdAt: TimestampLike;
  updatedAt: TimestampLike;
  createdBy: ID;
}

/** products/{productId}/images/{imageId} */
export interface ProductImageDoc {
  id: ID;
  url: string;
  altText?: string;
  displayOrder: number;
  isPrimary: boolean;
  createdAt: TimestampLike;
}

/** products/{productId}/variants/{variantId} */
export interface ProductVariantDoc {
  id: ID;
  name: string;
  code?: string;
  imageURL?: string;
  attribute: "size" | "shade" | "colour" | "scent" | "volume" | "weight" | "package_quantity";
  displayPrice?: number;
  minEstimatedPrice?: number;
  maxEstimatedPrice?: number;
  isActive: boolean;
  customerRequestEnabled: boolean;
  createdAt: TimestampLike;
  updatedAt: TimestampLike;
}

// ---------------------------------------------------------------------------
// Supplier <-> Product assignment
// ---------------------------------------------------------------------------

export interface ProductSupplierDoc {
  id: ID;
  productId: ID;
  supplierId: ID;
  variantId?: ID | null;

  supplierProductCode?: string;
  supplyPrice?: number;
  minExpectedPrice?: number;
  maxExpectedPrice?: number;
  serviceArea?: string[]; // list of regions/cities served for this product
  usualPreparationTimeMinutes?: number;
  priority: number; // lower = higher priority; used for tie-breaking/ranking, not exclusivity
  isPreferred: boolean;
  isExclusive: boolean; // when true, only this supplier receives requests for the product/variant
  isActive: boolean;

  adminNotes?: string;
  assignedAt: TimestampLike;
  assignedBy: ID;
  updatedAt: TimestampLike;
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export type CustomerStatus = "active" | "suspended";

export interface CustomerDoc {
  id: ID; // Firebase Auth uid
  name: string;
  email?: string;
  phone: string;
  profileImageURL?: string;
  status: CustomerStatus;

  stats: {
    requestCount: number;
    completedOrderCount: number;
    totalSpent: number;
  };
  lastRequestAt?: TimestampLike;
  lastOrderAt?: TimestampLike;

  createdAt: TimestampLike;
  updatedAt: TimestampLike;
}

/** customers/{customerId}/addresses/{addressId} */
export interface CustomerAddressDoc {
  id: ID;
  label?: string;
  region?: string;
  city?: string;
  area?: string;
  digitalAddress?: string;
  landmark?: string;
  isDefault: boolean;
  createdAt: TimestampLike;
}

// ---------------------------------------------------------------------------
// Product Requests (the core matching engine)
// ---------------------------------------------------------------------------

export type ProductRequestStatus =
  | "draft"
  | "pending"
  | "sent_to_suppliers"
  | "awaiting_response"
  | "accepted"
  | "rejected_by_all"
  | "expired"
  | "cancelled"
  | "converted_to_order";

export type RejectionReason =
  | "product_unavailable"
  | "variant_unavailable"
  | "cannot_fulfil_quantity"
  | "outside_delivery_area"
  | "unable_to_meet_time"
  | "price_unavailable"
  | "temporary_closure"
  | "other";

export interface ProductRequestDoc {
  id: ID;
  customerId: ID;
  productId: ID;
  variantId?: ID | null;
  quantity: number;
  preferredBrandId?: ID;
  customerNotes?: string;

  deliveryLocation?: string;
  deliveryArea?: string;
  preferredDeliveryMethod?: "platform_delivery" | "yango_delivery" | "customer_pickup";
  preferredDeliveryTime?: string;
  contactPhone: string;
  alternativePhone?: string;
  maxAcceptablePrice?: number;
  paymentPreference?: string;

  // Snapshots taken at request time, so history stays accurate even if the
  // product/customer record changes later
  productSnapshot: { name: string; displayPrice?: number; pricingMethod: PricingMethod };
  customerSnapshot: { name: string; phone: string };

  status: ProductRequestStatus;
  eligibleSupplierIds: ID[];
  winningSupplierId?: ID | null;
  confirmedFinalPrice?: number;

  responseWindowMinutes: number;
  sentAt?: TimestampLike;
  expiresAt?: TimestampLike;
  acceptedAt?: TimestampLike;
  completedAt?: TimestampLike;

  previousAttemptId?: ID | null; // links a reassigned/resent request to its predecessor
  adminNotes?: string;

  createdAt: TimestampLike;
  updatedAt: TimestampLike;
}

export type InvitationStatus = "pending" | "accepted" | "rejected" | "expired" | "closed";

/** productRequests/{requestId}/invitations/{supplierId} */
export interface RequestInvitationDoc {
  id: ID; // == supplierId
  supplierId: ID;
  supplierName: string;
  status: InvitationStatus;

  // Response payload (populated when the supplier responds)
  availabilityConfirmed?: boolean;
  availableVariantId?: ID;
  supplierPrice?: number;
  customerFinalPrice?: number;
  expectedPreparationMinutes?: number;
  earliestPickupTime?: string;
  supplierNotes?: string;
  rejectionReason?: RejectionReason;
  rejectionNotes?: string;

  notifiedAt: TimestampLike;
  respondedAt?: TimestampLike;
  responseSeconds?: number;
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export type OrderStatus =
  | "pending_customer_confirmation"
  | "new"
  | "supplier_confirmed"
  | "preparing"
  | "ready_for_pickup"
  | "assigned_to_rider"
  | "out_for_delivery"
  | "delivered"
  | "completed"
  | "cancelled"
  | "refunded";

export interface OrderDoc {
  id: ID;
  orderNumber: string; // human-readable, e.g. LM-000123
  requestId: ID;
  customerId: ID;
  supplierId: ID;
  productId: ID;
  variantId?: ID | null;
  quantity: number;

  finalPrice: number;
  platformFee: number;
  platformCommission: number;
  supplierEarning: number;

  status: OrderStatus;
  paymentStatus: "pending" | "paid" | "failed" | "cancelled" | "refunded" | "partially_refunded";
  deliveryMethod: "platform_delivery" | "yango_delivery" | "customer_pickup";

  customerNotes?: string;
  supplierNotes?: string;
  adminNotes?: string;

  createdAt: TimestampLike;
  updatedAt: TimestampLike;
  completedAt?: TimestampLike;
  cancelledAt?: TimestampLike;
  cancellationReason?: string;
}

/** orders/{orderId}/timeline/{eventId} */
export interface OrderTimelineEventDoc {
  id: ID;
  label: string;
  description?: string;
  actorId?: ID;
  actorRole?: string;
  createdAt: TimestampLike;
}

// ---------------------------------------------------------------------------
// Deliveries
// ---------------------------------------------------------------------------

export type DeliveryMethod = "platform_delivery" | "yango_delivery" | "customer_pickup";

export type DeliveryStatus =
  | "awaiting_assignment"
  | "rider_assigned"
  | "rider_arrived_at_supplier"
  | "product_picked_up"
  | "in_transit"
  | "arrived_at_destination"
  | "delivered"
  | "pickup_completed"
  | "failed"
  | "cancelled";

export interface DeliveryDoc {
  id: ID;
  orderId: ID;
  method: DeliveryMethod;
  status: DeliveryStatus;

  // Platform delivery
  riderName?: string;
  riderPhone?: string;
  vehicleType?: string;
  vehicleRegistrationNumber?: string;
  supplierPickupLocation?: string;
  customerDeliveryLocation?: string;
  deliveryFee?: number;
  estimatedPickupAt?: TimestampLike;
  estimatedDeliveryAt?: TimestampLike;
  proofOfPickupURL?: string;
  proofOfDeliveryURL?: string;
  riderNotes?: string;

  // Yango delivery
  yangoReference?: string;
  yangoDriverName?: string;
  yangoDriverPhone?: string;
  yangoVehicleInfo?: string;
  yangoTrackingLink?: string;
  yangoPickupAt?: TimestampLike;
  yangoDeliveryAt?: TimestampLike;

  // Customer pickup
  pickupLocation?: string;
  pickupContactPerson?: string;
  pickupContactPhone?: string;
  pickupCode?: string;
  expectedPickupAt?: TimestampLike;
  actualPickupAt?: TimestampLike;
  pickupConfirmed?: boolean;

  createdAt: TimestampLike;
  updatedAt: TimestampLike;
}

// ---------------------------------------------------------------------------
// Payments, Refunds, Earnings, Payouts
// ---------------------------------------------------------------------------

export type PaymentStatus = "pending" | "paid" | "failed" | "cancelled" | "refunded" | "partially_refunded";

export interface PaymentDoc {
  id: ID;
  reference: string;
  orderId: ID;
  customerId: ID;
  supplierId: ID;
  method: string;
  grossAmount: number;
  platformCommission: number;
  deliveryFee: number;
  tax: number;
  supplierEarning: number;
  refundAmount: number;
  status: PaymentStatus;
  paidAt?: TimestampLike;
  createdAt: TimestampLike;
  updatedAt: TimestampLike;
}

export interface RefundDoc {
  id: ID;
  paymentId: ID;
  orderId: ID;
  amount: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "processed";
  approvedBy?: ID;
  createdAt: TimestampLike;
  updatedAt: TimestampLike;
}

export interface SupplierEarningDoc {
  id: ID;
  supplierId: ID;
  orderId: ID;
  grossAmount: number;
  platformCommission: number;
  netEarning: number;
  createdAt: TimestampLike;
}

export type PayoutStatus = "pending" | "processing" | "paid" | "failed" | "on_hold";

export interface SupplierPayoutDoc {
  id: ID;
  supplierId: ID;
  periodStart: TimestampLike;
  periodEnd: TimestampLike;
  completedOrders: number;
  grossSales: number;
  platformCommission: number;
  refundDeductions: number;
  otherDeductions: number;
  netPayout: number;
  status: PayoutStatus;
  payoutMethod?: string;
  transactionReference?: string;
  paidAt?: TimestampLike;
  createdAt: TimestampLike;
  updatedAt: TimestampLike;
}

// ---------------------------------------------------------------------------
// Notifications & Activity Logs
// ---------------------------------------------------------------------------

export type NotificationTargetType = "admin" | "supplier" | "customer";

export interface NotificationDoc {
  id: ID;
  targetType: NotificationTargetType;
  targetId: ID;
  type: string;
  title: string;
  message: string;
  read: boolean;
  linkURL?: string;
  createdAt: TimestampLike;
}

export interface ActivityLogDoc {
  id: ID;
  userId: ID;
  userName: string;
  userRole: string;
  action: string;
  resourceType: string;
  resourceId: string;
  description: string;
  ipAddress?: string;
  device?: string;
  createdAt: TimestampLike;
}

// ---------------------------------------------------------------------------
// Platform settings — settings/platform (singleton)
// ---------------------------------------------------------------------------

export interface PlatformSettingsDoc {
  companyName: string;
  supportEmail?: string;
  supportPhone?: string;
  currency: string;
  defaultTaxPercent: number;
  platformServiceFee: number;
  platformCommissionPercent: number;
  productRequestExpiryMinutes: number;
  supplierResponseWindowMinutes: number;
  automaticReassignment: boolean;
  yangoApiKey?: string;
  yangoEnabled: boolean;
  fileUploadMaxSizeMB: number;
  updatedAt: TimestampLike;
  updatedBy: ID;
}
