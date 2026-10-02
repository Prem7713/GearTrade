import React from "react";
import prisma from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { Handshake, ShieldCheck, Clock, CheckCircle2, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BargainHubPage() {
  const products = await prisma.product.findMany({
    where: {
      status: "PUBLISHED",
      isSold: false,
      minimumOfferPrice: { not: null },
    },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      brand: true,
      model: true,
      category: true,
      reviews: { select: { rating: true } },
    },
    take: 12,
  });

  const formattedProducts = products.map((p) => {
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
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-orange-950 rounded-3xl text-white p-8 sm:p-12 mb-12 shadow-xl border border-orange-500/20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Handshake className="w-4 h-4" />
              <span>India's 1st Automotive Bargaining Marketplace</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Name Your Price. <br />
              <span className="text-orange-400">Get A Fair Deal.</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
              Every pre-owned part has a unique story. With GearTrade, you aren't stuck with fixed dealership retail markups. Submit your proposed offer, negotiate real-time counter-offers with our parts specialist, and checkout at the agreed discount.
            </p>
          </div>

          {/* Rules / Trust Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-800">
            <div className="flex items-start space-x-3 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Safe Thresholds</p>
                <p className="text-slate-400 mt-0.5">Offers can be submitted up to 50% below listed price.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 text-xs">
              <Clock className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">48-Hour Deal Lock</p>
                <p className="text-slate-400 mt-0.5">Accepted prices are securely reserved for 48 hours to complete checkout.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 text-xs">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">30-Day Testing Warranty</p>
                <p className="text-slate-400 mt-0.5">Even bargained parts retain 100% full testing and fitment warranty.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Eligible Bargain Parts Grid */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Eligible Parts for Price Negotiation
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Click "Make Offer" on any part below to open the real-time bargaining window.
              </p>
            </div>
            <Link
              href="/shop"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
            >
              <span>View All Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {formattedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
