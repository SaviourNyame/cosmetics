"use client";

import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/format";

export default function CartPage() {
  const { items, subtotal, setQuantity, removeItem } = useCart();

  return (
    <>
      <Header active="/request" />
      <main className="pt-20 min-h-screen">
        <section className="max-w-5xl mx-auto px-5 py-16">
          <h1 className="font-display text-[32px] italic mb-10">Your Cart</h1>

          {items.length === 0 ? (
            <div className="glass-panel rounded-xl p-16 text-center text-on-surface-variant">
              <p className="mb-6">Your cart is empty.</p>
              <Link
                href="/shop"
                className="inline-block bg-on-surface text-white px-8 py-4 rounded-md text-xs font-semibold tracking-widest hover:scale-105 transition-all"
              >
                CONTINUE SHOPPING
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-8 flex flex-col gap-4">
                {items.map((item) => (
                  <div key={item.productId} className="glass-panel rounded-xl p-4 flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-white relative shrink-0">
                      {item.image && <Image src={item.image} alt={item.name} fill className="object-contain p-1" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{item.name}</p>
                      <p className="price-text text-sm">{formatCurrency(item.price, item.currency)}</p>
                    </div>
                    <div className="flex items-center gap-2 glass-effect-deep rounded-full px-2 py-1">
                      <button
                        onClick={() => setQuantity(item.productId, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:text-primary transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <span className="material-symbols-outlined text-sm">remove</span>
                      </button>
                      <span className="w-6 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => setQuantity(item.productId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:text-primary transition-colors"
                        aria-label="Increase quantity"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>
                    <p className="font-display text-lg w-28 text-right shrink-0 price-text">
                      {formatCurrency(item.price * item.quantity, item.currency)}
                    </p>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-on-surface-variant hover:text-primary transition-colors shrink-0"
                      aria-label="Remove item"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-4">
                <div className="glass-panel rounded-xl p-8 sticky top-28">
                  <h2 className="font-display text-xl mb-6">Summary</h2>
                  <div className="flex justify-between mb-4 text-on-surface-variant">
                    <span>Subtotal</span>
                    <span className="font-semibold price-text">{formatCurrency(subtotal)}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mb-8">
                    Delivery fees are confirmed by your supplier during checkout.
                  </p>
                  <Link
                    href="/cart/checkout"
                    className="reflection-sweep block text-center bg-on-surface text-white py-5 rounded-md text-xs font-semibold tracking-widest transition-all hover:scale-[1.02] active:scale-95"
                  >
                    PROCEED TO CHECKOUT
                  </Link>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
