"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { useUser } from "@/lib/user-context";
import { X, Handshake, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

interface BargainModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    sku: string;
    price: number;
    comparePrice?: number | null;
    image?: string;
  };
}

export default function BargainModal({ isOpen, onClose, product }: BargainModalProps) {
  const router = useRouter();
  const { user } = useUser();
  const [offerAmount, setOfferAmount] = useState<string>("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOffer, setSuccessOffer] = useState<any | null>(null);

  if (!isOpen) return null;

  const numericOffer = parseFloat(offerAmount) || 0;
  const discountAmount = product.price - numericOffer;
  const discountPercent =
    numericOffer > 0 && numericOffer < product.price
      ? Math.round((discountAmount / product.price) * 100)
      : 0;

  const minAcceptable = Math.round(product.price * 0.5);

  const applyPreset = (percent: number) => {
    const discounted = Math.round(product.price * (1 - percent / 100));
    setOfferAmount(String(discounted));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?redirect=/products/${product.id}`);
      return;
    }

    if (!numericOffer || numericOffer <= 0) {
      setError("Please enter a valid offer amount in Rupees.");
      return;
    }

    if (numericOffer < minAcceptable) {
      setError(`Minimum acceptable bargain offer is ₹${minAcceptable.toLocaleString("en-IN")} (50% of list price).`);
      return;
    }

    if (numericOffer >= product.price) {
      setError("Offer must be lower than listed price. If you agree with current price, please use 'Buy Now'.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          offerAmount: numericOffer,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit offer");
      } else {
        setSuccessOffer(data.offer);
      }
    } catch {
      setError("Network error while submitting offer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />

        <div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all border border-slate-100 p-6 sm:p-8">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {successOffer ? (
            /* Success State */
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {successOffer.status === "ACCEPTED" ? "Offer Instantly Accepted! 🎉" : "Offer Submitted Successfully!"}
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                {successOffer.status === "ACCEPTED"
                  ? `Your offer of ${formatPrice(successOffer.currentOffer)} was accepted! The price has been locked for your checkout.`
                  : `Your offer of ${formatPrice(successOffer.currentOffer)} has been sent to our auto parts specialist.`}
              </p>

              <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4 text-left">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Offer Reference</span>
                  <span className="font-mono font-bold text-slate-800">{successOffer.offerNumber}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-slate-800">
                  <span>Your Offered Price</span>
                  <span className="text-orange-600 text-base">{formatPrice(successOffer.currentOffer)}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    onClose();
                    router.push(`/account/offers/${successOffer.id}`);
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm shadow-md transition"
                >
                  <span>Open Negotiation Room</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="py-3 px-4 border border-slate-300 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-50 transition"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            /* Offer Form */
            <form onSubmit={handleSubmit}>
              <div className="flex items-center space-x-2 text-orange-600 font-bold text-xs uppercase tracking-wider mb-2">
                <Handshake className="w-4 h-4" />
                <span>Fair Deal Negotiation</span>
              </div>

              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Make an Offer on this Part
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Name your price. Our auto parts team responds with counter-offers or instant acceptance.
              </p>

              {/* Product preview */}
              <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center space-x-3">
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-14 h-14 rounded-lg object-cover border border-slate-200"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-900 line-clamp-1">{product.name}</p>
                  <p className="text-[11px] font-mono text-slate-500">SKU: {product.sku}</p>
                  <div className="mt-1 flex items-baseline space-x-2">
                    <span className="text-xs text-slate-500">Listed Price:</span>
                    <span className="text-sm font-bold text-slate-900">{formatPrice(product.price)}</span>
                  </div>
                </div>
              </div>

              {/* Price presets */}
              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Quick Offer Suggestions
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset(10)}
                    className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:border-orange-500 hover:text-orange-600 transition bg-white"
                  >
                    10% Off ({formatPrice(Math.round(product.price * 0.9))})
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset(15)}
                    className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:border-orange-500 hover:text-orange-600 transition bg-white"
                  >
                    15% Off ({formatPrice(Math.round(product.price * 0.85))})
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset(25)}
                    className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:border-orange-500 hover:text-orange-600 transition bg-white"
                  >
                    25% Off ({formatPrice(Math.round(product.price * 0.75))})
                  </button>
                </div>
              </div>

              {/* Offer Amount Input */}
              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Your Offer Amount (₹ INR) <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 font-bold text-slate-500">
                    ₹
                  </div>
                  <input
                    type="number"
                    value={offerAmount}
                    onChange={(e) => {
                      setOfferAmount(e.target.value);
                      setError(null);
                    }}
                    placeholder={`e.g. ${Math.round(product.price * 0.85)}`}
                    className="w-full rounded-xl border border-slate-300 pl-8 pr-4 py-3 text-base font-bold text-slate-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-hidden"
                    required
                  />
                </div>

                {numericOffer > 0 && numericOffer < product.price && (
                  <p className="mt-1 text-xs text-emerald-700 font-medium">
                    You save {formatPrice(discountAmount)} ({discountPercent}% discount)
                  </p>
                )}
              </div>

              {/* Message to Specialist */}
              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Optional Note / Reason
                </label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Replacing broken lamp on my 2021 model; ready to purchase immediately."
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-hidden"
                />
              </div>

              {error && (
                <div className="mt-3 bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start space-x-2 text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {!user && (
                <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                  You will be prompted to login/register so you can track counter-offers.
                </p>
              )}

              <div className="mt-6 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center space-x-2"
                >
                  {loading ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <span>Submit Offer</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
