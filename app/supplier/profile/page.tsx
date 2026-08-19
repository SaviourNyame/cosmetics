import { requireRole } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { PageHeader } from "@/components/shared/page-header";
import { FormSection } from "@/components/shared/form-field";
import { DomainStatusBadge } from "@/components/shared/status-badge";
import type { SupplierDoc } from "@/types/firestore";

export const dynamic = "force-dynamic";

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">{label}</p>
      <p className="text-sm text-on-surface mt-1">{value || "—"}</p>
    </div>
  );
}

export default async function SupplierProfilePage() {
  const user = await requireRole(["supplier"]);
  const snap = await adminDb.collection("suppliers").doc(user.supplierId!).get();
  const supplier = snap.data() as SupplierDoc;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Business Profile"
        description="Your business information on file with the platform."
        action={<DomainStatusBadge domain="supplier" status={supplier.status} />}
      />

      <FormSection title="Business Information">
        <Field label="Business Name" value={supplier.businessName} />
        <Field label="Business Type" value={supplier.businessType} />
        <Field label="Business Email" value={supplier.businessEmail} />
        <Field label="Business Phone" value={supplier.businessPhone} />
        <Field label="Country" value={supplier.country} />
        <Field label="City" value={supplier.city} />
      </FormSection>

      <FormSection title="Representative">
        <Field label="Full Name" value={supplier.representativeName} />
        <Field label="Job Title" value={supplier.representativeJobTitle} />
        <Field label="Email" value={supplier.representativeEmail} />
        <Field label="Phone" value={supplier.representativePhone} />
      </FormSection>

      <p className="text-sm text-on-surface-variant">
        Editing your profile and uploading business documents will be enabled here shortly.
      </p>
    </div>
  );
}
