"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Car, Bike, Search, CheckCircle2 } from "lucide-react";

interface Brand {
  id: string;
  name: string;
  vehicleType: string;
  models: { id: string; name: string; years: string; fuelTypes: string }[];
}

export default function VehicleSelector({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [vehicleType, setVehicleType] = useState<"CAR" | "BIKE">("CAR");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadBrands() {
      try {
        setLoading(true);
        const res = await fetch(`/api/vehicles?type=${vehicleType}`);
        const data = await res.json();
        setBrands(data.brands || []);
        setSelectedBrand("");
        setSelectedModel("");
        setSelectedYear("");
      } catch (e) {
        console.error("Failed to load vehicle brands", e);
      } finally {
        setLoading(false);
      }
    }
    loadBrands();
  }, [vehicleType]);

  const currentBrandObj = brands.find((b) => b.id === selectedBrand || b.name === selectedBrand);
  const models = currentBrandObj?.models || [];
  const currentModelObj = models.find((m) => m.id === selectedModel || m.name === selectedModel);

  const availableYears = currentModelObj
    ? currentModelObj.years.split(",").map((y) => y.trim())
    : ["2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017"];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("vehicleType", vehicleType);
    if (selectedBrand) params.set("brand", selectedBrand);
    if (selectedModel) params.set("model", selectedModel);
    if (selectedYear) params.set("year", selectedYear);

    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-slate-200/80 p-4 sm:p-6 ${compact ? "max-w-xl mx-auto" : "w-full"}`}>
      {/* Header Tabs */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setVehicleType("CAR")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              vehicleType === "CAR"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Car className="w-4 h-4 text-orange-500" />
            <span>Car Parts</span>
          </button>
          <button
            type="button"
            onClick={() => setVehicleType("BIKE")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              vehicleType === "BIKE"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Bike className="w-4 h-4 text-orange-500" />
            <span>Bike Parts</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center space-x-1 text-xs text-emerald-700 font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>100% Guaranteed Compatibility</span>
        </div>
      </div>

      {/* Selectors Grid */}
      <form onSubmit={handleSearch} className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Brand */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            1. Select Brand
          </label>
          <select
            value={selectedBrand}
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setSelectedModel("");
              setSelectedYear("");
            }}
            className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2.5 text-xs font-semibold text-slate-800 focus:border-orange-500 focus:bg-white focus:ring-1 focus:ring-orange-500 outline-hidden"
          >
            <option value="">All {vehicleType === "CAR" ? "Car" : "Bike"} Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Model */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            2. Select Model
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={!selectedBrand}
            className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2.5 text-xs font-semibold text-slate-800 focus:border-orange-500 focus:bg-white focus:ring-1 focus:ring-orange-500 outline-hidden disabled:opacity-50"
          >
            <option value="">{selectedBrand ? "All Models" : "Choose brand first"}</option>
            {models.map((m) => (
              <option key={m.id} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            3. Select Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            disabled={!selectedModel}
            className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2.5 text-xs font-semibold text-slate-800 focus:border-orange-500 focus:bg-white focus:ring-1 focus:ring-orange-500 outline-hidden disabled:opacity-50"
          >
            <option value="">Any Year</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>

        {/* Search CTA */}
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full h-[42px] flex items-center justify-center space-x-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md transition"
          >
            <Search className="w-4 h-4" />
            <span>Find Compatible Parts</span>
          </button>
        </div>
      </form>
    </div>
  );
}
