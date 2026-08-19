"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { submitProductRequest } from "@/lib/actions/customer-requests";

export default function RequestForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    alternativePhone: "",
    email: "",
    quantity: "1",
    customerNotes: "",
  });

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Name and phone number are required.");
      return;
    }
    const quantity = parseInt(form.quantity, 10);
    if (!quantity || quantity < 1) {
      toast.error("Enter a valid quantity.");
      return;
    }

    setSubmitting(true);
    try {
      const { requestId } = await submitProductRequest({
        productId,
        quantity,
        customerNotes: form.customerNotes.trim() || undefined,
        name: form.name.trim(),
        phone: form.phone.trim(),
        alternativePhone: form.alternativePhone.trim() || undefined,
        email: form.email.trim() || undefined,
      });
      router.push(`/request/${requestId}/delivery`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit your request.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Field label="Full Name" required>
          <input
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="input-field"
            placeholder="Ama Owusu"
          />
        </Field>
        <Field label="Phone Number" required>
          <input
            required
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className="input-field"
            placeholder="024 000 0000"
          />
        </Field>
        <Field label="Alternative Phone">
          <input
            value={form.alternativePhone}
            onChange={(e) => update("alternativePhone", e.target.value)}
            className="input-field"
            placeholder="Optional"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="input-field"
            placeholder="Optional"
          />
        </Field>
        <Field label="Quantity" required>
          <input
            type="number"
            min={1}
            required
            value={form.quantity}
            onChange={(e) => update("quantity", e.target.value)}
            className="input-field"
          />
        </Field>
      </div>
      <Field label="Notes for the supplier">
        <textarea
          value={form.customerNotes}
          onChange={(e) => update("customerNotes", e.target.value)}
          className="input-field min-h-24 resize-none"
          placeholder="Anything a supplier should know about this request..."
        />
      </Field>

      <button
        type="submit"
        disabled={submitting}
        className="reflection-sweep bg-on-surface text-white py-5 rounded-md text-xs font-semibold tracking-widest transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
      >
        {submitting ? "SUBMITTING..." : "CONTINUE TO DELIVERY"}
      </button>
    </form>
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
