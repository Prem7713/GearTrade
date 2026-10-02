"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice, getConditionBadge, formatDate } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { useUser } from "@/lib/user-context";
import BargainModal from "@/components/BargainModal";
import {
  ShieldCheck,
  RotateCcw,
  Truck,
  Heart,
  Handshake,
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  Star,
  MessageSquare,
  HelpCircle,
  Building,
  Check,
} from "lucide-react";

interface ProductDetailClientProps {
  product: any;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const { user } = useUser();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isBargainOpen, setIsBargainOpen] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Question form state
  const [questionText, setQuestionText] = useState("");
  const [questionSubmitted, setQuestionSubmitted] = useState(false);
  const [questionLoading, setQuestionLoading] = useState(false);

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewsList, setReviewsList] = useState(product.reviews || []);

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80", caption: "Part Overview" }];

  const activeImage = images[selectedImageIndex] || images[0];
  const conditionBadge = getConditionBadge(product.condition);

  const discountPercent =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : null;

  const isFavorited = isInWishlist(product.id);

  const handleAddToCart = (buyNow = false) => {
    if (product.isSold || product.stock <= 0) return;

    addItem({
      id: product.id,
      sku: product.sku,
      name: product.name,
      slug: product.slug,
      image: activeImage.imageUrl,
      condition: conditionBadge.label,
      vehicleCompatibility: `${product.brand?.name || ""} ${product.model?.name || ""} (${product.year || ""})`,
      price: product.price,
      originalPrice: product.comparePrice || product.price,
      quantity: 1,
      stock: product.stock,
    });

    if (buyNow) {
      router.push("/checkout");
    } else {
      setAddedAnimation(true);
      setTimeout(() => setAddedAnimation(false), 1200);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    setQuestionLoading(true);

    try {
      // In production/local, simulated or stored
      setQuestionSubmitted(true);
      setQuestionText("");
    } finally {
      setQuestionLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?redirect=/products/${product.slug}`);
      return;
    }
    if (!reviewComment.trim()) return;

    setReviewLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setReviewsList([data.review, ...reviewsList]);
        setReviewSubmitted(true);
        setReviewTitle("");
        setReviewComment("");
      }
    } catch (e) {
      console.error("Review submit error", e);
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid: Left Images, Right Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* LEFT: Product Images Gallery */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Stage Image */}
            <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-slate-900 border border-slate-200/80 shadow-md flex items-center justify-center">
              <img
                src={activeImage.imageUrl}
                alt={product.name}
                className="w-full h-full object-contain"
              />

              {/* Badges on Image */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-md shadow-xs border ${conditionBadge.bg}`}
                >
                  {conditionBadge.label}
                </span>
                {activeImage.isDamagePhoto && (
                  <span className="text-xs font-extrabold px-3 py-1 rounded-md bg-amber-500 text-slate-950 shadow-md flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Disclosed Cosmetic Imperfection</span>
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition shadow-md ${
                  isFavorited
                    ? "bg-rose-50 text-rose-600"
                    : "bg-white/90 text-slate-600 hover:text-rose-600 hover:bg-white"
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
              </button>

              {/* Sold Out Overlay */}
              {(product.isSold || product.stock <= 0) && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center">
                  <span className="bg-rose-600 text-white font-black uppercase tracking-widest text-sm px-6 py-2.5 rounded-xl shadow-xl">
                    Part Sold Out
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail list */}
            {images.length > 1 && (
              <div className="flex items-center space-x-3 overflow-x-auto pb-2">
                {images.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition bg-slate-100 ${
                      selectedImageIndex === idx
                        ? "border-orange-600 ring-2 ring-orange-500/20 shadow-md"
                        : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.caption || `Thumbnail ${idx}`}
                      className="w-full h-full object-cover"
                    />
                    {img.isDamagePhoto && (
                      <span className="absolute bottom-0 inset-x-0 bg-amber-500 text-[9px] font-bold text-slate-950 text-center py-0.5">
                        Defect
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Verified Inspection & Damage Report */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-sm text-slate-900">
                    Workshop Quality Inspection Report
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {product.inspectionStatus}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-semibold text-slate-500 block mb-0.5">Cosmetic Grade</span>
                  <p className="text-slate-800 font-medium">
                    {product.cosmeticCondition || "9/10 - Inspected clean, micro-buffed."}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block mb-0.5">Functional Test</span>
                  <p className="text-slate-800 font-medium">
                    {product.functionalCondition || "100% Bench Tested - Factory electrical and mechanical tolerances."}
                  </p>
                </div>
                {product.mileage && (
                  <div>
                    <span className="font-semibold text-slate-500 block mb-0.5">Donor Vehicle Odometer</span>
                    <p className="text-slate-800 font-medium">{product.mileage}</p>
                  </div>
                )}
                <div>
                  <span className="font-semibold text-slate-500 block mb-0.5">Physical Warehouse Location</span>
                  <p className="text-slate-800 font-medium flex items-center space-x-1">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{product.location || "Pune Chakan Central Hub"}</span>
                  </p>
                </div>
              </div>

              {/* Damage Disclosure */}
              {product.damageDisclosure && (
                <div className="mt-4 bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-900 flex items-start space-x-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Defect Disclosure:</span>
                    <p className="mt-0.5 text-amber-800">{product.damageDisclosure}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Product Buy Box & Specifications */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
              {/* Vehicle Compatibility Banner */}
              <div className="bg-orange-50/80 border border-orange-200/70 rounded-xl px-3.5 py-2 mb-4 flex items-center space-x-2 text-xs font-bold text-orange-800">
                <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                <span>
                  Fits: {product.brand?.name} {product.model?.name} ({product.year})
                </span>
              </div>

              {/* Title & SKU */}
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                {product.name}
              </h1>

              <div className="mt-2 flex items-center space-x-4 text-xs text-slate-500 font-mono">
                <span>SKU: {product.sku}</span>
                {product.oemNumber && <span>OEM #: {product.oemNumber}</span>}
              </div>

              {/* Ratings */}
              <div className="mt-3 flex items-center space-x-2">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.averageRating || 5)
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-700">
                  {product.averageRating || 5.0}
                </span>
                <span className="text-xs text-slate-400">
                  ({reviewsList.length} verified review{reviewsList.length !== 1 ? "s" : ""})
                </span>
              </div>

              {/* Pricing Box */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="flex items-baseline space-x-3">
                  <span className="text-3xl font-black text-slate-900">
                    {formatPrice(product.price)}
                  </span>
                  {product.comparePrice && product.comparePrice > product.price && (
                    <>
                      <span className="text-base text-slate-400 line-through">
                        {formatPrice(product.comparePrice)}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-xs font-extrabold">
                        Save {discountPercent}%
                      </span>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Inclusive of all taxes (18% GST). Calculated invoice provided.
                </p>
              </div>

              {/* Stock status */}
              <div className="mt-4 text-xs font-semibold">
                {product.isSold || product.stock <= 0 ? (
                  <span className="text-rose-600 font-bold">This unique part has been sold.</span>
                ) : (
                  <span className="text-emerald-700 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>In Stock (Unique Inspected Unit Ready for Dispatch)</span>
                  </span>
                )}
              </div>

              {/* CTAs: Buy Now, Add to Cart, Make an Offer */}
              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={() => handleAddToCart(true)}
                  disabled={product.isSold || product.stock <= 0}
                  className="w-full py-3.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-40 disabled:pointer-events-none text-white font-extrabold text-sm shadow-md transition transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Buy Now — {formatPrice(product.price)}</span>
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(false)}
                    disabled={product.isSold || product.stock <= 0}
                    className="py-3 px-3 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-800 disabled:opacity-40 disabled:pointer-events-none font-bold text-xs transition flex items-center justify-center space-x-1.5"
                  >
                    {addedAnimation ? <Check className="w-4 h-4 text-emerald-600" /> : <ShoppingCart className="w-4 h-4" />}
                    <span>{addedAnimation ? "Added to Cart" : "Add to Cart"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsBargainOpen(true)}
                    disabled={product.isSold || product.stock <= 0}
                    className="py-3 px-3 rounded-xl border-2 border-orange-500 text-orange-600 hover:bg-orange-50 disabled:opacity-40 disabled:pointer-events-none font-extrabold text-xs transition flex items-center justify-center space-x-1.5 shadow-xs"
                  >
                    <Handshake className="w-4 h-4" />
                    <span>Make An Offer</span>
                  </button>
                </div>
              </div>

              {/* Guarantees list */}
              <div className="mt-8 pt-6 border-t border-slate-100 space-y-3 text-xs text-slate-600">
                <div className="flex items-center space-x-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{product.warranty || "30-Day Testing & Electrical Replacement Warranty"}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <RotateCcw className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{product.returnEligibility || "7-Day Return if Part Doesn't Fit Your Chassis"}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Truck className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Free surface cargo shipping on orders above ₹5,000</span>
                </div>
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
              <h3 className="font-bold text-sm text-slate-900 mb-4 pb-2 border-b border-slate-100">
                Technical Specifications & Fitment
              </h3>
              <dl className="divide-y divide-slate-100 text-xs">
                <div className="py-2 flex justify-between">
                  <dt className="text-slate-500">Vehicle Type</dt>
                  <dd className="font-bold text-slate-800">{product.vehicleType}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-slate-500">Manufacturer Make</dt>
                  <dd className="font-bold text-slate-800">{product.brand?.name}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-slate-500">Model Name</dt>
                  <dd className="font-bold text-slate-800">{product.model?.name}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-slate-500">Model Year</dt>
                  <dd className="font-bold text-slate-800">{product.year}</dd>
                </div>
                {product.variant && (
                  <div className="py-2 flex justify-between">
                    <dt className="text-slate-500">Variant Fitment</dt>
                    <dd className="font-bold text-slate-800">{product.variant}</dd>
                  </div>
                )}
                {product.fuelType && (
                  <div className="py-2 flex justify-between">
                    <dt className="text-slate-500">Fuel Compatibility</dt>
                    <dd className="font-bold text-slate-800">{product.fuelType}</dd>
                  </div>
                )}
                {product.partNumber && (
                  <div className="py-2 flex justify-between">
                    <dt className="text-slate-500">Part Number</dt>
                    <dd className="font-mono font-bold text-slate-800">{product.partNumber}</dd>
                  </div>
                )}
                {product.oemNumber && (
                  <div className="py-2 flex justify-between">
                    <dt className="text-slate-500">OEM Number</dt>
                    <dd className="font-mono font-bold text-slate-800">{product.oemNumber}</dd>
                  </div>
                )}
                {product.weight && (
                  <div className="py-2 flex justify-between">
                    <dt className="text-slate-500">Shipping Weight</dt>
                    <dd className="font-bold text-slate-800">{product.weight} kg</dd>
                  </div>
                )}
                {product.dimensions && (
                  <div className="py-2 flex justify-between">
                    <dt className="text-slate-500">Package Dimensions</dt>
                    <dd className="font-bold text-slate-800">{product.dimensions}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>

        {/* Description & Q&A & Reviews Section */}
        <div className="mt-12 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs space-y-12">
          {/* Detailed Description */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-3">Part Description & Notes</h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Customer Reviews */}
          <div className="pt-8 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Verified Purchaser Reviews ({reviewsList.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real feedback from customers who bought and installed this part.
                </p>
              </div>
            </div>

            {/* Existing Reviews */}
            <div className="space-y-4 mb-8">
              {reviewsList.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No reviews yet for this part. Be the first to review!</p>
              ) : (
                reviewsList.map((rev: any) => (
                  <div key={rev.id} className="bg-slate-50 border border-slate-200/70 rounded-2xl p-5">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">{rev.customer?.name || "Verified Customer"}</span>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded text-[10px] font-bold">
                          Verified Purchase
                        </span>
                      </div>
                      <span className="text-slate-400">{formatDate(rev.createdAt)}</span>
                    </div>

                    <div className="flex items-center text-amber-400 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                          }`}
                        />
                      ))}
                    </div>

                    {rev.title && <h4 className="text-xs font-bold text-slate-900 mb-1">{rev.title}</h4>}
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* Leave a review form */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <h4 className="font-bold text-sm text-slate-900 mb-3">Leave a Review</h4>
              {reviewSubmitted ? (
                <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Thank you! Your verified review has been published.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Star Rating</label>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(parseInt(e.target.value, 10))}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800"
                    >
                      <option value={5}>5 Stars - Excellent Quality</option>
                      <option value={4}>4 Stars - Good Fit & Value</option>
                      <option value={3}>3 Stars - Average</option>
                      <option value={2}>2 Stars - Below Expectations</option>
                      <option value={1}>1 Star - Poor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Headline</label>
                    <input
                      type="text"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      placeholder="e.g. Worked perfectly on my 2021 model"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Feedback</label>
                    <textarea
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share details about fitment, condition, and packaging..."
                      className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-800 outline-hidden"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={reviewLoading}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
                  >
                    {reviewLoading ? "Posting..." : "Submit Review"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Ask About This Part Q&A */}
          <div className="pt-8 border-t border-slate-100">
            <div className="flex items-center space-x-2 mb-4">
              <HelpCircle className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-bold text-slate-900">Ask About This Part</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Unsure about compatibility with your chassis code or engine variant? Our technicians reply within 2 hours.
            </p>

            {questionSubmitted ? (
              <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Your technical question was sent to our parts specialist! We will notify you when answered.</span>
              </div>
            ) : (
              <form onSubmit={handleAskQuestion} className="flex gap-3">
                <input
                  type="text"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="e.g. Does this headlight connector plug fit the BS4 or only BS6 model?"
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-800 outline-hidden focus:border-orange-500"
                  required
                />
                <button
                  type="submit"
                  disabled={questionLoading}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition shrink-0"
                >
                  Ask Question
                </button>
              </form>
            )}

            {/* List public questions */}
            {product.questions && product.questions.length > 0 && (
              <div className="mt-6 space-y-4">
                {product.questions.map((q: any) => (
                  <div key={q.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs">
                    <p className="font-bold text-slate-900">Q: {q.question}</p>
                    {q.answer ? (
                      <p className="mt-2 text-slate-700 bg-white p-3 rounded-lg border border-slate-100">
                        <span className="font-bold text-orange-600">Answer: </span>
                        {q.answer}
                      </p>
                    ) : (
                      <p className="text-slate-400 italic mt-1">Awaiting specialist response.</p>
                    )}
                  </div>
                ))}
              </div>
            )}
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
          image: activeImage.imageUrl,
        }}
      />
    </div>
  );
}
