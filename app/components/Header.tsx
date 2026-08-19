"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/product", label: "Brands" },
  { href: "/request", label: "Buy" },
] as const;

export default function Header({
  active,
}: {
  active: "/" | "/shop" | "/product" | "/request";
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/60 backdrop-blur-[30px] border-b border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
      <div className="flex justify-between items-center h-20 px-5 lg:px-20 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/stitch/dbfb0daaf0ad.jpg"
              alt="Lumière Beauty"
              width={512}
              height={512}
              className="h-10 w-10 rounded-full object-cover"
              priority
            />
            <span className="font-display text-[22px] tracking-widest text-on-surface uppercase hidden sm:block">
              Lumière
            </span>
          </Link>
          <nav className="hidden lg:flex gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  active === link.href
                    ? "font-semibold text-xs tracking-[0.1em] uppercase text-primary border-b-2 border-primary pb-1"
                    : "font-semibold text-xs tracking-[0.1em] uppercase text-on-surface-variant hover:text-on-surface transition-colors duration-300"
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <HeaderSearch className="hidden lg:flex" />
          <CartLink />
          <button className="hidden sm:inline-flex material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">
            account_circle
          </button>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="lg:hidden material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors"
          >
            {menuOpen ? "close" : "menu"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t border-white/30 bg-white/90 backdrop-blur-xl px-5 py-6 flex flex-col gap-6">
          <HeaderSearch className="flex" />
          <nav className="flex flex-col gap-5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  active === link.href
                    ? "font-semibold text-sm tracking-[0.1em] uppercase text-primary"
                    : "font-semibold text-sm tracking-[0.1em] uppercase text-on-surface-variant"
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

function HeaderSearch({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");

  useEffect(() => {
    const q = value.trim();
    if (!q) return;
    const timeout = setTimeout(() => {
      router.push(`/shop?q=${encodeURIComponent(q)}`);
    }, 300);
    return () => clearTimeout(timeout);
  }, [value, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`${className} items-center glass-effect-deep rounded-full px-4 py-2 border border-white/30 w-full lg:w-auto`}
    >
      <button type="submit" aria-label="Search" className="material-symbols-outlined text-secondary text-[20px]">
        search
      </button>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="bg-transparent border-none focus:ring-0 text-sm w-full lg:w-48 placeholder:text-on-surface-variant"
        placeholder="Search products..."
        type="text"
      />
    </form>
  );
}

function CartLink() {
  const { itemCount } = useCart();
  return (
    <Link href="/cart" className="relative text-on-surface-variant hover:text-primary transition-colors">
      <span className="material-symbols-outlined">shopping_bag</span>
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
          {itemCount > 9 ? "9+" : itemCount}
        </span>
      )}
    </Link>
  );
}
