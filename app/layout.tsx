import type { Metadata } from "next";
import { Poppins, Manrope } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/lib/cart-context";
import "./globals.css";

const playfair = Poppins({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  style: ["normal"],
});

const inter = Manrope({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lumière Beauty | Premium Luxury Cosmetics Marketplace",
  description:
    "Experience the pinnacle of skincare and cosmetic curation — bridging global luxury brands and discerning professionals through a verified supplier network.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="font-sans antialiased overflow-x-hidden">
        <CartProvider>{children}</CartProvider>
        <Toaster />
      </body>
    </html>
  );
}
