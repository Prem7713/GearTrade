import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatPrice, formatDate, getOrderStatusBadge, getOfferStatusBadge } from "@/lib/utils";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Handshake,
  Percent,
  LifeBuoy,
  ArrowRight,
  Plus,
  Boxes,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    totalOrders,
    orders,
    totalCustomers,
    totalProducts,
    soldProducts,
    offers,
    recentOrders,
    recentOffers,
    openTickets,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.findMany({ select: { total: true, orderStatus: true, paymentStatus: true } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.count(),
    prisma.product.count({ where: { isSold: true } }),
    prisma.offer.findMany({ select: { status: true, currentOffer: true, originalPrice: true } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    prisma.offer.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: {
        product: { select: { name: true, sku: true, price: true } },
        customer: { select: { name: true, email: true } },
      },
    }),
    prisma.supportTicket.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
  ]);

  const totalSales = orders
    .filter((o) => o.paymentStatus === "PAID")
    .reduce((acc, o) => acc + o.total, 0);

  const pendingOffers = offers.filter((o) => o.status === "PENDING" || o.status === "COUNTER_OFFER").length;
  const acceptedOffers = offers.filter((o) => o.status === "ACCEPTED").length;
  const acceptanceRate = offers.length > 0 ? Math.round((acceptedOffers / offers.length) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time sales performance, inventory turnover, and bargain negotiation pipeline.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/products/new"
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Part</span>
          </Link>
          <Link
            href="/admin/offers"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition flex items-center space-x-1.5"
          >
            <Handshake className="w-4 h-4 text-orange-400" />
            <span>Review Bargains ({pendingOffers})</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Gross Sales */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Sales</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{formatPrice(totalSales)}</p>
            <span className="text-[11px] text-emerald-600 font-bold mt-1 inline-flex items-center space-x-1">
              <TrendingUp className="w-3 h-3" />
              <span>Paid & Confirmed</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalOrders}</p>
            <Link href="/admin/orders" className="text-[11px] text-orange-600 hover:underline font-bold mt-1 block">
              Manage Orders →
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>

        {/* Active Bargains */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Bargains</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{pendingOffers}</p>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              Acceptance Rate: <strong className="text-slate-800">{acceptanceRate}%</strong>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Handshake className="w-6 h-6" />
          </div>
        </div>

        {/* Inventory Stock */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Parts Inventory</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalProducts}</p>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              {totalProducts - soldProducts} Available • {soldProducts} Sold
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Boxes className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid: Recent Orders & Recent Bargains */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4 text-orange-600" />
              <h2 className="font-bold text-sm text-slate-900">Recent Customer Orders</h2>
            </div>
            <Link href="/admin/orders" className="text-xs font-bold text-orange-600 hover:underline">
              View All Orders
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {recentOrders.map((o) => {
              const statusBadge = getOrderStatusBadge(o.orderStatus);
              return (
                <Link key={o.id} href={`/admin/orders/${o.id}`} className="py-3 flex items-center justify-between hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-orange-600">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-900">{o.orderNumber}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusBadge.bg}`}>
                        {statusBadge.label}
                      </span>
                    </div>
                    <p className="text-slate-500 mt-0.5">{o.customerName} • {formatDate(o.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block">{formatPrice(o.total)}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{o.paymentMethod}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Offers / Bargains Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center space-x-2">
              <Handshake className="w-4 h-4 text-orange-600" />
              <h2 className="font-bold text-sm text-slate-900">Negotiation Pipeline</h2>
            </div>
            <Link href="/admin/offers" className="text-xs font-bold text-orange-600 hover:underline">
              Manage Negotiations
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {recentOffers.map((off) => {
              const statusBadge = getOfferStatusBadge(off.status);
              return (
                <div key={off.id} className="py-3 flex items-center justify-between">
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-900">{off.offerNumber}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusBadge.bg}`}>
                        {statusBadge.label}
                      </span>
                    </div>
                    <p className="font-medium text-slate-800 mt-0.5 truncate">{off.product.name}</p>
                    <p className="text-[11px] text-slate-400">By {off.customer.name}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-black text-orange-600 block">{formatPrice(off.currentOffer)}</span>
                    <Link
                      href={`/admin/offers/${off.id}`}
                      className="text-[11px] text-slate-500 hover:text-slate-900 font-bold underline"
                    >
                      Respond →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
