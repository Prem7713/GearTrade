import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Car, Bike, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { sortOrder: "asc" },
  });

  const carCategories = categories.filter((c) => c.vehicleType === "CAR" || c.vehicleType === "BOTH");
  const bikeCategories = categories.filter((c) => c.vehicleType === "BIKE" || c.vehicleType === "BOTH");

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Auto & Motorcycle Parts Categories
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Explore verified salvaged, refurbished, and surplus auto components classified by system and application.
          </p>
        </div>

        {/* Car Categories */}
        <div className="mb-14">
          <div className="flex items-center space-x-2 pb-4 mb-6 border-b border-slate-200">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Car Spare Parts Categories</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {carCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}&vehicleType=CAR`}
                className="group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-orange-500 transition flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-orange-600 transition">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {cat._count.products} parts in stock
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs font-semibold text-orange-600">
                  <span>Browse Car Parts</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bike Categories */}
        <div>
          <div className="flex items-center space-x-2 pb-4 mb-6 border-b border-slate-200">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <Bike className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Motorcycle & Scooter Parts Categories</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {bikeCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}&vehicleType=BIKE`}
                className="group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-orange-500 transition flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-orange-600 transition">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {cat._count.products} parts in stock
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs font-semibold text-orange-600">
                  <span>Browse Bike Parts</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
