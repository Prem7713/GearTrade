import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "@/lib/user-context";
import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "GearTrade India | Buy Verified Used Car & Bike Parts | Make an Offer",
  description:
    "India's #1 verified used auto spare parts marketplace. Find tested OEM car & bike parts and make your own bargain offer. 30-day testing warranty & pan-India delivery.",
  keywords: [
    "used car parts India",
    "bike spare parts",
    "second hand auto parts",
    "salvage parts",
    "used creta headlight",
    "swift gearbox used",
    "classic 350 exhaust",
    "bargain auto parts",
    "refurbished car engine",
  ],
  openGraph: {
    title: "GearTrade India | Quality Used Auto Parts. Better Prices. Your Deal.",
    description: "Browse genuine tested used car & bike parts. Negotiate prices with our auto parts specialists.",
    siteName: "GearTrade India",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <UserProvider>
          <CartProvider>
            <WishlistProvider>
              <AppShell>{children}</AppShell>
            </WishlistProvider>
          </CartProvider>
        </UserProvider>
      </body>
    </html>
  );
}
