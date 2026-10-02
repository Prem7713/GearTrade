import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatPrice, formatDate, getConditionBadge } from "@/lib/utils";
import { Package, Plus, Search, Edit, Trash2, ExternalLink, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      brand: true,
      model: true,
      images: { take: 1, orderBy: { sortOrder: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
      <div className="pb-6 border-b border-slate-100 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Products Catalog ({products.length})</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage tested used and refurbished auto & motorcycle spare components.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Part</span>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-y border-slate-200">
            <tr>
              <th className="py-3 px-4">Part / Title</th>
              <th className="py-3 px-4">Vehicle Fitment</th>
              <th className="py-3 px-4">Condition</th>
              <th className="py-3 px-4">Price / Bargain</th>
              <th className="py-3 px-4">Stock</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => {
              const conditionBadge = getConditionBadge(p.condition);
              const img = p.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=300&q=80";

              return (
                <tr key={p.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={img}
                        alt={p.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-100 shrink-0"
                      />
                      <div className="min-w-0 max-w-xs">
                        <Link
                          href={`/products/${p.slug}`}
                          target="_blank"
                          className="font-bold text-slate-900 hover:text-orange-600 transition truncate block"
                        >
                          {p.name}
                        </Link>
                        <span className="font-mono text-[10px] text-slate-400">SKU: {p.sku}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-semibold text-slate-800">
                      {p.brand?.name} {p.model?.name}
                    </span>
                    <span className="block text-[11px] text-slate-400">{p.year} • {p.vehicleType}</span>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${conditionBadge.bg}`}>
                      {conditionBadge.label}
                    </span>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-bold text-slate-900 block">{formatPrice(p.price)}</span>
                    <span className="text-[10px] text-orange-600 font-medium">
                      Min Offer: {formatPrice(p.minimumOfferPrice || p.price * 0.7)}
                    </span>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-mono font-bold text-slate-800">{p.stock}</span>
                    <span className="text-[10px] text-slate-400 block">{p.location || "Central"}</span>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    {p.isSold || p.stock <= 0 ? (
                      <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">
                        Sold
                      </span>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">
                        Available
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/products/${p.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                        title="View Live"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50"
                        title="Edit Part"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
