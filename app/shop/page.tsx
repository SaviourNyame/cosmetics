import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getStorefrontProducts, getCategoriesWithCounts, getBrandsWithCounts, type ShopSort } from "@/lib/actions/storefront";
import { formatProductPrice } from "@/lib/format";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import { SortSelect, SearchInput } from "./ShopSortSearch";
import { PriceRangeFilter } from "./PriceRangeFilter";

const PAGE_SIZE = 12;

function pageHref(params: Record<string, string | undefined>, page: number) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  if (page > 1) search.set("page", String(page));
  const qs = search.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

function paginationItems(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const items: Array<number | "ellipsis"> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) items.push("ellipsis");
  for (let n = start; n <= end; n += 1) items.push(n);
  if (end < total - 1) items.push("ellipsis");

  items.push(total);
  return items;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string; maxPrice?: string; q?: string; category?: string; brand?: string }>;
}) {
  const params = await searchParams;
  const sort = (params.sort as ShopSort) || "newest";
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;
  const query = params.q ?? "";
  const categoryId = params.category;
  const brandId = params.brand;
  const currentPage = Math.max(1, Number(params.page) || 1);

  const [allProducts, categories, brands] = await Promise.all([
    getStorefrontProducts({ sort, maxPrice, query, categoryId, brandId }),
    getCategoriesWithCounts(),
    getBrandsWithCounts(),
  ]);
  const totalPages = Math.max(1, Math.ceil(allProducts.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const products = allProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const baseParams = {
    q: query || undefined,
    sort: sort !== "newest" ? sort : undefined,
    maxPrice: params.maxPrice,
    category: categoryId,
    brand: brandId,
  };
  const allCategoriesTotal = categories.reduce((sum, c) => sum + c.productCount, 0);
  const allBrandsTotal = brands.reduce((sum, b) => sum + b.productCount, 0);

  return (
    <>
      <Header active="/shop" />
      <main className="pt-20 min-h-screen flex max-w-[1440px] mx-auto">
        {/* Sidebar filters */}
        <aside className="hidden lg:block w-80 shrink-0 h-[calc(100vh-80px)] sticky top-20 p-8 glass-panel overflow-y-auto">
          <div className="space-y-10">
            <div>
              <h3 className="text-xs font-semibold tracking-[0.1em] text-on-surface-variant mb-6 uppercase">
                Category
              </h3>
              <div className="space-y-3">
                <Link
                  href={pageHref({ ...baseParams, category: undefined }, 1)}
                  className={
                    !categoryId
                      ? "flex justify-between text-primary font-semibold"
                      : "flex justify-between text-on-surface hover:text-primary transition-colors"
                  }
                >
                  <span>All Products</span>
                  <span className="text-on-surface-variant">{allCategoriesTotal}</span>
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={pageHref({ ...baseParams, category: cat.id }, 1)}
                    className={
                      categoryId === cat.id
                        ? "flex justify-between text-primary font-semibold"
                        : "flex justify-between text-on-surface hover:text-primary transition-colors"
                    }
                  >
                    <span>{cat.name}</span>
                    <span className="text-on-surface-variant">{cat.productCount}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold tracking-[0.1em] text-on-surface-variant mb-6 uppercase">Brand</h3>
              <div className="space-y-3">
                <Link
                  href={pageHref({ ...baseParams, brand: undefined }, 1)}
                  className={
                    !brandId
                      ? "flex justify-between text-primary font-semibold"
                      : "flex justify-between text-on-surface hover:text-primary transition-colors"
                  }
                >
                  <span>All Brands</span>
                  <span className="text-on-surface-variant">{allBrandsTotal}</span>
                </Link>
                {brands.map((brand) => (
                  <Link
                    key={brand.id}
                    href={pageHref({ ...baseParams, brand: brand.id }, 1)}
                    className={
                      brandId === brand.id
                        ? "flex justify-between text-primary font-semibold"
                        : "flex justify-between text-on-surface hover:text-primary transition-colors"
                    }
                  >
                    <span>{brand.name}</span>
                    <span className="text-on-surface-variant">{brand.productCount}</span>
                  </Link>
                ))}
              </div>
            </div>

            <PriceRangeFilter maxPrice={maxPrice ?? 350} />
          </div>
        </aside>

        {/* Product grid */}
        <section className="flex-1 min-w-0 p-8 lg:p-12">
          <div className="sticky top-[84px] z-40 mb-12 flex flex-col md:flex-row justify-between items-center gap-6 glass-panel rounded-xl p-6">
            <div>
              <h1 className="font-display text-[32px] italic">Curation / Essentials</h1>
              <p className="text-on-surface-variant">
                Showing {products.length} of {allProducts.length} premium selections
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-center w-full md:w-auto">
              <SearchInput query={query} />
              <div className="flex gap-2 items-center shrink-0">
                <span className="text-xs font-semibold text-on-surface-variant">Sort By</span>
                <SortSelect sort={sort} />
              </div>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="glass-panel rounded-xl p-16 text-center text-on-surface-variant">
              {allProducts.length === 0
                ? "No products match your filters. Try widening your search."
                : "No products available yet. Check back soon."}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
              {products.map((product) => (
                <div key={product.id} className="crystal-card reflection-sweep rounded-xl p-6 flex flex-col group relative">
                  <Link href={`/product/${product.slug}`} className="absolute inset-0 z-0" aria-label={product.name} />
                  <div className="aspect-square w-full rounded-lg overflow-hidden bg-white mb-6 relative pointer-events-none">
                    {product.primaryImageURL && (
                      <Image
                        src={product.primaryImageURL}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                        className="object-contain p-3 group-hover:scale-105 transition-transform duration-700"
                      />
                    )}
                    {product.isNewArrival && (
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                        New In
                      </div>
                    )}
                    {!product.isNewArrival && product.isBestSeller && (
                      <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                        Bestseller
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 pointer-events-none">
                    <h3 className="font-display text-lg text-on-surface mb-3">{product.name}</h3>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="font-display text-xl price-text">{formatProductPrice(product)}</span>
                      <div className="relative z-10 pointer-events-auto">
                        <AddToCartButton
                          variant="icon"
                          className="bg-primary text-white p-3 rounded-full hover:scale-110 transition-all shadow-lg"
                          product={{
                            productId: product.id,
                            slug: product.slug,
                            name: product.name,
                            image: product.primaryImageURL ?? "",
                            price: product.displayPrice ?? 0,
                            currency: product.currency,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-20 flex justify-center items-center gap-4">
              <Link
                href={pageHref(baseParams, Math.max(1, page - 1))}
                aria-disabled={page === 1}
                className={`w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-variant transition-colors ${
                  page === 1 ? "pointer-events-none opacity-40" : ""
                }`}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </Link>
              <div className="flex items-center gap-2">
                {paginationItems(page, totalPages).map((item, idx) =>
                  item === "ellipsis" ? (
                    <span key={`ellipsis-${idx}`} className="w-10 h-10 flex items-center justify-center text-on-surface-variant">
                      ...
                    </span>
                  ) : (
                    <Link
                      key={item}
                      href={pageHref(baseParams, item)}
                      className={
                        item === page
                          ? "w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center"
                          : "w-10 h-10 rounded-full hover:bg-surface-variant transition-colors flex items-center justify-center"
                      }
                    >
                      {item}
                    </Link>
                  )
                )}
              </div>
              <Link
                href={pageHref(baseParams, Math.min(totalPages, page + 1))}
                aria-disabled={page === totalPages}
                className={`w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-variant transition-colors ${
                  page === totalPages ? "pointer-events-none opacity-40" : ""
                }`}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </Link>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
