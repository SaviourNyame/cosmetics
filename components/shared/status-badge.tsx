import { Badge, type BadgeProps } from "@/components/ui/badge";

type Tone = NonNullable<BadgeProps["variant"]>;

/** Generic badge — pass any label + tone directly. */
export function StatusBadge({ label, tone = "neutral" }: { label: string; tone?: Tone }) {
  return <Badge variant={tone}>{label}</Badge>;
}

function humanize(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Domain status -> tone maps, so every module renders statuses consistently. */
const TONE_MAPS = {
  supplier: {
    pending: "neutral",
    under_review: "info",
    approved: "success",
    rejected: "error",
    suspended: "warning",
    deactivated: "neutral",
  },
  product: {
    draft: "neutral",
    active: "success",
    inactive: "warning",
    archived: "neutral",
  },
  request: {
    draft: "neutral",
    pending: "neutral",
    sent_to_suppliers: "info",
    awaiting_response: "info",
    accepted: "success",
    rejected_by_all: "error",
    expired: "warning",
    cancelled: "neutral",
    converted_to_order: "success",
  },
  order: {
    pending_customer_confirmation: "neutral",
    new: "info",
    supplier_confirmed: "info",
    preparing: "info",
    ready_for_pickup: "info",
    assigned_to_rider: "info",
    out_for_delivery: "info",
    delivered: "success",
    completed: "success",
    cancelled: "error",
    refunded: "warning",
  },
  delivery: {
    awaiting_assignment: "neutral",
    rider_assigned: "info",
    rider_arrived_at_supplier: "info",
    product_picked_up: "info",
    in_transit: "info",
    arrived_at_destination: "info",
    delivered: "success",
    pickup_completed: "success",
    failed: "error",
    cancelled: "neutral",
  },
  payment: {
    pending: "neutral",
    paid: "success",
    failed: "error",
    cancelled: "neutral",
    refunded: "warning",
    partially_refunded: "warning",
  },
  payout: {
    pending: "neutral",
    processing: "info",
    paid: "success",
    failed: "error",
    on_hold: "warning",
  },
  customer: {
    active: "success",
    suspended: "warning",
  },
  admin: {
    active: "success",
    suspended: "warning",
    deactivated: "neutral",
  },
} satisfies Record<string, Record<string, Tone>>;

export function DomainStatusBadge<D extends keyof typeof TONE_MAPS>({
  domain,
  status,
}: {
  domain: D;
  status: string;
}) {
  const tone = (TONE_MAPS[domain] as Record<string, Tone>)[status] ?? "neutral";
  return <Badge variant={tone}>{humanize(status)}</Badge>;
}
