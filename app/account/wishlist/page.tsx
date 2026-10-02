import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import ProductCard from "@/components/ProductCard";
import { Heart } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerWishlistPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const wishlistItems = await prisma.wishlist.findMany({
    where: { customerId: user.id },
    include: {
      product: {
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          brand: true,
          model: true,
          category: true,
          reviews: { select: { rating: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const products = wishlistItems.map((w) => {
    const p = w.product;
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
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
      <div className="pb-6 border-b border-slate-100 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Saved Wishlist ({products.length})</h1>
          <p className="text-xs text-slate-500 mt-1">
            Parts you've saved for future builds or price tracking.
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="py-16 text-center text-xs">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Your wishlist is empty</h3>
          <p className="text-slate-400 mt-1">Click the heart icon on any part card to save it here.</p>
          <Link
            href="/shop"
            className="mt-4 inline-block px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
