import React from "react";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-xs space-y-6 text-xs text-slate-600 leading-relaxed">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
          <p className="text-slate-400">Effective Date: September 2026 • GearTrade India</p>

          <p>
            GearTrade India Automotive Logistics Ltd. ("GearTrade", "we", "us") values your privacy. This Privacy Policy governs the collection, processing, and storage of customer information when you use our website, negotiate part prices, and purchase automotive components.
          </p>

          <h2 className="text-sm font-bold text-slate-900 mt-4">1. Information We Collect</h2>
          <p>
            We collect personal details (Name, Contact Number, Email Address, and Shipping Destination) necessary to verify compatibility, crate and dispatch auto parts, generate GST invoices, and coordinate courier tracking.
          </p>

          <h2 className="text-sm font-bold text-slate-900 mt-4">2. Payment Security</h2>
          <p>
            We never store credit card CVV codes or NetBanking passwords. All payment transactions are encrypted and processed through RBI-approved Indian payment aggregators (Razorpay) adhering to PCI-DSS standards.
          </p>

          <h2 className="text-sm font-bold text-slate-900 mt-4">3. Contact for Grievances</h2>
          <p>
            Grievance Officer: Amit Sharma, Sector 4, MIDC Chakan Auto Cluster, Pune, Maharashtra 410501. Email: privacy@geartrade.in.
          </p>
        </div>
      </div>
    </div>
  );
}
