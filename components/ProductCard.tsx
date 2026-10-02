"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatPrice, getConditionBadge } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import BargainModal from "@/components/BargainModal";
import { Heart, ShieldCheck, Handshake, ShoppingCart, Star } from "lucide-react";

export interface ProductCardProps {
  product: {
    id: string;
    sku: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number | null;
    condition: string;
    conditionRating?: string;
    inspectionStatus?: string;
    stock: number;
    isSold?: boolean;
    vehicleType?: string;
    brand?: { name: string };
    model?: { name: string };
    year?: number;
    averageRating?: number;
    reviewCount?: number;
    images?: { imageUrl: string; isDamagePhoto?: boolean }[];
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isBargainOpen, setIsBargainOpen] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const mainImage =
    product.images && product.images.length > 0
      ? product.images[0].imageUrl
      : "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80";

  const conditionBadge = getConditionBadge(product.condition);

  const discountPercent =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.isSold || product.stock <= 0) return;

    addItem({
      id: product.id,
      sku: product.sku,
      name: product.name,
      slug: product.slug,
      image: mainImage,
      condition: conditionBadge.label,
      vehicleCompatibility: `${product.brand?.name || ""} ${product.model?.name || ""} (${product.year || ""})`,
      price: product.price,
      originalPrice: product.comparePrice || product.price,
      quantity: 1,
      stock: product.stock,
    });

    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const handleOpenBargain = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBargainOpen(true);
  };

  const isFavorited = isInWishlist(product.id);

  return (
    <>
      <div className="group relative bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between">
        {/* Top Badges & Image Header */}
        <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
          <Link href={`/products/${product.slug}`} className="block w-full h-full">
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
            />
          </Link>

          {/* Condition Badge */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs border ${conditionBadge.bg}`}
            >
              {conditionBadge.label}
            </span>
            {discountPercent && (
              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-rose-600 text-white shadow-xs w-max">
                -{discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Wishlist Toggle Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition shadow-xs ${
              isFavorited
                ? "bg-rose-50 text-rose-600"
                : "bg-white/80 text-slate-500 hover:text-rose-600 hover:bg-white"
            }`}
            aria-label="Add to wishlist"
          >
            <Heart className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
          </button>

          {/* Sold Overlay */}
          {(product.isSold || product.stock <= 0) && (
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center">
              <span className="bg-rose-600 text-white font-extrabold uppercase tracking-wider text-xs px-3 py-1.5 rounded-md shadow-lg">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            {/* Compatibility info */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1 font-medium">
              <span className="truncate">
                {product.brand?.name} {product.model?.name} {product.year && `• ${product.year}`}
              </span>
              <span className="font-mono text-slate-400 shrink-0">{product.sku.slice(-6)}</span>
            </div>

            {/* Product Title */}
            <Link href={`/products/${product.slug}`} className="block">
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
                {product.name}
              </h3>
            </Link>

            {/* Quality & Ratings */}
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center space-x-1 text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-slate-700">
                  {product.averageRating || 5.0}
                </span>
                <span className="text-slate-400 text-[11px]">
                  ({product.reviewCount || 1})
                </span>
              </div>
              <div className="flex items-center space-x-1 text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Tested</span>
              </div>
            </div>
          </div>

          {/* Pricing & Action Buttons */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-baseline space-x-2">
              <span className="text-lg font-black text-slate-900">
                {formatPrice(product.price)}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-xs text-slate-400 line-through">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
            </div>

            {/* Dual CTAs: Make an Offer & Buy Now */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleOpenBargain}
                disabled={product.isSold || product.stock <= 0}
                className="flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-xl border border-orange-500 text-orange-600 hover:bg-orange-50 disabled:opacity-40 disabled:pointer-events-none text-xs font-bold transition shadow-xs"
                title="Bargain price on this part"
              >
                <Handshake className="w-3.5 h-3.5" />
                <span>Make Offer</span>
              </button>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.isSold || product.stock <= 0}
                className={`flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-xl text-white text-xs font-bold transition shadow-xs disabled:opacity-40 disabled:pointer-events-none ${
                  addedAnimation
                    ? "bg-emerald-600"
                    : "bg-slate-900 hover:bg-slate-800"
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>{addedAnimation ? "Added!" : "Buy Now"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bargain Modal */}
      <BargainModal
        isOpen={isBargainOpen}
        onClose={() => setIsBargainOpen(false)}
        product={{
          id: product.id,
          name: product.name,
          sku: product.sku,
          price: product.price,
          comparePrice: product.comparePrice,
          image: mainImage,
        }}
      />
    </>
  );
}
