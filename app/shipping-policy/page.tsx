import React from "react";
import { Truck, ShieldCheck, Box, Clock } from "lucide-react";

export default function ShippingPolicyPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-xs space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Shipping & Delivery Policy
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Last updated: September 2026 • Surface Cargo & Pan-India Logistics
            </p>
          </div>

          <div className="space-y-6 text-xs text-slate-600 leading-relaxed">
            <section>
              <h2 className="text-sm font-bold text-slate-900 mb-2">1. Delivery Network & Coverage</h2>
              <p>
                GearTrade partners with premier Indian surface logistics providers (Blue Dart Surface, Delhivery Surface, and GATI-KWE) to deliver heavy and medium automotive parts across all 19,000+ serviceable PIN codes in India.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-slate-900 mb-2">2. Processing & Dispatch Timeline</h2>
              <p>
                Once an order is confirmed or a negotiated offer is accepted and paid, the item undergoes pre-dispatch inspection within 24 hours. Orders are dispatched from our Pune Central Hub, Delhi NCR Hub, or Chennai Bay within 1-2 business days.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-slate-900 mb-2">3. Wooden Crate & Heavy Packaging</h2>
              <p>
                Fragile items (headlight projector assemblies, glass mirrors, digital instrument clusters) and heavy powertrain assemblies (gearboxes, turbos, engines) are secured in custom foam-lined wooden crating to eliminate courier transit damages.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-slate-900 mb-2">4. Shipping Charges & Free Threshold</h2>
              <p>
                Orders with a cart value of ₹5,000 and above qualify for <strong>FREE Pan-India Surface Freight</strong>. For orders under ₹5,000, a standardized packaging and surface cargo fee of ₹250 applies regardless of state.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-slate-900 mb-2">5. Live Shipment Tracking</h2>
              <p>
                As soon as the courier scans the package at our sorting depot, an SMS and email containing the AWB Air Waybill tracking number and direct tracking URL is dispatched to the customer.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
