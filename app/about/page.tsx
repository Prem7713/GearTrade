import React from "react";
import { Wrench, ShieldCheck, Handshake, Recycle, Award, Truck } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
            Our Mission & Heritage
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-4">
            Democratizing Genuine Auto Parts Across India
          </h1>
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            GearTrade was founded to eliminate exorbitant dealership replacement costs through certified salvage, comprehensive bench testing, and transparent bargaining.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Rigorous Testing</h3>
            <p className="text-xs text-slate-500 mt-2">
              Every mechanical component, wiring harness, and headlight is bench-tested by certified automotive technicians.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Recycle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Circular Sustainability</h3>
            <p className="text-xs text-slate-500 mt-2">
              We repurpose authentic OEM components from insurance salvage, reducing landfill waste and metal refining emissions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Handshake className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Fair Bargaining</h3>
            <p className="text-xs text-slate-500 mt-2">
              Our unique live bargaining algorithm allows motorists to negotiate real-time counter-offers with specialists.
            </p>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Our Inspection & Logistics Network</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
            With centralized dismantling hubs in Pune (Chakan Auto Cluster), Delhi NCR, and Chennai, GearTrade maintains an inventory of over 10,000 tested unique automotive components. Each part is cataloged with its donor vehicle VIN, mileage, compression ratios, and micro-buffed for crystal optical clarity.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800 text-center">
            <div>
              <p className="text-2xl font-black text-orange-400">10,000+</p>
              <p className="text-xs text-slate-400">Tested Used Parts</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">19,000+</p>
              <p className="text-xs text-slate-400">Pincodes Covered</p>
            </div>
            <div>
              <p className="text-2xl font-black text-orange-400">30 Days</p>
              <p className="text-xs text-slate-400">Testing Warranty</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">₹4.2 Cr+</p>
              <p className="text-xs text-slate-400">Customer Savings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
