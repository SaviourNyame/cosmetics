import Image from "next/image";
import Link from "next/link";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { getFeaturedProducts } from "@/lib/actions/storefront";
import { formatProductPrice } from "@/lib/format";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";

const CATEGORIES = [
  {
    name: "Skincare",
    tagline: "The Science of Radiance",
    image: "/images/stitch/459d2eeb35ae.jpg",
    span: "md:col-span-8",
  },
  {
    name: "Makeup",
    tagline: "Artistry Redefined",
    image: "/images/stitch/4a13972648e9.jpg",
    span: "md:col-span-4",
  },
  {
    name: "Haircare",
    tagline: "Salon Perfection",
    image: "/images/stitch/1a45127cb1cd.jpg",
    span: "md:col-span-4",
  },
  {
    name: "Fragrances",
    tagline: "Olfactive Poetry",
    image: "/images/stitch/2d355fff350d.jpg",
    span: "md:col-span-8",
  },
];

const STEPS = [
  { icon: "search_check", label: "Step 01", title: "Discovery", copy: "Intelligent matching with verified supply sources." },
  { icon: "verified", label: "Step 02", title: "Verification", copy: "Strict authentication of batch and origin data." },
  { icon: "inventory_2", label: "Step 03", title: "Curation", copy: "Customized batch selection for your specific needs." },
  { icon: "electric_bolt", label: "Step 04", title: "Dispatch", copy: "Ultra-fast priority logistics to your doorstep." },
  { icon: "stars", label: "Step 05", title: "Success", copy: "Experience the results of premium beauty care." },
];

const TRUST_METRICS = [
  { value: "99.8%", label: "Authenticity Rate" },
  { value: "24hr", label: "Global Dispatch" },
  { value: "450+", label: "Global Partners" },
  { value: "100%", label: "Secured Chain" },
];

