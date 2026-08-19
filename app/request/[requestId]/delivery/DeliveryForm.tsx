"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { chooseRequestDelivery } from "@/lib/actions/customer-requests";
import { formatCurrency } from "@/lib/format";

const METHODS = [
  {
    value: "platform_delivery" as const,
    icon: "local_shipping",
    title: "Platform Delivery",
    copy: "Our own riders deliver directly to your address.",
  },
  {
    value: "yango_delivery" as const,
    icon: "sports_motorsports",
    title: "Yango Delivery",
    copy: "Fastest option — a Yango courier picks up and delivers same-day.",
  },
  {
    value: "customer_pickup" as const,
    icon: "storefront",
    title: "Self Pickup",
    copy: "Collect it yourself once the supplier confirms it's ready.",
  },
];

const YANGO_SAMPLE_PRICE_LIST = [
  { area: "Accra Central (0-3 km)", eta: "25-40 min", fee: 18 },
  { area: "Airport Residential / Cantonments", eta: "30-50 min", fee: 24 },
  { area: "East Legon / Dzorwulu", eta: "35-60 min", fee: 28 },
  { area: "Spintex / Tema Station", eta: "45-75 min", fee: 35 },
];

export default function DeliveryForm({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [method, setMethod] = useState<(typeof METHODS)[number]["value"] | null>(null);
  const [address, setAddress] = useState({ region: "", city: "", area: "", digitalAddress: "", landmark: "" });

  const needsAddress = method === "platform_delivery" || method === "yango_delivery";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!method) {
      toast.error("Choose a delivery method to continue.");
      return;
    }
    if (needsAddress && !address.city.trim() && !address.area.trim()) {
      toast.error("Enter at least a city or area for delivery.");
      return;
    }

    setSubmitting(true);
    try {
      await chooseRequestDelivery({
        requestId,
        method,
        ...(needsAddress ? address : {}),
      });
      router.push(`/request/${requestId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save your delivery choice.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {METHODS.map((m) => (
          <button
            type="button"
            key={m.value}
            onClick={() => setMethod(m.value)}
            className={`glass-panel rounded-xl p-6 text-left transition-all hover:scale-[1.02] ${
              method === m.value ? "ring-2 ring-primary" : ""
            }`}
          >
            {m.value === "yango_delivery" ? (
              <div className="mb-4 w-10 h-10 rounded-md overflow-hidden bg-white/80 p-1">
                <Image src="/yango.png" alt="Yango" width={32} height={32} className="w-full h-full object-contain" />
              </div>
            ) : (
              <span className="material-symbols-outlined text-primary text-3xl mb-4 block">{m.icon}</span>
            )}
            <h3 className="font-display text-lg mb-2">{m.title}</h3>
            <p className="text-sm text-on-surface-variant">{m.copy}</p>
          </button>
        ))}
      </div>

      {method === "yango_delivery" && (
        <div className="glass-panel rounded-xl p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="font-display text-lg">Yango Delivery Sample Price List</h3>
              <p className="text-sm text-on-surface-variant">Estimated pricing by area. Final fare is confirmed when rider is assigned.</p>
            </div>
            <span className="text-xs font-semibold tracking-[0.08em] uppercase text-primary">Sample</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {YANGO_SAMPLE_PRICE_LIST.map((item) => (
              <div key={item.area} className="rounded-lg border border-outline-variant/40 bg-white/50 px-4 py-3">
                <p className="text-sm font-semibold">{item.area}</p>
                <p className="text-xs text-on-surface-variant">ETA {item.eta}</p>
                <p className="text-sm font-semibold mt-1">{formatCurrency(item.fee)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {needsAddress && (
        <div className="glass-panel rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="Region">
            <input
              value={address.region}
              onChange={(e) => setAddress((a) => ({ ...a, region: e.target.value }))}
              className="input-field"
              placeholder="Greater Accra"
            />
          </Field>
          <Field label="City">
            <input
              value={address.city}
              onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
              className="input-field"
              placeholder="Accra"
            />
          </Field>
          <Field label="Area / Suburb">
            <input
              value={address.area}
              onChange={(e) => setAddress((a) => ({ ...a, area: e.target.value }))}
              className="input-field"
              placeholder="East Legon"
            />
          </Field>
          <Field label="Digital Address">
            <input
              value={address.digitalAddress}
              onChange={(e) => setAddress((a) => ({ ...a, digitalAddress: e.target.value }))}
              className="input-field"
              placeholder="GA-000-0000"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Landmark">
              <input
                value={address.landmark}
                onChange={(e) => setAddress((a) => ({ ...a, landmark: e.target.value }))}
                className="input-field"
                placeholder="Nearest landmark to help the rider find you"
              />
            </Field>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="reflection-sweep bg-on-surface text-white py-5 rounded-md text-xs font-semibold tracking-widest transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
      >
        {submitting ? "PLACING ORDER..." : "PLACE MY ORDER"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-semibold tracking-[0.1em] text-on-surface-variant uppercase">{label}</span>
      {children}
    </label>
  );
}
