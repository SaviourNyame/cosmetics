"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/format";
import { submitCartOrder } from "@/lib/actions/customer-requests";
import { toast } from "sonner";

const METHODS = [
  { value: "platform_delivery" as const, icon: "local_shipping", title: "Platform Delivery" },
  { value: "yango_delivery" as const, icon: "sports_motorsports", title: "Yango Delivery" },
  { value: "customer_pickup" as const, icon: "storefront", title: "Self Pickup" },
];

const YANGO_SAMPLE_PRICE_LIST = [
  { area: "Accra Central (0-3 km)", eta: "25-40 min", fee: 18 },
  { area: "Airport Residential / Cantonments", eta: "30-50 min", fee: 24 },
  { area: "East Legon / Dzorwulu", eta: "35-60 min", fee: 28 },
  { area: "Spintex / Tema Station", eta: "45-75 min", fee: 35 },
];

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [contact, setContact] = useState({ name: "", phone: "", alternativePhone: "", email: "" });
  const [method, setMethod] = useState<(typeof METHODS)[number]["value"] | null>(null);
  const [address, setAddress] = useState({ region: "", city: "", area: "", digitalAddress: "", landmark: "" });

  const needsAddress = method === "platform_delivery" || method === "yango_delivery";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contact.name.trim() || !contact.phone.trim()) {
      toast.error("Name and phone number are required.");
      return;
    }
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
      const { requestIds } = await submitCartOrder({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        contact: {
          name: contact.name.trim(),
          phone: contact.phone.trim(),
          alternativePhone: contact.alternativePhone.trim() || undefined,
          email: contact.email.trim() || undefined,
        },
        delivery: { method, ...(needsAddress ? address : {}) },
      });
      clear();
      router.push(`/cart/confirmation?ids=${requestIds.join(",")}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not complete checkout.");
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <>
        <Header active="/request" />
        <main className="pt-20 min-h-screen">
          <section className="max-w-3xl mx-auto px-5 py-16 text-center">
            <div className="glass-panel rounded-xl p-16 text-on-surface-variant">Your cart is empty.</div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header active="/request" />
      <main className="pt-20 min-h-screen">
        <section className="max-w-5xl mx-auto px-5 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <form onSubmit={handleSubmit} className="lg:col-span-8 flex flex-col gap-10">
            <div>
              <h1 className="font-display text-[32px] italic mb-6">Your Details</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field label="Full Name" required>
                  <input
                    required
                    value={contact.name}
                    onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
                    className="input-field"
                    placeholder="Ama Owusu"
                  />
                </Field>
                <Field label="Phone Number" required>
                  <input
                    required
                    value={contact.phone}
                    onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
                    className="input-field"
                    placeholder="024 000 0000"
                  />
                </Field>
                <Field label="Alternative Phone">
                  <input
                    value={contact.alternativePhone}
                    onChange={(e) => setContact((c) => ({ ...c, alternativePhone: e.target.value }))}
                    className="input-field"
                    placeholder="Optional"
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    value={contact.email}
                    onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                    className="input-field"
                    placeholder="Optional"
                  />
                </Field>
              </div>
            </div>

            <div>
              <h2 className="font-display text-[24px] italic mb-6">Choose Delivery</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {METHODS.map((m) => (
                  <button
                    type="button"
                    key={m.value}
                    onClick={() => setMethod(m.value)}
                    className={`glass-panel rounded-xl p-5 text-left transition-all hover:scale-[1.02] ${
                      method === m.value ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    {m.value === "yango_delivery" ? (
                      <div className="mb-3 w-9 h-9 rounded-md overflow-hidden bg-white/80 p-1">
                        <Image src="/yango.png" alt="Yango" width={28} height={28} className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <span className="material-symbols-outlined text-primary text-2xl mb-3 block">{m.icon}</span>
                    )}
                    <h3 className="font-display text-base">{m.title}</h3>
                  </button>
                ))}
              </div>

              {method === "yango_delivery" && (
                <div className="glass-panel rounded-xl p-6 mb-6">
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
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="reflection-sweep bg-on-surface text-white py-5 rounded-md text-xs font-semibold tracking-widest transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {submitting ? "PLACING ORDER..." : "PLACE MY ORDER"}
            </button>
          </form>

          <div className="lg:col-span-4">
            <div className="glass-panel rounded-xl p-8 sticky top-28">
              <h2 className="font-display text-xl mb-6">Order Summary</h2>
              <div className="flex flex-col gap-4 mb-6 max-h-80 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-white relative shrink-0">
                      {item.image && <Image src={item.image} alt={item.name} fill className="object-contain p-1" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{item.name}</p>
                      <p className="text-xs text-on-surface-variant">Qty {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold shrink-0 price-text">
                      {formatCurrency(item.price * item.quantity, item.currency)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-6 border-t border-outline-variant/30">
                <span className="text-on-surface-variant">Subtotal</span>
                <span className="font-semibold price-text">{formatCurrency(subtotal)}</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-semibold tracking-[0.1em] text-on-surface-variant uppercase">
        {label}
        {required && <span className="text-primary"> *</span>}
      </span>
      {children}
    </label>
  );
}