const TRUST_BADGES = [
  { icon: "speed", label: "Fastest Delivery", offset: false },
  { icon: "security", label: "Insured Shipments", offset: true },
  { icon: "biotech", label: "Lab Certified", offset: false },
  { icon: "eco", label: "Ethically Sourced", offset: true },
];

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getFeaturedProducts(4);

  return (
    <>
      <Header active="/" />

      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center pt-20 overflow-hidden">
        <Image
          src="/images/stitch/c6743320b764.jpg"
          alt=""
          fill
          priority
          className="object-cover scale-105"
        />
        <div className="relative z-10 w-full max-w-4xl px-5">
          <div className="glass-effect p-12 md:p-16 rounded-xl text-center flex flex-col items-center animate-float">
            <h1 className="font-display text-[40px] md:text-[64px] leading-[1.1] tracking-tight text-on-surface mb-8">
              Premium Beauty. <br />
              <span className="italic font-light">
                Delivered by the Fastest Verified Supplier.
              </span>
            </h1>
            <p className="text-[18px] leading-[1.6] text-on-surface-variant max-w-2xl mb-10">
              Experience the pinnacle of skincare and cosmetic curation. We
              bridge the gap between global luxury brands and discerning
              professionals with unmatched speed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/shop"
                className="reflection-sweep px-10 py-4 bg-primary text-on-primary text-xs font-semibold uppercase tracking-widest hover:scale-105 transition-all duration-300 text-center"
              >
                Shop Now
              </Link>
              <Link
                href="/shop"
                className="glass-effect px-10 py-4 text-xs font-semibold uppercase tracking-widest hover:scale-105 transition-all duration-300 border border-white/50 text-center"
              >
                Buy Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 px-5 lg:px-20 max-w-[1440px] mx-auto">
        <div className="text-center mb-20">
          <h2 className="font-display text-[32px] leading-[1.3] tracking-[0.2em] text-on-surface uppercase mb-4">
            Curated Collections
          </h2>
          <div className="w-24 h-px bg-outline-variant mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.name}
              className={`${cat.span} group relative overflow-hidden h-[450px] rounded-xl glass-effect cursor-pointer`}
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-10 left-10 glass-effect p-6 rounded-lg group-hover:translate-x-2 transition-transform">
                <h3 className="font-display text-[32px] text-on-surface">{cat.name}</h3>
                <p className="text-on-surface-variant">{cat.tagline}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 bg-surface-container-low relative overflow-hidden">
        <div className="px-5 lg:px-20 max-w-[1440px] mx-auto relative z-10">
          <div className="text-center mb-24">
            <h2 className="font-display text-[32px] leading-[1.3] tracking-[0.2em] text-on-surface uppercase mb-4">
              Precision Fulfillment
            </h2>
            <p className="text-[18px] text-on-surface-variant">
              Our seamless 5-step matching ecosystem.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
            {STEPS.map((step) => (
              <div key={step.label} className="flex flex-col items-center text-center">
                <div className="glass-effect-deep w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all hover:scale-110">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    {step.icon}
                  </span>
                </div>
                <span className="text-xs font-semibold tracking-[0.1em] text-primary mb-2">
                  {step.label}
                </span>
                <h4 className="font-display text-[20px] mb-3">{step.title}</h4>
                <p className="text-sm text-on-surface-variant">{step.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="py-12 px-5 lg:px-20 max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="font-display text-[32px] leading-[1.3] tracking-[0.2em] text-on-surface uppercase mb-4">
              Lumière Essentials
            </h2>
            <p className="text-[18px] text-on-surface-variant max-w-lg">
              Hand-selected for performance, purity, and uncompromising luxury.
            </p>
          </div>
          <Link className="text-xs font-semibold tracking-[0.1em] uppercase text-primary flex items-center gap-2 group" href="/shop">
            View All Collection
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </Link>
        </div>
        {products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id} className="group relative">
                <Link href={`/product/${product.slug}`} className="absolute inset-0 z-0" aria-label={product.name} />
                <div className="glass-effect rounded-xl overflow-hidden mb-6 h-[400px] relative pointer-events-none">
                  {product.primaryImageURL && (
                    <Image
                      src={product.primaryImageURL}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <span className="absolute bottom-6 left-6 right-6 py-3 bg-primary/90 text-on-primary text-xs font-semibold uppercase tracking-widest text-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 backdrop-blur-sm">
                    View Product
                  </span>
                  <div className="absolute top-4 right-4 pointer-events-auto">
                    <AddToCartButton
                      variant="icon"
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
                <h4 className="font-display text-[20px] mb-1">{product.name}</h4>
                <p className="text-on-surface-variant font-semibold uppercase tracking-widest text-[10px] mb-2">
                  {(product.productType || "Beauty").toUpperCase()}
                </p>
                <p className="font-semibold price-text">{formatProductPrice(product)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Verified suppliers */}
      <section className="py-12 bg-surface relative">
        <div className="px-5 lg:px-20 max-w-[1440px] mx-auto">
          <div className="glass-effect p-8 md:p-16 rounded-2xl flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="font-display text-[32px] leading-[1.3] tracking-[0.2em] text-on-surface uppercase mb-8">
                Verified Supplier Network
              </h2>
              <p className="text-[18px] text-on-surface-variant mb-10 leading-relaxed">
                We maintain a rigorous auditing process. Every supplier in our
                network is verified for authenticity, ethical sourcing, and
                logistics efficiency.
              </p>
              <div className="grid grid-cols-2 gap-8">
                {TRUST_METRICS.map((metric) => (
                  <div key={metric.label}>
                    <span className="font-display text-[40px] text-primary block mb-2">
                      {metric.value}
                    </span>
                    <p className="text-xs font-semibold tracking-[0.1em] uppercase text-on-surface-variant">
                      {metric.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 grid grid-cols-2 gap-4">
              {TRUST_BADGES.map((badge) => (
                <div
                  key={badge.label}
                  className={`glass-effect-deep p-8 rounded-xl flex flex-col items-center gap-4 hover:bg-white transition-colors cursor-default ${badge.offset ? "translate-y-8" : ""}`}
                >
                  <span className="material-symbols-outlined text-4xl text-primary">
                    {badge.icon}
                  </span>
                  <span className="text-xs font-semibold tracking-[0.1em]">
                    {badge.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative overflow-hidden">
        <div
          className="absolute inset-0 z-0 w-full h-full opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #5d5f5f 0%, transparent 40%), radial-gradient(circle at 80% 50%, #c6c6c7 0%, transparent 40%)",
          }}
        />
        <div className="relative z-10 px-5 lg:px-20 max-w-[1440px] mx-auto text-center">
          <h2 className="font-display text-[40px] md:text-[56px] mb-10 tracking-tight">
            Elevate Your Standard of Beauty.
          </h2>
          <p className="text-[18px] text-on-surface-variant max-w-2xl mx-auto mb-12">
            Join the exclusive circle of professionals and beauty enthusiasts
            who refuse to compromise on quality and speed.
          </p>
          <button className="reflection-sweep px-16 py-6 bg-primary text-on-primary text-xs font-semibold uppercase tracking-[0.2em] hover:scale-105 transition-all duration-300 shadow-xl">
            Start Your Selection
          </button>
        </div>
      </section>

      <Footer />
    </>
  );
}
