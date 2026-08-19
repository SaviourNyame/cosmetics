"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";

type RelatedProduct = {
  productId: string;
  slug: string;
  category: string;
  name: string;
  price: string;
  priceValue: number;
  currency: string;
  image: string;
  rating?: number;
};

export default function RelatedCarousel({ products }: { products: RelatedProduct[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (amount: number) => {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <>
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="font-display text-[32px] text-on-surface">Complementary Care</h2>
          <p className="text-on-surface-variant">Complete your lumière ritual</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => scrollBy(-400)}
            className="w-12 h-12 glass-panel rounded-full flex items-center justify-center hover:bg-on-surface hover:text-white transition-all"
            aria-label="Scroll left"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <button
            onClick={() => scrollBy(400)}
            className="w-12 h-12 glass-panel rounded-full flex items-center justify-center hover:bg-on-surface hover:text-white transition-all"
            aria-label="Scroll right"
          >
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-8 overflow-x-auto pb-12 scroll-smooth snap-x"
      >
        {products.map((product) => (
          <div
            key={product.slug}
            className="min-w-[300px] md:min-w-[350px] snap-start glass-panel p-6 rounded-xl hover:scale-[1.03] transition-all duration-500 group relative"
          >
            <Link href={`/product/${product.slug}`} className="absolute inset-0 z-0" aria-label={product.name} />
            <div className="aspect-square bg-surface-container mb-6 rounded-lg overflow-hidden relative pointer-events-none">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 70vw, 350px"
                className="object-contain p-3 transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-4 right-4 pointer-events-auto">
                <AddToCartButton
                  variant="icon"
                  product={{
                    productId: product.productId,
                    slug: product.slug,
                    name: product.name,
                    image: product.image,
                    price: product.priceValue,
                    currency: product.currency,
                  }}
                />
              </div>
            </div>
            <span className="text-[10px] font-semibold text-primary mb-2 block pointer-events-none">
              {product.category}
            </span>
            <h3 className="font-display text-[18px] text-on-surface mb-2 pointer-events-none">{product.name}</h3>
            <div className="flex justify-between items-center pointer-events-none">
              <span className="price-text">{product.price}</span>
              {product.rating !== undefined && (
                <div className="flex gap-0.5 text-primary">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className="material-symbols-outlined text-[14px]"
                      style={{ fontVariationSettings: n <= Math.floor(product.rating!) ? "'FILL' 1" : undefined }}
                    >
                      star
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
