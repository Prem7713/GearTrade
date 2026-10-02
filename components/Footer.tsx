"use client";

import React from "react";
import Link from "next/link";
import {
  Wrench,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  MapPin,
  Mail,
  Phone,
  Handshake,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 mt-auto border-t border-slate-800 text-xs">
      {/* Trust Features Bar */}
      <div className="border-b border-slate-850 bg-slate-900/60 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0 border border-orange-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Verified & Bench Tested</h4>
              <p className="text-slate-400 text-xs mt-0.5">
                Every alternator, headlight, gearbox & ECU is tested by auto technicians before cataloging.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/20">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Transparent Bargaining</h4>
              <p className="text-slate-400 text-xs mt-0.5">
                Make your offer directly on used parts. Negotiate real-time counter-offers with specialists.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">7-Day Fitment Guarantee</h4>
              <p className="text-slate-400 text-xs mt-0.5">
                30-day testing warranty plus 7 days compatibility return if the part doesn't fit your chassis.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 border border-purple-500/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Safe Surface Logistics</h4>
              <p className="text-slate-400 text-xs mt-0.5">
                Secure wooden crating & heavy cargo shipping across 19,000+ Indian postal pincodes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand & Warehouse details */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-orange-500 border border-slate-700">
                <Wrench className="w-4 h-4 -rotate-45" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                GEAR<span className="text-orange-500">TRADE</span>
              </span>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              India's premier marketplace for genuine used, OEM salvage, and refurbished car & motorcycle spare parts. Backed by verified testing, damage disclosures, and fair-deal bargaining.
            </p>

            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-start space-x-2 text-slate-300">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <span>Sector 4, MIDC Industrial Area, Chakan Auto Hub, Pune, Maharashtra 410501</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                <span>support@geartrade.in</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <Phone className="w-4 h-4 text-orange-500 shrink-0" />
                <span>+91 8000 123 456 (Mon - Sat, 9:30 AM - 7:00 PM IST)</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] font-mono text-slate-400">
              GSTIN: <span className="text-slate-300">27AABCT8521P1Z4</span> • Reg. Indian Automotive Salvage Partner
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">
              Explore Parts
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/shop" className="hover:text-white transition">All Auto Parts</Link>
              </li>
              <li>
                <Link href="/cars" className="hover:text-white transition">Car Spare Parts</Link>
              </li>
              <li>
                <Link href="/bikes" className="hover:text-white transition">Motorcycle / Bike Parts</Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-white transition">Category Directory</Link>
              </li>
              <li>
                <Link href="/bargain" className="text-orange-400 hover:text-orange-300 font-bold transition">
                  Make an Offer / Bargain Hub
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Vehicles */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">
              Popular Vehicles
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/shop?brand=Hyundai&model=Creta" className="hover:text-white transition">Hyundai Creta</Link>
              </li>
              <li>
                <Link href="/shop?brand=Maruti+Suzuki&model=Swift" className="hover:text-white transition">Maruti Swift</Link>
              </li>
              <li>
                <Link href="/shop?brand=Mahindra&model=Thar" className="hover:text-white transition">Mahindra Thar</Link>
              </li>
              <li>
                <Link href="/shop?brand=Tata+Motors&model=Nexon" className="hover:text-white transition">Tata Nexon</Link>
              </li>
              <li>
                <Link href="/shop?brand=Royal+Enfield&model=Classic+350" className="hover:text-white transition">Royal Enfield Classic 350</Link>
              </li>
              <li>
                <Link href="/shop?brand=Yamaha&model=YZF-R15+V4" className="hover:text-white transition">Yamaha R15 V4</Link>
              </li>
            </ul>
          </div>

          {/* Customer Policies & Help */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">
              Policies & Support
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/shipping-policy" className="hover:text-white transition">Shipping & Delivery Policy</Link>
              </li>
              <li>
                <Link href="/return-policy" className="hover:text-white transition">Returns & Fitment Guarantee</Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">Terms & Conditions</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition">Frequently Asked Questions</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">Help & Support Desk</Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-slate-400 hover:text-slate-400 text-[11px] transition">
                  Staff / Admin Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright and payment icons */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p className="text-slate-400">
            © {new Date().getFullYear()} GearTrade India Ltd. All rights reserved. Registered trademark.
          </p>

          <div className="flex items-center space-x-3 text-slate-400">
            <span className="font-semibold text-slate-400">Payment Modes Accepted:</span>
            <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-white font-mono text-[10px]">
              UPI
            </span>
            <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-white font-mono text-[10px]">
              RuPay
            </span>
            <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-white font-mono text-[10px]">
              Cards
            </span>
            <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-white font-mono text-[10px]">
              NetBanking
            </span>
            <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-white font-mono text-[10px]">
              COD
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
