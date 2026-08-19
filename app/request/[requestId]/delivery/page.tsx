import { notFound, redirect } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { getProductRequestById } from "@/lib/actions/customer-requests";
import DeliveryForm from "./DeliveryForm";

export const dynamic = "force-dynamic";

export default async function ChooseDeliveryPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;
  const request = await getProductRequestById(requestId);
  if (!request) notFound();
  if (request.preferredDeliveryMethod) redirect(`/request/${requestId}`);

  return (
    <>
      <Header active="/request" />
      <main className="pt-20 min-h-screen">
        <section className="max-w-4xl mx-auto px-5 py-16">
          <div className="mb-12">
            <p className="text-xs font-semibold tracking-[0.1em] text-primary uppercase mb-2">
              {request.productSnapshot.name} &middot; Qty {request.quantity}
            </p>
            <h1 className="font-display text-[32px] italic mb-2">Choose Delivery</h1>
            <p className="text-on-surface-variant">
              How would you like to receive this once a supplier confirms your order?
            </p>
          </div>
          <DeliveryForm requestId={requestId} />
        </section>
      </main>
      <Footer />
    </>
  );
}
