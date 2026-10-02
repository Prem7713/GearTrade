import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  Printer,
  ShieldCheck,
  Building,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface SuccessPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderSuccessPage({ params }: SuccessPageProps) {
  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id }, { orderNumber: id }],
    },
    include: {
      items: true,
      payments: true,
    },
  });

  if (!order) {
    notFound();
  }

  let shippingAddress: any = {};
  try {
    shippingAddress = JSON.parse(order.shippingAddress);
  } catch {
    shippingAddress = { addressLine: order.shippingAddress };
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Card Header */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-xs mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            Payment {order.paymentStatus} • Order Confirmed
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-3">
            Thank You For Your Order!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-lg mx-auto">
            Your used auto parts order <strong className="text-slate-800">#{order.orderNumber}</strong> has been logged. Our dispatch team is preparing bubble crating for safe transit.
          </p>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block">Order Number</span>
              <span className="font-mono font-bold text-slate-900">{order.orderNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Order Date</span>
              <span className="font-semibold text-slate-900">{formatDate(order.createdAt)}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Payment Method</span>
              <span className="font-semibold text-slate-900">{order.paymentMethod}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Courier Tracking</span>
              <span className="font-mono font-bold text-orange-600">{order.trackingNumber || "Pending"}</span>
            </div>
          </div>
        </div>

        {/* Order Details & Invoice View */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-orange-600" />
              <h2 className="text-base font-bold text-slate-900">Purchased Auto Spares</h2>
            </div>
            <span className="text-xs font-mono text-slate-400">Invoice: {order.invoiceNumber || "INV-GEN"}</span>
          </div>

          {/* Items List */}
          <div className="divide-y divide-slate-100 mb-6">
            {order.items.map((item) => (
              <div key={item.id} className="py-4 flex items-center justify-between text-xs">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{item.productName}</h3>
                  <div className="mt-1 flex items-center space-x-3 text-slate-500 font-mono text-[11px]">
                    <span>SKU: {item.productSku}</span>
                    {item.condition && <span>Condition: {item.condition}</span>}
                    {item.oemNumber && <span>OEM #: {item.oemNumber}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 text-sm">{formatPrice(item.price)}</span>
                  <span className="block text-[11px] text-slate-400">Qty: {item.quantity}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-600 max-w-xs ml-auto">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount Applied:</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Surface Logistics:</span>
              <span>{order.shipping === 0 ? "FREE" : formatPrice(order.shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%):</span>
              <span className="font-semibold text-slate-900">{formatPrice(order.tax)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
              <span>Grand Total:</span>
              <span className="text-base text-orange-600">{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Destination */}
          <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="font-bold text-slate-900 block mb-1">Shipping Destination</span>
              <p className="text-slate-600">{shippingAddress.name || order.customerName}</p>
              <p className="text-slate-600">{shippingAddress.phone || order.customerPhone}</p>
              <p className="text-slate-600">
                {shippingAddress.addressLine}, {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="font-bold text-slate-900 block mb-1">Billing & GST Entity</span>
              <p className="text-slate-600 font-mono">GSTIN: {order.gstNumber || "27AABCT8521P1Z4"}</p>
              <p className="text-slate-600">Company: GearTrade India Automotive Logistics Ltd.</p>
              <p className="text-slate-600">Sector 4, MIDC Chakan Auto Cluster, Pune</p>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/account/orders"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2"
          >
            <Truck className="w-4 h-4 text-orange-500" />
            <span>Track Order in Customer Portal</span>
          </Link>

          <Link
            href="/shop"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs transition text-center"
          >
            Continue Shopping Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
