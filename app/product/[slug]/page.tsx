import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import RelatedCarousel from "../RelatedCarousel";
import { getProductBySlug, getRelatedProducts } from "@/lib/actions/storefront";
import { formatProductPrice } from "@/lib/format";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.id, 4);

  const details = [
    { title: "Description", body: product.fullDescription || product.shortDescription },
    { title: "Ingredients", body: product.ingredients },
    { title: "How to Use", body: product.howToUse },
  ].filter((section) => !!section.body);

  return (
    <>
      <Header active="/product" />
      <main className="pt-20">
        {/* Editorial product display */}
        <section className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-12 min-h-[90vh] gap-0">
          <div className="md:col-span-7 bg-white relative overflow-hidden flex items-center justify-center p-8">
            <div className="w-full h-full max-h-[800px] glass-panel rounded-lg flex items-center justify-center p-12 group relative">
              {product.primaryImageURL && (
                <Image
                  src={product.primaryImageURL}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 58vw"
                  className="object-contain p-12 drop-shadow-2xl transition-transform duration-700 group-hover:scale-105"
                />
              )}
            </div>
          </div>

          {/* Product info */}
          <div className="md:col-span-5 px-5 md:px-8 py-12 flex flex-col justify-center">
            <nav className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold tracking-[0.1em] text-on-surface-variant">SHOP</span>
              <span className="material-symbols-outlined text-[10px] text-on-surface-variant">chevron_right</span>
              <span className="text-xs font-semibold tracking-[0.1em] text-primary">
                {(product.productType || "PRODUCT").toUpperCase()}
              </span>
            </nav>
            <h1 className="font-display text-[40px] md:text-[64px] leading-[1.1] tracking-[-0.02em] text-on-surface mb-2">
              {product.name}
            </h1>
            {product.shortDescription && (
              <p className="text-xs font-semibold tracking-[0.2em] text-on-surface-variant mb-8 uppercase">
                {product.shortDescription}
              </p>
            )}
            <div className="flex items-center gap-4 mb-12">
              <span className="font-display text-[32px] price-text">{formatProductPrice(product)}</span>
              <span className="bg-surface-container px-3 py-1 rounded-full text-[10px] font-semibold text-on-surface-variant">
                {product.status === "active" ? "IN STOCK" : "UNAVAILABLE"}
              </span>
            </div>

            <div className="glass-panel p-6 mb-12 rounded-xl relative overflow-hidden group">
              <div className="flex gap-4 items-start relative z-10">
                <span
                  className="material-symbols-outlined text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
                <p className="text-on-surface-variant leading-relaxed">
                  This product is available from multiple verified suppliers.
                  Buy now and the fastest available supplier will
                  fulfill your order.
                </p>
              </div>
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            <div className="flex flex-col gap-8">
              <div className="flex gap-4">
                <Link
                  href={`/request/new/${product.slug}`}
                  className="reflection-sweep flex-1 bg-on-surface text-white py-5 rounded-md text-xs font-semibold tracking-widest transition-all hover:scale-[1.02] active:scale-95 text-center"
                >
                  BUY NOW
                </Link>
                <AddToCartButton
                  product={{
                    productId: product.id,
                    slug: product.slug,
                    name: product.name,
                    image: product.primaryImageURL ?? "",
                    price: product.displayPrice ?? 0,
                    currency: product.currency,
                  }}
                />
                <button className="w-16 h-16 glass-panel rounded-md flex items-center justify-center hover:scale-105 transition-all text-on-surface">
                  <span className="material-symbols-outlined">favorite</span>
                </button>
              </div>

              {details.length > 0 && (
                <div className="border-t border-outline-variant/30 pt-8">
                  {details.map((section, i) => (
                    <details key={section.title} className="group mb-4" open={i === 0}>
                      <summary className="list-none flex justify-between items-center cursor-pointer">
                        <h3 className="font-display text-[20px] font-semibold text-on-surface">{section.title}</h3>
                        <span className="material-symbols-outlined transition-transform group-open:rotate-180">
                          expand_more
                        </span>
                      </summary>
                      <div className="py-4 text-on-surface-variant leading-relaxed">{section.body}</div>
                    </details>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Related products */}
        {related.length > 0 && (
          <section className="py-24 max-w-[1440px] mx-auto px-5 lg:px-20">
            <RelatedCarousel
              products={related.map((p) => ({
                productId: p.id,
                slug: p.slug,
                category: (p.productType || "Beauty").toUpperCase(),
                name: p.name,
                price: formatProductPrice(p),
                priceValue: p.displayPrice ?? 0,
                currency: p.currency,
                image: p.primaryImageURL || "",
              }))}
            />
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
