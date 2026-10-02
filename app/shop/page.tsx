import React from "react";
import prisma from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import VehicleSelector from "@/components/VehicleSelector";
import Link from "next/link";
import { Filter, SlidersHorizontal, ArrowUpDown, X, Car, Bike } from "lucide-react";

export const dynamic = "force-dynamic";

interface ShopPageProps {
  searchParams: Promise<{
    q?: string;
    vehicleType?: string;
    brand?: string;
    model?: string;
    year?: string;
    category?: string;
    condition?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const {
    q,
    vehicleType,
    brand,
    model,
    year,
    category,
    condition,
    minPrice,
    maxPrice,
    sort = "newest",
  } = params;

  // Build Prisma where query
  const where: any = {
    status: "PUBLISHED",
  };

  if (vehicleType && vehicleType !== "ALL") {
    where.vehicleType = vehicleType;
  }

  if (brand && brand !== "ALL") {
    where.brand = {
      OR: [{ id: brand }, { name: { contains: brand } }],
    };
  }

  if (model && model !== "ALL") {
    where.model = {
      OR: [{ id: model }, { name: { contains: model } }],
    };
  }

  if (year) {
    where.year = parseInt(year, 10);
  }

  if (category && category !== "ALL") {
    where.category = {
      OR: [{ id: category }, { slug: category }],
    };
  }

  if (condition && condition !== "ALL") {
    where.condition = condition;
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }

  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
      { sku: { contains: q } },
      { partNumber: { contains: q } },
      { oemNumber: { contains: q } },
      { brand: { name: { contains: q } } },
      { model: { name: { contains: q } } },
    ];
  }

  let orderBy: any = { createdAt: "desc" };
  if (sort === "price-asc") orderBy = { price: "asc" };
  if (sort === "price-desc") orderBy = { price: "desc" };

  const [products, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        brand: true,
        model: true,
        category: true,
        reviews: { select: { rating: true } },
      },
      orderBy,
    }),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: true } } },
    }),
    prisma.vehicleBrand.findMany({
      orderBy: { name: "asc" },
      include: { models: true },
    }),
  ]);

  const formattedProducts = products.map((p) => {
    const avgRating =
      p.reviews.length > 0
        ? p.reviews.reduce((acc, r) => acc + r.rating, 0) / p.reviews.length
        : 5.0;

    return {
      ...p,
      averageRating: Number(avgRating.toFixed(1)),
      reviewCount: p.reviews.length,
    };
  });

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Breadcrumbs & Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-2">
            <Link href="/" className="hover:text-slate-900">Home</Link>
            <span>/</span>
            <span className="font-semibold text-slate-800">
              {vehicleType === "CAR"
                ? "Car Parts"
                : vehicleType === "BIKE"
                ? "Bike Parts"
                : "All Auto Parts Catalog"}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {vehicleType === "CAR"
                  ? "Used Car Parts & Salvage Spares"
                  : vehicleType === "BIKE"
                  ? "Used Motorcycle & Bike Spare Parts"
                  : "All Used & Refurbished Auto Parts"}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Showing {formattedProducts.length} verified tested parts ready for immediate delivery across India.
              </p>
            </div>

            {/* Quick Vehicle Type Toggle */}
            <div className="flex items-center space-x-2 bg-slate-200/80 p-1 rounded-xl self-start sm:self-auto text-xs font-bold">
              <Link
                href="/shop"
                className={`px-3 py-1.5 rounded-lg transition ${
                  !vehicleType || vehicleType === "ALL"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All
              </Link>
              <Link
                href="/shop?vehicleType=CAR"
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
                  vehicleType === "CAR"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Car className="w-3.5 h-3.5 text-orange-600" />
                <span>Cars</span>
              </Link>
              <Link
                href="/shop?vehicleType=BIKE"
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
                  vehicleType === "BIKE"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Bike className="w-3.5 h-3.5 text-orange-600" />
                <span>Bikes</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Vehicle Selector bar */}
        <div className="mb-8">
          <VehicleSelector compact />
        </div>

        {/* Main Content Layout with Filter Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar Filters */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center space-x-2 text-sm font-bold text-slate-900">
                  <Filter className="w-4 h-4 text-orange-600" />
                  <span>Filters</span>
                </div>
                <Link
                  href="/shop"
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                >
                  Reset All
                </Link>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                  Category
                </h4>
                <div className="space-y-1 text-xs">
                  <Link
                    href={`/shop?${new URLSearchParams({ ...params, category: "ALL" }).toString()}`}
                    className={`block py-1.5 px-2 rounded-lg font-medium transition ${
                      !category || category === "ALL"
                        ? "bg-orange-50 text-orange-700 font-bold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    All Categories
                  </Link>
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/shop?${new URLSearchParams({ ...params, category: c.slug }).toString()}`}
                      className={`flex items-center justify-between py-1.5 px-2 rounded-lg font-medium transition ${
                        category === c.slug
                          ? "bg-orange-50 text-orange-700 font-bold"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className="truncate">{c.name}</span>
                      <span className="text-[11px] text-slate-400">({c._count.products})</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Vehicle Brands */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                  Vehicle Brand
                </h4>
                <div className="space-y-1 text-xs max-h-48 overflow-y-auto pr-1">
                  <Link
                    href={`/shop?${new URLSearchParams({ ...params, brand: "ALL" }).toString()}`}
                    className={`block py-1 px-2 rounded-lg font-medium transition ${
                      !brand || brand === "ALL"
                        ? "bg-orange-50 text-orange-700 font-bold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    All Brands
                  </Link>
                  {brands.map((b) => (
                    <Link
                      key={b.id}
                      href={`/shop?${new URLSearchParams({ ...params, brand: b.name }).toString()}`}
                      className={`block py-1 px-2 rounded-lg font-medium transition ${
                        brand === b.name
                          ? "bg-orange-50 text-orange-700 font-bold"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {b.name} ({b.vehicleType})
                    </Link>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                  Condition Rating
                </h4>
                <div className="space-y-1 text-xs">
                  {[
                    { label: "All Conditions", value: "ALL" },
                    { label: "Genuine OEM Used", value: "GENUINE_USED" },
                    { label: "Refurbished & Tested", value: "REFURBISHED" },
                    { label: "Open Box / Surplus", value: "OPEN_BOX" },
                    { label: "Salvage / For Parts", value: "DAMAGED_PARTS" },
                  ].map((cond) => (
                    <Link
                      key={cond.value}
                      href={`/shop?${new URLSearchParams({ ...params, condition: cond.value }).toString()}`}
                      className={`block py-1.5 px-2 rounded-lg font-medium transition ${
                        (condition || "ALL") === cond.value
                          ? "bg-orange-50 text-orange-700 font-bold"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {cond.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Sort by */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                  Sort Order
                </h4>
                <div className="space-y-1 text-xs">
                  <Link
                    href={`/shop?${new URLSearchParams({ ...params, sort: "newest" }).toString()}`}
                    className={`block py-1.5 px-2 rounded-lg font-medium transition ${
                      sort === "newest"
                        ? "bg-orange-50 text-orange-700 font-bold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Newly Listed
                  </Link>
                  <Link
                    href={`/shop?${new URLSearchParams({ ...params, sort: "price-asc" }).toString()}`}
                    className={`block py-1.5 px-2 rounded-lg font-medium transition ${
                      sort === "price-asc"
                        ? "bg-orange-50 text-orange-700 font-bold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Price: Low to High
                  </Link>
                  <Link
                    href={`/shop?${new URLSearchParams({ ...params, sort: "price-desc" }).toString()}`}
                    className={`block py-1.5 px-2 rounded-lg font-medium transition ${
                      sort === "price-desc"
                        ? "bg-orange-50 text-orange-700 font-bold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Price: High to Low
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Product Grid */}
          <div className="lg:col-span-3">
            {/* Active Filters Bar */}
            {(brand || category || condition || q) && (
              <div className="mb-4 flex flex-wrap items-center gap-2 bg-white p-3 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-400 font-semibold">Active filters:</span>
                {q && (
                  <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md font-medium">
                    Search: "{q}"
                  </span>
                )}
                {brand && brand !== "ALL" && (
                  <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md font-medium">
                    Brand: {brand}
                  </span>
                )}
                {category && category !== "ALL" && (
                  <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md font-medium">
                    Category: {category}
                  </span>
                )}
                {condition && condition !== "ALL" && (
                  <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md font-medium">
                    Condition: {condition}
                  </span>
                )}
                <Link
                  href="/shop"
                  className="text-orange-600 hover:underline font-bold text-xs ml-auto"
                >
                  Clear all
                </Link>
              </div>
            )}

            {formattedProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                  <SlidersHorizontal className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No matching parts found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try broadening your search filters, selecting a different brand/model, or ask our team to source this part for you.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <Link
                    href="/shop"
                    className="px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-700 transition"
                  >
                    View All Parts
                  </Link>
                  <Link
                    href="/contact"
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
                  >
                    Request Part Sourcing
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {formattedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
