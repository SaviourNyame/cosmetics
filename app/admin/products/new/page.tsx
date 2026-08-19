import { PackagePlus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function AddProductPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Add Product"
        description="Create a new cosmetics catalogue entry."
      />
      <EmptyState
        icon={PackagePlus}
        title="The full Add Product form is next up"
        description="Basic info, classification, pricing method, media uploads, cosmetic details, and variants — coming with the Products module."
      />
    </div>
  );
}
