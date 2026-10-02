import React from "react";
import { HelpCircle, ChevronDown } from "lucide-react";

export default function FAQPage() {
  const faqs = [
    {
      q: "How does the 'Make an Offer' / Bargaining system work?",
      a: "Every eligible used part features a 'Make an Offer' button. You can propose your desired purchase price (up to 50% below list price). Our certified parts specialists review your offer in real-time and can accept immediately or reply with a counter-offer. Once an agreement is reached, your price is locked for 48 hours to complete checkout.",
    },
    {
      q: "How do I know if a used part will fit my vehicle?",
      a: "Each part page features our Compatibility Checker detailing exact vehicle make, model, chassis generations, and variant fitment. We also list original OEM and manufacturer part numbers. If you're unsure, you can click 'Ask About This Part' to consult our technicians before purchasing.",
    },
    {
      q: "Are the used parts tested before dispatch?",
      a: "Yes. 100% of functional components (ECUs, alternators, starter motors, turbochargers, AC compressors, and headlamps) undergo bench testing on specialized diagnostic rigs. Mechanical items are pressure-tested and checked for play or gear whine before receiving an inspection certification.",
    },
    {
      q: "What warranty do you provide on pre-owned auto parts?",
      a: "All electrical and mechanical components are backed by a complimentary 30-Day Testing Replacement Warranty. Additionally, we provide a 7-Day Fitment Guarantee: if the part is incompatible with your vehicle, you can return it for a complete refund.",
    },
    {
      q: "How are heavy parts like engines, gearboxes, and bumpers shipped?",
      a: "We ship heavy and fragile components via dedicated surface cargo networks (Blue Dart Surface, Delhivery Surface). Body panels and transmissions are enclosed in custom foam-lined wooden crating to prevent transit damage across India.",
    },
    {
      q: "Are prices inclusive of GST?",
      a: "Yes, all listed prices and agreed bargain prices include 18% GST. You will receive an official tax invoice with our GSTIN (27AABCT8521P1Z4) that can be used for business tax input credit.",
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 mx-auto flex items-center justify-center mb-4">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Answers to common questions regarding compatibility, testing, surface freight, and bargaining.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs"
            >
              <h3 className="font-bold text-sm text-slate-900">{faq.q}</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
