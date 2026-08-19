"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormSection } from "@/components/shared/form-field";
import { updateGeneralSettings } from "@/lib/actions/settings";
import type { PlatformSettingsDoc } from "@/types/firestore";

export function GeneralSettingsForm({ settings }: { settings: PlatformSettingsDoc | null }) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    companyName: settings?.companyName ?? "Lumière Beauty",
    supportEmail: settings?.supportEmail ?? "",
    supportPhone: settings?.supportPhone ?? "",
    currency: settings?.currency ?? "GHS",
    platformCommissionPercent: settings?.platformCommissionPercent ?? 10,
    productRequestExpiryMinutes: settings?.productRequestExpiryMinutes ?? 60,
    supplierResponseWindowMinutes: settings?.supplierResponseWindowMinutes ?? 15,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateGeneralSettings(form);
        toast.success("Settings saved");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not save settings");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <FormSection title="Company Information" description="Shown across the admin dashboard and customer-facing site.">
        <FormField label="Company Name" required>
          <Input
            value={form.companyName}
            onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
            required
          />
        </FormField>
        <FormField label="Support Email">
          <Input
            type="email"
            value={form.supportEmail}
            onChange={(e) => setForm((f) => ({ ...f, supportEmail: e.target.value }))}
          />
        </FormField>
        <FormField label="Support Phone">
          <Input
            value={form.supportPhone}
            onChange={(e) => setForm((f) => ({ ...f, supportPhone: e.target.value }))}
          />
        </FormField>
        <FormField label="Currency" hint="ISO 4217 code, e.g. GHS, USD">
          <Input
            value={form.currency}
            onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value.toUpperCase() }))}
            maxLength={3}
          />
        </FormField>
      </FormSection>

      <FormSection
        title="Commission & Request Rules"
        description="Applies platform-wide unless overridden on an individual product."
      >
        <FormField label="Platform Commission %">
          <Input
            type="number"
            min={0}
            max={100}
            value={form.platformCommissionPercent}
            onChange={(e) =>
              setForm((f) => ({ ...f, platformCommissionPercent: Number(e.target.value) }))
            }
          />
        </FormField>
        <FormField label="Product Request Expiry (minutes)">
          <Input
            type="number"
            min={1}
            value={form.productRequestExpiryMinutes}
            onChange={(e) =>
              setForm((f) => ({ ...f, productRequestExpiryMinutes: Number(e.target.value) }))
            }
          />
        </FormField>
        <FormField label="Supplier Response Window (minutes)">
          <Input
            type="number"
            min={1}
            value={form.supplierResponseWindowMinutes}
            onChange={(e) =>
              setForm((f) => ({ ...f, supplierResponseWindowMinutes: Number(e.target.value) }))
            }
          />
        </FormField>
      </FormSection>

      <div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
