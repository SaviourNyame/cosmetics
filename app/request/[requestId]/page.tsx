import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { getProductRequestById } from "@/lib/actions/customer-requests";
import { getProductById } from "@/lib/actions/storefront";
import RequestProgress from "../RequestProgress";

export const dynamic = "force-dynamic";

export default async function RequestStatusPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;
  const request = await getProductRequestById(requestId);
  if (!request) notFound();
  if (!request.preferredDeliveryMethod) redirect(`/request/${requestId}/delivery`);

  const product = await getProductById(request.productId);

  return (
    <>
      <Header active="/request" />
      <main className="pt-20 flex flex-col lg:flex-row relative min-h-screen">
        <div className="absolute inset-0 z-0 network-grid opacity-40" />

        {/* Order summary sidebar */}
        <aside className="hidden lg:flex flex-col w-[400px] z-10 p-12 border-r border-outline-variant/20 bg-white/40 backdrop-blur-xl m-8 rounded-xl shadow-2xl">
          <div className="mb-12">
            <h2 className="font-display text-[32px] mb-4">Order Summary</h2>
            <p className="text-xs font-semibold text-on-surface-variant tracking-wider">
              REF: #{request.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <div className="space-y-4 flex-grow">
            <div className="glass-panel p-4 rounded-lg flex items-center gap-4">
              <div className="w-16 h-16 rounded bg-surface-container-high overflow-hidden relative shrink-0">
                {product?.primaryImageURL && (
                  <Image src={product.primaryImageURL} alt={request.productSnapshot.name} fill className="object-contain p-1" />
                )}
              </div>
              <div>
                <p className="font-semibold">{request.productSnapshot.name}</p>
                <p className="text-on-surface-variant text-sm">Qty: {request.quantity}</p>
              </div>
            </div>
          </div>
          <div className="pt-12 border-t border-outline-variant/30">
            <div className="flex justify-between mb-2">
              <span className="text-on-surface-variant">Delivery Method</span>
              <span className="font-semibold">
                {request.preferredDeliveryMethod
                  .split("_")
                  .map((w) => w[0].toUpperCase() + w.slice(1))
                  .join(" ")}
              </span>
            </div>
            {request.deliveryLocation && (
              <div className="flex justify-between mt-2">
                <span className="text-on-surface-variant">Location</span>
                <span className="font-semibold text-right">{request.deliveryLocation}</span>
              </div>
            )}
          </div>
        </aside>

        {/* Central progress widget */}
        <section className="flex-grow flex flex-col items-center justify-center z-10 p-5 py-16">
          <RequestProgress status={request.status} eligibleSupplierCount={request.eligibleSupplierIds.length} />
        </section>
      </main>
      <Footer />
    </>
  );
}
