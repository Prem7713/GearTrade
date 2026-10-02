"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Tag,
  Truck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, subtotal, totalCount } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError(null);

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || "Invalid coupon");
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon(data.coupon);
        setCouponError(null);
      }
    } catch {
      setCouponError("Could not validate coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const shippingFee = taxableSubtotal > 5000 || taxableSubtotal === 0 ? 0 : 250;
  const taxAmount = Math.round(taxableSubtotal * 0.18);
  const finalTotal = taxableSubtotal + shippingFee + taxAmount;

  const freeShippingThreshold = 5000;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - taxableSubtotal);

  if (items.length === 0) {
    return (
      <div className="bg-slate-50 min-h-screen py-20 flex items-center justify-center">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 max-w-md text-center shadow-xs">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Your Cart is Empty</h1>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            You don't have any used or refurbished auto parts in your cart yet. Browse our catalog or make an offer on eligible parts.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/shop"
              className="py-3.5 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition"
            >
              Browse Auto Parts Catalog
            </Link>
            <Link
              href="/bargain"
              className="py-3 px-6 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition"
            >
              Explore Bargain Hub
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Shopping Cart ({totalCount} {totalCount === 1 ? "Part" : "Parts"})
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Verify your part compatibility and condition before proceeding to secure checkout.
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700"
          >
            Clear Entire Cart
          </button>
        </div>

        {/* Free shipping progress notice */}
        {remainingForFreeShipping > 0 ? (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-8 flex items-center space-x-3 text-xs text-orange-900">
            <Truck className="w-5 h-5 text-orange-600 shrink-0" />
            <span>
              Add <strong className="font-bold text-orange-700">{formatPrice(remainingForFreeShipping)}</strong> more to unlock <strong className="font-bold">Free Pan-India Surface Cargo Shipping!</strong>
            </span>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-8 flex items-center space-x-3 text-xs text-emerald-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              You have qualified for <strong className="font-bold text-emerald-800">FREE Pan-India Surface Shipping</strong> on this order!
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Items Table */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
              <div className="divide-y divide-slate-100">
                {items.map((item) => (
                  <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-5">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 rounded-2xl object-cover border border-slate-200 bg-slate-50 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[11px] font-mono text-slate-400">SKU: {item.sku}</p>
                          <Link href={`/products/${item.slug}`}>
                            <h3 className="text-sm font-bold text-slate-900 hover:text-orange-600 transition line-clamp-2">
                              {item.name}
                            </h3>
                          </Link>
                          <p className="text-xs text-slate-500 mt-1">
                            Compatibility: {item.vehicleCompatibility}
                          </p>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {item.condition}
                        </span>
                        {item.checkoutToken && (
                          <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
                            Bargained Price Locked
                          </span>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-baseline space-x-2">
                          <span className="text-lg font-black text-slate-900">
                            {formatPrice(item.price)}
                          </span>
                          {item.originalPrice > item.price && (
                            <span className="text-xs text-slate-400 line-through">
                              {formatPrice(item.originalPrice)}
                            </span>
                          )}
                        </div>

                        <span className="text-xs text-slate-500 font-medium">
                          Qty: 1 {item.stock === 1 && "(Unique unit in stock)"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Warranty reminder badge */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 flex items-center justify-between shadow-md">
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-6 h-6 text-orange-500 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-sm">30-Day Testing & Compatibility Warranty Included</p>
                  <p className="text-slate-400 mt-0.5">
                    If this part does not match your chassis or fails functional testing, return within 7 days for a 100% refund.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Order Summary & Coupon box */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
              <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                Order Summary
              </h2>

              {/* Coupon Form */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Have a Promo / Coupon Code?
                </label>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. WELCOME500"
                    className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono font-bold uppercase text-slate-900 outline-hidden focus:border-orange-500"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </form>

                {couponError && (
                  <p className="text-xs text-rose-600 mt-1.5 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{couponError}</span>
                  </p>
                )}

                {appliedCoupon && (
                  <div className="mt-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg p-2 text-xs flex items-center justify-between">
                    <span className="font-bold">Code "{appliedCoupon.code}" Applied!</span>
                    <span>-{formatPrice(appliedCoupon.discountAmount)}</span>
                  </div>
                )}
              </div>

              {/* Calculation list */}
              <div className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Parts Subtotal</span>
                  <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Pan-India Surface Shipping</span>
                  <span>{shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : formatPrice(shippingFee)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Goods & Services Tax (GST 18%)</span>
                  <span className="font-semibold text-slate-900">{formatPrice(taxAmount)}</span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline text-base font-black text-slate-900">
                  <span>Final Total</span>
                  <span className="text-2xl text-orange-600">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={() => router.push("/checkout")}
                className="w-full py-4 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm shadow-md transition transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
              >
                <span>Proceed to Multi-Step Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center">
                <Link
                  href="/shop"
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                >
                  ← Continue Shopping for Parts
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
