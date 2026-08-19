import Link from "next/link";
import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc } from "@/lib/firestore/serialize";
import { PageHeader } from "@/components/shared/page-header";
import { FilterBar } from "@/components/shared/filter-bar";
import { Button } from "@/components/ui/button";
import { ProductsTable } from "./products-table";
import type { ProductDoc } from "@/types/firestore";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const snap = await adminDb.collection("products").orderBy("createdAt", "desc").get().catch(() => null);
  const products = (snap?.docs.map((d) => serializeDoc(d.data())) ?? []) as ProductDoc[];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Products"
        description="The cosmetics catalogue the platform deals in."
        action={
          <Button asChild>
            <Link href="/admin/products/new">Add Product</Link>
          </Button>
        }
      />
      <FilterBar searchPlaceholder="Search products..." />
      <ProductsTable data={products} />
    </div>
  );
}
