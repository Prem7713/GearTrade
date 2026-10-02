import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import VehicleSelector from "@/components/VehicleSelector";
import ProductCard from "@/components/ProductCard";
import { formatPrice } from "@/lib/utils";
import {
  Car,
  Bike,
  ShieldCheck,
  Handshake,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Search,
  RotateCcw,
  Zap,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredProducts, categories, latestBargains, stats] = await Promise.all([
    prisma.product.findMany({
      where: { status: "PUBLISHED" },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        brand: true,
        model: true,
        category: true,
        reviews: { select: { rating: true } },
      },
      take: 8,
      orderBy: { isFeatured: "desc" },
    }),
    prisma.category.findMany({
      take: 8,
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { products: true } },
      },
    }),
    prisma.offer.findMany({
      where: { status: "ACCEPTED" },
      include: {
        product: { select: { name: true, price: true, sku: true } },
      },
      take: 3,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.product.count({ where: { status: "PUBLISHED" } }),
  ]);

  const formattedProducts = featuredProducts.map((p) => {
    const avgRating =
      p.reviews.length > 0
        ? p.reviews.reduce((acc, r) => acc + r.rating, 0) / p.reviews.length
        : 5.0;

    return {
      ...p,
      averageRating: Number(avgRating.toFixed(1)),
      reviewCount: p.reviews.length,
    };
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative bg-slate-950 text-white overflow-hidden py-16 sm:py-24 border-b border-slate-800">
        {/* Subtle grid background and glowing accents */}
        <div className="absolute inset-0 bg-[radial-gradient(#ea580c_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* Pill Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>India's 1st Used Auto Parts Bargain Platform</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Quality Used Auto Parts. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">
                Better Prices. Your Deal.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mt-5 text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl">
              Find genuine used, refurbished and affordable car & bike parts — thoroughly inspected with verified test reports and full damage disclosure. Make your own bargain offer and save up to 70% off OEM prices.
            </p>

            {/* Hero CTAs */}
            <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
              <Link
                href="/cars"
                className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-lg shadow-orange-600/30 transition transform hover:-translate-y-0.5"
              >
                <Car className="w-4 h-4" />
                <span>Shop Car Parts</span>
              </Link>
              <Link
                href="/bikes"
                className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm shadow-md transition transform hover:-translate-y-0.5"
              >
                <Bike className="w-4 h-4 text-orange-400" />
                <span>Shop Bike Parts</span>
              </Link>
              <Link
                href="/bargain"
                className="flex items-center space-x-2 px-5 py-3.5 rounded-xl border border-orange-500/50 hover:bg-orange-500/10 text-orange-400 font-bold text-sm transition"
              >
                <Handshake className="w-4 h-4" />
                <span>Make an Offer</span>
              </Link>
            </div>

            {/* Metrics pills */}
            <div className="mt-10 grid grid-cols-3 gap-4 pt-8 border-t border-slate-800/80 max-w-lg text-left">
              <div>
                <p className="text-xl sm:text-2xl font-black text-white">100%</p>
                <p className="text-xs text-slate-400 mt-0.5">Tested & Verified</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-orange-400">30 Days</p>
                <p className="text-xs text-slate-400 mt-0.5">Testing Warranty</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-white">Up to 70%</p>
                <p className="text-xs text-slate-400 mt-0.5">Below New MRP</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VEHICLE COMPATIBILITY SELECTOR WIDGET */}
      <section className="relative -mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-30">
        <VehicleSelector />
      </section>

      {/* 3. RECENT BARGAINS TICKER */}
      {latestBargains.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="bg-gradient-to-r from-orange-950/20 via-slate-900 to-orange-950/20 border border-orange-500/20 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-xs shrink-0">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="font-extrabold uppercase tracking-wider text-orange-400">
                Live Deals Accepted Today:
              </span>
            </div>

            <div className="flex-1 flex flex-wrap items-center gap-3 justify-center md:justify-start text-xs text-slate-300">
              {latestBargains.map((deal) => {
                const savings = deal.originalPrice - deal.currentOffer;
                const percent = Math.round((savings / deal.originalPrice) * 100);
                return (
                  <div
                    key={deal.id}
                    className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-1.5 flex items-center space-x-2"
                  >
                    <span className="font-medium text-white line-clamp-1 max-w-[200px]">
                      {deal.product.name}
                    </span>
                    <span className="text-slate-400 line-through text-[11px]">
                      {formatPrice(deal.originalPrice)}
                    </span>
                    <span className="font-bold text-orange-400">{formatPrice(deal.currentOffer)}</span>
                    <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-bold">
                      Saved {percent}%
                    </span>
                  </div>
                );
              })}
            </div>

            <Link
              href="/bargain"
              className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center space-x-1 shrink-0"
            >
              <span>How it works</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      )}

      {/* 4. FEATURED PRODUCTS CATALOG */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-orange-600 mb-1">
              <Zap className="w-4 h-4" />
              <span>Tested & Ready to Dispatch</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Featured Used & Refurbished Parts
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Every part inspected for fitment, tested for functional readiness, and covered by our 30-day warranty.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/cars"
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              Cars Only
            </Link>
            <Link
              href="/bikes"
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              Bikes Only
            </Link>
            <Link
              href="/shop"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center space-x-1.5"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {formattedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. EXPLORE CATEGORIES */}
      <section className="bg-slate-100/70 border-y border-slate-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Browse by Part Category
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              From complete transmissions and engine assemblies to precision electronics, headlights, and body panels.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-orange-500/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                    {cat.vehicleType === "BIKE" ? (
                      <Bike className="w-6 h-6" />
                    ) : (
                      <Car className="w-6 h-6" />
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-orange-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {cat.vehicleType === "BOTH"
                      ? "Cars & Motorcycles"
                      : cat.vehicleType === "CAR"
                      ? "Automobile Parts"
                      : "Motorcycle Parts"}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>{cat._count.products} parts available</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-orange-600 transition" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. HOW BARGAINING / THE OFFER SYSTEM WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-slate-900 rounded-3xl text-white p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Handshake className="w-3.5 h-3.5" />
              <span>Pioneering Automotive Negotiation</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Don't Pay Fixed Retail. <br />
              <span className="text-orange-400">Make Your Own Offer.</span>
            </h2>
            <p className="mt-4 text-sm text-slate-300 leading-relaxed">
              Every automotive repair is unique. Unlike rigid e-commerce sites, GearTrade lets you submit your proposed price on eligible parts. Our certified auto parts specialists review your offer in real-time.
            </p>
          </div>

          {/* 4 Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 relative z-10">
            <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-6">
              <span className="text-3xl font-black text-orange-500">01</span>
              <h4 className="font-bold text-base text-white mt-2">Find Your Part</h4>
              <p className="text-xs text-slate-400 mt-1">
                Filter by your vehicle make, model, year, and inspect condition photos and OEM numbers.
              </p>
            </div>

            <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-6">
              <span className="text-3xl font-black text-orange-500">02</span>
              <h4 className="font-bold text-base text-white mt-2">Click "Make an Offer"</h4>
              <p className="text-xs text-slate-400 mt-1">
                Enter your desired purchase price and an optional note to our warehouse specialist.
              </p>
            </div>

            <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-6">
              <span className="text-3xl font-black text-orange-500">03</span>
              <h4 className="font-bold text-base text-white mt-2">Real-Time Negotiation</h4>
              <p className="text-xs text-slate-400 mt-1">
                Chat message-style: our team can accept instantly or propose a mutually agreeable counter-offer.
              </p>
            </div>

            <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-6">
              <span className="text-3xl font-black text-orange-500">04</span>
              <h4 className="font-bold text-base text-white mt-2">Locked Price Checkout</h4>
              <p className="text-xs text-slate-400 mt-1">
                Once deal is accepted, checkout unlocks at the negotiated rate with 30-day testing warranty.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-4 relative z-10">
            <Link
              href="/bargain"
              className="px-6 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition"
            >
              Explore Active Bargains
            </Link>
            <Link
              href="/shop"
              className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition"
            >
              Find a Part to Offer On
            </Link>
          </div>
        </div>
      </section>

      {/* 7. VERIFIED CUSTOMER REVIEWS */}
      <section className="bg-white py-16 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                Verified Indian Motorists & Workshops
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Real Experiences from Real Garages
              </h2>
            </div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Verified Purchases</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6">
              <div className="flex items-center space-x-1 text-amber-400 mb-3">
                {"★★★★★".split("").map((s, i) => (
                  <span key={i} className="text-base">
                    {s}
                  </span>
                ))}
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                "Saved ₹23,000 on my 2020 Swift gearbox!"
              </h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                "Authorized service center quoted ₹42,000 for a new gearbox after bearing failure. Ordered refurbished K12 unit from GearTrade for ₹14,500. Drove 4,000 km since installation and shifts are completely factory smooth."
              </p>
              <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Rajesh Kumar</span>
                <span className="text-slate-400">Andheri West, Mumbai</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6">
              <div className="flex items-center space-x-1 text-amber-400 mb-3">
                {"★★★★★".split("").map((s, i) => (
                  <span key={i} className="text-base">
                    {s}
                  </span>
                ))}
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                "Pristine Creta LED Headlamp with Mobis OEM Stamp"
              </h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                "I was skeptical about buying used headlights online due to moisture or buffing swirl risks. The part arrived in custom wooden crate packaging with original Mobis holographic sticker intact. Bargained down to ₹6,800. Amazing service!"
              </p>
              <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Vikram Singh</span>
                <span className="text-slate-400">Gurugram, Haryana</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6">
              <div className="flex items-center space-x-1 text-amber-400 mb-3">
                {"★★★★★".split("").map((s, i) => (
                  <span key={i} className="text-base">
                    {s}
                  </span>
                ))}
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                "Authentic Royal Enfield Chrome Silencer"
              </h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                "Got an OEM takeoff exhaust for my Classic 350 for just ₹3,800. Mirror chrome finish was 10/10 with zero scratches. The heavy thump is 100% factory original without police challan worries."
              </p>
              <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Arun Pillai</span>
                <span className="text-slate-400">Bengaluru, Karnataka</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
