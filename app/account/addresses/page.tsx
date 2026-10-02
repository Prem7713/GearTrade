"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Plus, CheckCircle2, Home, Building2, Wrench } from "lucide-react";

export default function CustomerAddressesPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Maharashtra");
  const [pincode, setPincode] = useState("");
  const [type, setType] = useState<"HOME" | "OFFICE" | "WORKSHOP">("HOME");
  const [isDefault, setIsDefault] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/account/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          addressLine,
          city,
          state,
          pincode,
          type,
          isDefault,
        }),
      });

      if (res.ok) {
        setShowAddForm(false);
        setName("");
        setPhone("");
        setAddressLine("");
        setCity("");
        setPincode("");
        fetchAddresses();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
      <div className="pb-6 border-b border-slate-100 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Saved Addresses</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage destinations for surface logistics and crated parts delivery.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "Cancel" : "Add New Address"}</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddAddress} className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Add New Shipping Address</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rajesh Kumar"
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-hidden focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-hidden focus:border-orange-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Address Line</label>
            <input
              type="text"
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder="Flat 402, Building, Street, Landmark"
              className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-hidden focus:border-orange-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Pune"
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-hidden focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Maharashtra"
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-hidden focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">PIN Code</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="e.g. 411001"
                maxLength={6}
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-hidden focus:border-orange-500"
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-6 pt-2 text-xs">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="defaultAddr"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="defaultAddr" className="text-slate-700 font-medium">
                Set as Default Address
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs"
          >
            {submitting ? "Saving..." : "Save Address"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading addresses...</div>
      ) : addresses.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400">No saved addresses yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-5 rounded-2xl border text-xs relative ${
                addr.isDefault
                  ? "border-orange-500 bg-orange-50/20 shadow-xs"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-900 text-sm">{addr.name}</span>
                <span className="bg-slate-200/80 px-2 py-0.5 rounded text-[10px] font-bold text-slate-700">
                  {addr.type}
                </span>
              </div>
              <p className="text-slate-600 font-medium">{addr.phone}</p>
              <p className="text-slate-500 mt-1">
                {addr.addressLine}, {addr.city}, {addr.state} - {addr.pincode}
              </p>

              {addr.isDefault && (
                <div className="mt-3 text-[11px] font-bold text-orange-600 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Default Shipping Destination</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
