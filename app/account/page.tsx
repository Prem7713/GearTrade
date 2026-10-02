import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatPrice, formatDate, getOrderStatusBadge, getOfferStatusBadge } from "@/lib/utils";
import {
  Package,
  Handshake,
  Heart,
  Truck,
  ArrowRight,
  Clock,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [orders, offers, wishlistCount] = await Promise.all([
    prisma.order.findMany({
      where: { customerId: user.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.offer.findMany({
      where: { customerId: user.id },
      include: {
        product: { select: { name: true, sku: true, price: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.wishlist.count({ where: { customerId: user.id } }),
  ]);

  const activeOrders = orders.filter((o) => ["CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY"].includes(o.orderStatus));
  const completedOrders = orders.filter((o) => o.orderStatus === "DELIVERED");
  const pendingOffers = offers.filter((o) => ["PENDING", "COUNTER_OFFER"].includes(o.status));

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-slate-900 rounded-3xl text-white p-6 sm:p-8 relative overflow-hidden shadow-xs">
        <div className="max-w-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
            Customer Dashboard
          </span>
          <h1 className="text-2xl font-black tracking-tight mt-1">
            Welcome back, {user.name}!
          </h1>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Manage your verified automotive spares, monitor courier surface shipments, and negotiate bargain prices.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-3">
            <Package className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-slate-900">{orders.length}</p>
          <p className="text-xs text-slate-500 font-medium">Total Orders</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Truck className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-slate-900">{activeOrders.length}</p>
          <p className="text-xs text-slate-500 font-medium">In Transit / Active</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
            <Handshake className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-slate-900">{offers.length}</p>
          <p className="text-xs text-slate-500 font-medium">Active Bargains</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
            <Heart className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-slate-900">{wishlistCount}</p>
          <p className="text-xs text-slate-500 font-medium">Saved Parts</p>
        </div>
      </div>

      {/* Active Orders Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-orange-600" />
            <h2 className="text-base font-bold text-slate-900">Recent Orders</h2>
          </div>
          <Link
            href="/account/orders"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            You haven't placed any orders yet.{" "}
            <Link href="/shop" className="text-orange-600 font-bold hover:underline">
              Find parts for your car or bike
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {orders.slice(0, 3).map((o) => {
              const statusBadge = getOrderStatusBadge(o.orderStatus);
              return (
                <div key={o.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-900">{o.orderNumber}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusBadge.bg}`}>
                        {statusBadge.label}
                      </span>
                    </div>
                    <p className="text-slate-500 mt-1">
                      {o.items.length} item{o.items.length !== 1 ? "s" : ""}: {o.items.map((i) => i.productName).join(", ")}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Ordered on {formatDate(o.createdAt)} • Tracking: {o.trackingNumber || "Pending"}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="font-bold text-sm text-slate-900">{formatPrice(o.total)}</span>
                    <Link
                      href={`/account/orders/${o.id}`}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-[11px] text-slate-700 transition"
                    >
                      View Order
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Negotiations / Bargains Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-2">
            <Handshake className="w-5 h-5 text-orange-600" />
            <h2 className="text-base font-bold text-slate-900">Active Price Negotiations</h2>
          </div>
          <Link
            href="/account/offers"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
          >
            <span>View All Offers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {offers.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No active negotiations. Click "Make an Offer" on any eligible used part to negotiate!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {offers.slice(0, 3).map((off) => {
              const statusBadge = getOfferStatusBadge(off.status);
              return (
                <div key={off.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-900">{off.offerNumber}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusBadge.bg}`}>
                        {statusBadge.label}
                      </span>
                    </div>
                    <p className="font-bold text-slate-800 mt-1">{off.product.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Listed: {formatPrice(off.originalPrice)} • Current Offer: <strong className="text-orange-600 font-bold">{formatPrice(off.currentOffer)}</strong>
                    </p>
                  </div>

                  <div>
                    <Link
                      href={`/account/offers/${off.id}`}
                      className="inline-flex items-center space-x-1 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition"
                    >
                      <span>Negotiation Room</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
