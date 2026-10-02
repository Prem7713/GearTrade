"use client";

import React, { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Contact GearTrade Support Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Speak to our mechanical specialists about vehicle compatibility, custom sourcing, or dispatch status.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Warehouse and Contact Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <h2 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
                Central Warehouses & Dismantling Hubs
              </h2>

              <div className="space-y-4 text-xs">
                <div className="flex items-start space-x-3 text-slate-700">
                  <MapPin className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 font-bold">Pune Central Hub (Maharashtra)</strong>
                    <p className="text-slate-500 mt-0.5">
                      Plot 14, Sector 4, MIDC Industrial Area, Chakan Auto Cluster, Pune, Maharashtra 410501
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-slate-700">
                  <MapPin className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 font-bold">Delhi NCR Depot (Haryana)</strong>
                    <p className="text-slate-500 mt-0.5">
                      B-44, Phase 2, Udyog Vihar, Gurugram, Haryana 122016
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-slate-700">
                  <Phone className="w-5 h-5 text-orange-600 shrink-0" />
                  <div>
                    <strong className="block text-slate-900 font-bold">Toll-Free Support Line</strong>
                    <span className="text-slate-600 font-medium">+91 8000 123 456 (9:30 AM - 7:00 PM IST)</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-slate-700">
                  <Mail className="w-5 h-5 text-orange-600 shrink-0" />
                  <div>
                    <strong className="block text-slate-900 font-bold">Direct Email</strong>
                    <span className="text-slate-600">support@geartrade.in / deals@geartrade.in</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
                GSTIN: 27AABCT8521P1Z4 • CIN: U50400PN2026PTC198421
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 mb-1">Send Us a Direct Message</h2>
              <p className="text-xs text-slate-500 mb-6">
                Our parts technicians respond to technical inquiries within 2 hours.
              </p>

              {submitted ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-6 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h3 className="font-bold text-base">Message Sent Successfully!</h3>
                  <p className="text-xs text-emerald-700">
                    A representative from our Pune or Delhi hub will call or email you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Rajesh Kumar"
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-hidden focus:border-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="rajesh@example.com"
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-hidden focus:border-orange-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-hidden focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Subject / Vehicle Make</label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. Sourcing Creta 2021 AC Condenser"
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-hidden focus:border-orange-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Message</label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Specify part numbers, chassis/VIN, or specific questions..."
                      className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-hidden focus:border-orange-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition flex items-center space-x-2"
                  >
                    <span>Send Message to Specialists</span>
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
