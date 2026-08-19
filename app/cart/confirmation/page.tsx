import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { getProductRequestById } from "@/lib/actions/customer-requests";

export const dynamic = "force-dynamic";

export default async function CartConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids } = await searchParams;
  const requestIds = ids ? ids.split(",").filter(Boolean) : [];
  const requests = (
    await Promise.all(requestIds.map((id) => getProductRequestById(id)))
  ).filter((r) => r !== null);

  return (
    <>
      <Header active="/request" />
      <main className="pt-20 min-h-screen">
        <section className="max-w-3xl mx-auto px-5 py-16 text-center">
          <span className="material-symbols-outlined text-primary text-5xl mb-6 inline-block">check_circle</span>
          <h1 className="font-display text-[32px] italic mb-4">Order Placed</h1>
          <p className="text-on-surface-variant mb-12">
            We've sent your order{requests.length > 1 ? "s" : ""} to the fastest available verified
            supplier{requests.length > 1 ? "s" : ""}. Track progress on each item below.
          </p>

          {requests.length === 0 ? (
            <div className="glass-panel rounded-xl p-16 text-on-surface-variant">
              We couldn't find those orders — check your link and try again.
            </div>
          ) : (
            <div className="flex flex-col gap-4 text-left">
              {requests.map((request) => (
                <Link
                  key={request!.id}
                  href={`/request/${request!.id}`}
                  className="glass-panel rounded-xl p-6 flex items-center justify-between hover:scale-[1.01] transition-all"
                >
                  <div>
                    <p className="font-semibold">{request!.productSnapshot.name}</p>
                    <p className="text-on-surface-variant text-sm">
                      Qty {request!.quantity} &middot; REF #{request!.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                </Link>
              ))}
            </div>
          )}

          <Link
            href="/shop"
            className="inline-block mt-12 bg-on-surface text-white px-8 py-4 rounded-md text-xs font-semibold tracking-widest hover:scale-105 transition-all"
          >
            CONTINUE SHOPPING
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
