import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatPrice, formatDate, getOrderStatusBadge } from "@/lib/utils";
import { Package, Truck, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerOrdersPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const orders = await prisma.order.findMany({
    where: { customerId: user.id },
    include: {
      items: {
        include: {
          product: {
            include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
      <div className="pb-6 border-b border-slate-100 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">My Orders & Tracking</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your verified parts shipments and review historical invoices.
          </p>
        </div>
        <Link
          href="/shop"
          className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition self-start sm:self-auto"
        >
          Shop More Parts
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="py-16 text-center text-xs">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">No orders found</h3>
          <p className="text-slate-400 mt-1">You haven't purchased any parts yet.</p>
          <Link
            href="/shop"
            className="mt-4 inline-block px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusBadge = getOrderStatusBadge(order.orderStatus);
            return (
              <div
                key={order.id}
                className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 overflow-hidden"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/60 gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      #{order.orderNumber}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${statusBadge.bg}`}>
                      {statusBadge.label}
                    </span>
                    <span className="text-slate-400">• Placed on {formatDate(order.createdAt)}</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-sm text-slate-900">
                      {formatPrice(order.total)}
                    </span>
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-xs transition flex items-center space-x-1"
                    >
                      <span>Track Order</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Items preview */}
                <div className="pt-4 divide-y divide-slate-100">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3 min-w-0">
                        {item.product?.images?.[0] && (
                          <img
                            src={item.product.images[0].imageUrl}
                            alt={item.productName}
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        )}
                        <div className="truncate">
                          <p className="font-bold text-slate-800 truncate">{item.productName}</p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            SKU: {item.productSku} • Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900 shrink-0">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Tracking info */}
                {order.trackingNumber && (
                  <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center space-x-2">
                      <Truck className="w-4 h-4 text-orange-600" />
                      <span>
                        Courier: <strong className="text-slate-800">{order.shippingCompany || "Surface Express"}</strong> ({order.trackingNumber})
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-semibold">
                      {order.estimatedDelivery || "In Transit"}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
