import React from "react";

export default function TermsPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-xs space-y-6 text-xs text-slate-600 leading-relaxed">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Terms & Conditions</h1>
          <p className="text-slate-400">Effective Date: September 2026 • GearTrade India</p>

          <h2 className="text-sm font-bold text-slate-900 mt-4">1. Scope of Marketplace Services</h2>
          <p>
            GearTrade operates an automotive salvage and refurbished marketplace connecting motorists, mechanics, and workshops with tested OEM pre-owned parts. All parts are described transparently with disclosed defects and inspection statuses.
          </p>

          <h2 className="text-sm font-bold text-slate-900 mt-4">2. Bargain / Make an Offer Rules</h2>
          <p>
            Submitted offers are subject to specialist acceptance or counter-offers. An accepted offer creates a 48-hour locked pricing token for the buyer. After 48 hours without checkout, the reservation expires and the part returns to general catalog availability.
          </p>

          <h2 className="text-sm font-bold text-slate-900 mt-4">3. Governing Law</h2>
          <p>
            These terms are governed by the laws of India. Any disputes are subject to the exclusive jurisdiction of the courts of Pune, Maharashtra.
          </p>
        </div>
      </div>
    </div>
  );
}
