import "server-only";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { adminDb } from "@/lib/firebase-admin";
import { serializeDoc } from "@/lib/firestore/serialize";
import type { BrandDoc, CategoryDoc, ProductDoc } from "@/types/firestore";

function docs(snap: FirebaseFirestore.QuerySnapshot): ProductDoc[] {
  return snap.docs.map((d) => ({ ...serializeDoc(d.data()), id: d.id })) as ProductDoc[];
}

/**
 * Filters by `status` only (single-field, auto-indexed) and does the rest
 * (isDeleted, sort) in memory. The catalogue is small (~100s of docs), and
 * this sidesteps needing composite indexes deployed for every combination
 * of storefront filters.
 */
const fetchActiveProducts = unstable_cache(
  async (): Promise<ProductDoc[]> => {
    const snap = await adminDb
      .collection("products")
      .where("status", "==", "active")
      .get()
      .catch(() => null);
    if (!snap) return [];
    return docs(snap).filter((p) => !p.isDeleted);
  },
  ["storefront-active-products"],
  { revalidate: 300 }
);

const fetchActiveCategories = unstable_cache(
  async (): Promise<CategoryDoc[]> => {
    const snap = await adminDb.collection("categories").where("isActive", "==", true).get().catch(() => null);
    if (!snap) return [];
    return snap.docs.map((d) => ({ ...serializeDoc(d.data()), id: d.id })) as CategoryDoc[];
  },
  ["storefront-active-categories"],
  { revalidate: 300 }
);

const fetchActiveBrands = unstable_cache(
  async (): Promise<BrandDoc[]> => {
    const snap = await adminDb.collection("brands").where("isActive", "==", true).get().catch(() => null);
    if (!snap) return [];
    return snap.docs.map((d) => ({ ...serializeDoc(d.data()), id: d.id })) as BrandDoc[];
  },
  ["storefront-active-brands"],
  { revalidate: 300 }
);

const getActiveProducts = cache(async (): Promise<ProductDoc[]> => {
  return fetchActiveProducts();
});

async function getActiveProductsUncached(): Promise<ProductDoc[]> {
  const snap = await adminDb
    .collection("products")
    .where("status", "==", "active")
    .get()
    .catch(() => null);
  if (!snap) return [];
  return docs(snap).filter((p) => !p.isDeleted);
}

export type ShopSort = "newest" | "name_asc" | "price_asc" | "price_desc";

export interface ShopFilters {
  query?: string;
  maxPrice?: number;
  categoryId?: string;
  brandId?: string;
  sort?: ShopSort;
}

function toMillis(value: unknown): number {
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();

  if (typeof value === "object" && value !== null) {
    const maybeToDate = (value as { toDate?: () => Date }).toDate;
    if (typeof maybeToDate === "function") {
      const asDate = maybeToDate();
      if (asDate instanceof Date) return asDate.getTime();
    }

    const seconds = (value as { seconds?: number }).seconds;
    if (typeof seconds === "number") {
      return seconds * 1000;
    }
  }

  return 0;
}

function sortProducts(products: ProductDoc[], sort: ShopSort): ProductDoc[] {
  const sorted = [...products];
  switch (sort) {
    case "price_asc":
      return sorted.sort((a, b) => (a.displayPrice ?? 0) - (b.displayPrice ?? 0));
    case "price_desc":
      return sorted.sort((a, b) => (b.displayPrice ?? 0) - (a.displayPrice ?? 0));
    case "newest":
      return sorted.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
    case "name_asc":
    default:
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
}

export async function getStorefrontProducts(filters: ShopFilters = {}): Promise<ProductDoc[]> {
  let products = await getActiveProducts();

  if (filters.query) {
    const q = filters.query.trim().toLowerCase();
    if (q) {
      products = products.filter(
        (p) => p.name.toLowerCase().includes(q) || p.searchKeywords.some((k) => k.toLowerCase().includes(q))
      );
    }
  }

  if (filters.maxPrice !== undefined) {
    products = products.filter((p) => (p.displayPrice ?? 0) <= filters.maxPrice!);
  }

  if (filters.categoryId) {
    products = products.filter((p) => p.categoryId === filters.categoryId);
  }

  if (filters.brandId) {
    products = products.filter((p) => p.brandId === filters.brandId);
  }

  return sortProducts(products, filters.sort ?? "newest");
}

export async function getCategoriesWithCounts(): Promise<(CategoryDoc & { productCount: number })[]> {
  const [categories, products] = await Promise.all([
    fetchActiveCategories(),
    getActiveProducts(),
  ]);
  if (categories.length === 0) return [];

  const counts = new Map<string, number>();
  for (const p of products) {
    if (!p.categoryId) continue;
    counts.set(p.categoryId, (counts.get(p.categoryId) ?? 0) + 1);
  }

  return categories
    .map((c) => ({ ...c, productCount: counts.get(c.id) ?? 0 }))
    .filter((c) => c.productCount > 0)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getBrandsWithCounts(): Promise<(BrandDoc & { productCount: number })[]> {
  const [brands, products] = await Promise.all([
    fetchActiveBrands(),
    getActiveProducts(),
  ]);
  if (brands.length === 0) return [];

  const counts = new Map<string, number>();
  for (const p of products) {
    if (!p.brandId) continue;
    counts.set(p.brandId, (counts.get(p.brandId) ?? 0) + 1);
  }

  return brands
    .map((b) => ({ ...b, productCount: counts.get(b.id) ?? 0 }))
    .filter((b) => b.productCount > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getFeaturedProducts(limit = 4): Promise<ProductDoc[]> {
  const products = await getActiveProducts();
  const featured = products.filter((p) => p.isFeatured);
  if (featured.length >= limit) return featured.slice(0, limit);

  const byId = new Map(featured.map((p) => [p.id, p]));
  const newest = [...products].sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
  for (const p of newest) {
    if (byId.size >= limit) break;
    byId.set(p.id, p);
  }
  return Array.from(byId.values()).slice(0, limit);
}

export async function getProductBySlug(slug: string): Promise<ProductDoc | null> {
  const snap = await adminDb
    .collection("products")
    .where("slug", "==", slug)
    .limit(1)
    .get()
    .catch(() => null);
  if (!snap || snap.empty) return null;
  const product = { ...serializeDoc(snap.docs[0].data()), id: snap.docs[0].id } as ProductDoc;
  return product.isDeleted ? null : product;
}

export async function getProductById(productId: string): Promise<ProductDoc | null> {
  const snap = await adminDb.collection("products").doc(productId).get().catch(() => null);
  if (!snap || !snap.exists) return null;
  return { ...serializeDoc(snap.data()), id: snap.id } as ProductDoc;
}

export async function getRelatedProducts(excludeId: string, limit = 4): Promise<ProductDoc[]> {
  const products = await getActiveProducts();
  return products
    .filter((p) => p.id !== excludeId)
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, limit);
}
