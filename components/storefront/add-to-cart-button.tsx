"use client";

import { toast } from "sonner";
import { useCart } from "@/lib/cart-context";

export interface CartableProduct {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  currency: string;
}

interface AddToCartButtonProps {
  product: CartableProduct;
  className?: string;
  variant?: "icon" | "full";
}

export function AddToCartButton({ product, className, variant = "full" }: AddToCartButtonProps) {
  const { items, addItem } = useCart();
  const inCart = items.some((i) => i.productId === product.productId);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    toast.success(`${product.name} added to cart`);
  }

  const baseClass =
    variant === "icon"
      ? "w-10 h-10 glass-panel rounded-full flex items-center justify-center hover:scale-110 transition-all"
      : "w-16 h-16 glass-panel rounded-md flex items-center justify-center hover:scale-105 transition-all text-on-surface";

  return (
    <button
      onClick={handleClick}
      aria-label={inCart ? "Added to cart — add another" : "Add to cart"}
      aria-pressed={inCart}
      className={className ?? baseClass}
    >
      <span
        className={`material-symbols-outlined ${variant === "icon" ? "text-sm" : ""}`}
        style={inCart ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        {inCart ? "check" : "add_shopping_cart"}
      </span>
    </button>
  );
}
