"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useUser } from "@/lib/user-context";
import { formatPrice } from "@/lib/utils";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Truck,
  CreditCard,
  QrCode,
  Banknote,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useUser();
  const { items, subtotal, clearCart } = useCart();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Customer Contact State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Shipping Address State
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Maharashtra");
  const [pincode, setPincode] = useState("");
  const [addressType, setAddressType] = useState<"HOME" | "OFFICE" | "WORKSHOP">("HOME");

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "CARD" | "NETBANKING" | "COD">("UPI");
  const [upiVpa, setUpiVpa] = useState("");

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);

  // Auto-fill logged in user info
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  // Load saved addresses if available
  useEffect(() => {
    async function loadAddresses() {
      if (!user) return;
      try {
        const res = await fetch("/api/account/addresses");
        if (res.ok) {
          const data = await res.json();
          if (data.addresses && data.addresses.length > 0) {
            const def = data.addresses[0];
            setAddressLine(def.addressLine);
            setCity(def.city);
            setState(def.state);
            setPincode(def.pincode);
          }
        }
      } catch (e) {
        console.error("Failed to load user addresses", e);
      }
    }
    loadAddresses();
  }, [user]);

  if (items.length === 0) {
    return (
      <div className="bg-slate-50 min-h-screen py-20 flex items-center justify-center">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-md text-center shadow-xs">
          <h2 className="text-xl font-bold text-slate-900">Your cart is empty</h2>
          <p className="text-xs text-slate-500 mt-1">Please select auto parts before checking out.</p>
          <button
            onClick={() => router.push("/shop")}
            className="mt-6 px-6 py-3 rounded-xl bg-orange-600 text-white font-bold text-xs"
          >
            Go to Catalog
          </button>
        </div>
      </div>
    );
  }

  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const shippingFee = taxableSubtotal > 5000 ? 0 : 250;
  const taxAmount = Math.round(taxableSubtotal * 0.18);
  const finalTotal = taxableSubtotal + shippingFee + taxAmount;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const orderPayload = {
        customerName: name.trim(),
        customerEmail: email.trim().toLowerCase(),
        customerPhone: phone.trim(),
        shippingAddress: {
          name,
          phone,
          addressLine,
          city,
          state,
          pincode,
          type: addressType,
        },
        paymentMethod,
        couponCode: couponCode || null,
        items: items.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
          checkoutToken: i.checkoutToken || null,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to place order.");
        setLoading(false);
      } else {
        clearCart();
        router.push(`/checkout/success/${data.order.id}`);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during checkout.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Express Secure Checkout
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Encrypted 256-bit checkout • Official Indian GST Invoicing
            </p>
          </div>
          <div className="flex items-center space-x-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure 256-Bit SSL</span>
          </div>
        </div>

        {/* Steps Progress Indicator */}
        <div className="mb-8 grid grid-cols-4 gap-2 sm:gap-4 text-center">
          <div
            className={`pb-2 border-b-2 font-bold text-xs ${
              step >= 1 ? "border-orange-600 text-orange-600" : "border-slate-200 text-slate-400"
            }`}
          >
            1. Contact
          </div>
          <div
            className={`pb-2 border-b-2 font-bold text-xs ${
              step >= 2 ? "border-orange-600 text-orange-600" : "border-slate-200 text-slate-400"
            }`}
          >
            2. Address
          </div>
          <div
            className={`pb-2 border-b-2 font-bold text-xs ${
              step >= 3 ? "border-orange-600 text-orange-600" : "border-slate-200 text-slate-400"
            }`}
          >
            3. Summary
          </div>
          <div
            className={`pb-2 border-b-2 font-bold text-xs ${
              step >= 4 ? "border-orange-600 text-orange-600" : "border-slate-200 text-slate-400"
            }`}
          >
            4. Payment
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start space-x-3 text-xs text-rose-800">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Checkout Issue</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Steps Form Area */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            {/* STEP 1: Customer Contact */}
            {step === 1 && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Customer Information</h2>
                <p className="text-xs text-slate-500 mb-6">
                  Where should we email your GST tax invoice and delivery tracking links?
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rajesh Kumar"
                      className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-hidden focus:border-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. rajesh.kumar@gmail.com"
                      className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-hidden focus:border-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Number (for Courier SMS alerts) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-hidden focus:border-orange-500"
                      required
                    />
                  </div>

                  <div className="pt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!name || !email || !phone) {
                          setError("Please fill in your name, email, and phone number.");
                          return;
                        }
                        setError(null);
                        setStep(2);
                      }}
                      className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition flex items-center space-x-2"
                    >
                      <span>Continue to Shipping Address</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Shipping Address */}
            {step === 2 && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Delivery Address</h2>
                <p className="text-xs text-slate-500 mb-6">
                  Surface cargo crating requires a complete street address and valid pincode.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Address (Flat, Building, Street, Area) <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      placeholder="e.g. Flat 402, Sea Breeze Heights, Link Road, Andheri West"
                      className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-hidden focus:border-orange-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        City <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Mumbai"
                        className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-hidden focus:border-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        State <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="e.g. Maharashtra"
                        className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-hidden focus:border-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        PIN Code <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="e.g. 400053"
                        maxLength={6}
                        className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-hidden focus:border-orange-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Address Type
                    </label>
                    <div className="flex gap-3 text-xs">
                      {(["HOME", "OFFICE", "WORKSHOP"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setAddressType(t)}
                          className={`py-2 px-4 rounded-xl border font-bold transition ${
                            addressType === t
                              ? "bg-slate-900 text-white border-slate-900"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!addressLine || !city || !state || !pincode) {
                          setError("Please complete all address fields including PIN code.");
                          return;
                        }
                        setError(null);
                        setStep(3);
                      }}
                      className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition flex items-center space-x-2"
                    >
                      <span>Review Order Summary</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Order Review */}
            {step === 3 && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Review Your Order</h2>
                <p className="text-xs text-slate-500 mb-6">
                  Please verify parts, condition ratings, and shipping destination before choosing payment.
                </p>

                <div className="divide-y divide-slate-100 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900 line-clamp-1">{item.name}</p>
                          <span className="text-[11px] text-slate-400">
                            {item.vehicleCompatibility} • {item.condition}
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900">{formatPrice(item.price)}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1 mb-6">
                  <p className="font-bold text-slate-900">Ship To:</p>
                  <p className="text-slate-600">{name} ({phone})</p>
                  <p className="text-slate-600">{addressLine}, {city}, {state} - {pincode}</p>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    ← Edit Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition flex items-center space-x-2"
                  >
                    <span>Proceed to Indian Payment Modes</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Payment Gateway Options */}
            {step === 4 && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Select Payment Method</h2>
                <p className="text-xs text-slate-500 mb-6">
                  Choose your preferred Indian payment gateway mode. All transactions are SSL encrypted.
                </p>

                <div className="space-y-3 mb-6">
                  {/* UPI */}
                  <label
                    className={`block p-4 rounded-2xl border cursor-pointer transition ${
                      paymentMethod === "UPI"
                        ? "border-orange-500 bg-orange-50/40 ring-1 ring-orange-500/20"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === "UPI"}
                          onChange={() => setPaymentMethod("UPI")}
                          className="text-orange-600 focus:ring-orange-500"
                        />
                        <div className="flex items-center space-x-2 font-bold text-xs text-slate-900">
                          <QrCode className="w-4 h-4 text-orange-600" />
                          <span>UPI (Google Pay, PhonePe, Paytm, BHIM)</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        Fastest & Zero Fee
                      </span>
                    </div>

                    {paymentMethod === "UPI" && (
                      <div className="mt-3 pt-3 border-t border-orange-200/60">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Enter UPI ID / VPA
                        </label>
                        <input
                          type="text"
                          value={upiVpa}
                          onChange={(e) => setUpiVpa(e.target.value)}
                          placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                          className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-hidden"
                        />
                      </div>
                    )}
                  </label>

                  {/* Cards */}
                  <label
                    className={`block p-4 rounded-2xl border cursor-pointer transition ${
                      paymentMethod === "CARD"
                        ? "border-orange-500 bg-orange-50/40 ring-1 ring-orange-500/20"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === "CARD"}
                          onChange={() => setPaymentMethod("CARD")}
                          className="text-orange-600 focus:ring-orange-500"
                        />
                        <div className="flex items-center space-x-2 font-bold text-xs text-slate-900">
                          <CreditCard className="w-4 h-4 text-orange-600" />
                          <span>Credit / Debit Card (RuPay, Visa, Mastercard)</span>
                        </div>
                      </div>
                    </div>
                  </label>

                  {/* NetBanking */}
                  <label
                    className={`block p-4 rounded-2xl border cursor-pointer transition ${
                      paymentMethod === "NETBANKING"
                        ? "border-orange-500 bg-orange-50/40 ring-1 ring-orange-500/20"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "NETBANKING"}
                        onChange={() => setPaymentMethod("NETBANKING")}
                        className="text-orange-600 focus:ring-orange-500"
                      />
                      <span className="font-bold text-xs text-slate-900">
                        Net Banking (SBI, HDFC, ICICI, Axis, Kotak)
                      </span>
                    </div>
                  </label>

                  {/* COD */}
                  <label
                    className={`block p-4 rounded-2xl border cursor-pointer transition ${
                      paymentMethod === "COD"
                        ? "border-orange-500 bg-orange-50/40 ring-1 ring-orange-500/20"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === "COD"}
                          onChange={() => setPaymentMethod("COD")}
                          className="text-orange-600 focus:ring-orange-500"
                        />
                        <div className="flex items-center space-x-2 font-bold text-xs text-slate-900">
                          <Banknote className="w-4 h-4 text-orange-600" />
                          <span>Cash on Delivery (Pay upon arrival)</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500">Max ₹10,000</span>
                    </div>
                  </label>
                </div>

                <div className="pt-6 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    ← Review Summary
                  </button>

                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="px-8 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-extrabold text-sm shadow-md transition flex items-center space-x-2"
                  >
                    {loading ? (
                      <span>Securing Your Parts...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Confirm & Place Order ({formatPrice(finalTotal)})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Summary Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 pb-3 border-b border-slate-100">
                Summary Breakdown
              </h3>

              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Parts Subtotal</span>
                  <span className="font-bold text-slate-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Surface Logistics</span>
                  <span>{shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : formatPrice(shippingFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span className="font-semibold text-slate-900">{formatPrice(taxAmount)}</span>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline text-base font-black text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-xl text-orange-600">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
                <p className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>30-Day Testing Replacement Warranty</span>
                </p>
                <p className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Safe Pan-India Wooden Crate Transit</span>
                </p>
                <p className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Verified GST Invoice Supplied</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
