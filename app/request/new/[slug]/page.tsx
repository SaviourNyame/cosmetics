import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { getProductBySlug } from "@/lib/actions/storefront";
import { formatProductPrice } from "@/lib/format";
import RequestForm from "./RequestForm";

export const dynamic = "force-dynamic";

export default async function NewRequestPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <>
      <Header active="/request" />
      <main className="pt-20 min-h-screen">
        <section className="max-w-5xl mx-auto px-5 py-16 grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <div className="glass-panel rounded-xl p-6 flex gap-4 items-center">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-white relative shrink-0">
                {product.primaryImageURL && (
                  <Image src={product.primaryImageURL} alt={product.name} fill className="object-contain p-1" />
                )}
              </div>
              <div>
                <p className="text-xs font-semibold tracking-[0.1em] text-primary uppercase mb-1">
                  Buying
                </p>
                <h2 className="font-display text-xl text-on-surface">{product.name}</h2>
                <p className="price-text text-sm mt-1">{formatProductPrice(product)}</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-7">
            <h1 className="font-display text-[32px] italic mb-2">Your Details</h1>
            <p className="text-on-surface-variant mb-10">
              Tell us how many you'd like and where to reach you — we'll match you with the fastest
              available verified supplier.
            </p>
            <RequestForm productId={product.id} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
