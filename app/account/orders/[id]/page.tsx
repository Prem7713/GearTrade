import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { formatPrice, formatDate, getOrderStatusBadge } from "@/lib/utils";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
  Building,
  ArrowLeft,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerOrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id }, { orderNumber: id }],
      customerId: user.id,
    },
    include: {
      items: {
        include: {
          product: {
            include: { images: { take: 1 } },
          },
        },
      },
      payments: true,
    },
  });

  if (!order) {
    notFound();
  }

  const statusBadge = getOrderStatusBadge(order.orderStatus);

  let shippingAddress: any = {};
  try {
    shippingAddress = JSON.parse(order.shippingAddress);
  } catch {
    shippingAddress = { addressLine: order.shippingAddress };
  }

  // Delivery Timeline Steps calculation
  const timelineSteps = [
    { title: "Order Confirmed", desc: "Order details and payment verified", done: true },
    {
      title: "Bench Tested & Inspected",
      desc: "Electrical & functional check completed",
      done: ["PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(order.orderStatus),
    },
    {
      title: "Wooden Crate Packing",
      desc: "Protective foam & bubble wrap crating",
      done: ["PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(order.orderStatus),
    },
    {
      title: "Shipped via Surface Cargo",
      desc: order.trackingNumber ? `AWB: ${order.trackingNumber} (${order.shippingCompany || "Express"})` : "Surface logistics pickup",
      done: ["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(order.orderStatus),
    },
    {
      title: "Delivered & Inspected",
      desc: "Handed over to customer",
      done: order.orderStatus === "DELIVERED",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top back button */}
      <div>
        <Link
          href="/account/orders"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>
      </div>

      {/* Main Order Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-black text-slate-900 font-mono">
                Order #{order.orderNumber}
              </h1>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${statusBadge.bg}`}>
                {statusBadge.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Placed on {formatDate(order.createdAt)} • Invoice #{order.invoiceNumber || "INV-GT-001"}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {}}
              className="no-print px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center space-x-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Tax Invoice</span>
            </button>
          </div>
        </div>

        {/* 5-Step Delivery Tracker */}
        <div className="py-8 border-b border-slate-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
            Live Shipment Journey
          </h2>

          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              {timelineSteps.map((step, idx) => (
                <div key={idx} className="flex sm:flex-col items-start space-x-3 sm:space-x-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mb-2 transition shadow-xs ${
                      step.done
                        ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {step.done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div>
                    <h3
                      className={`text-xs font-bold ${
                        step.done ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="py-6 border-b border-slate-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Items in this Shipment
          </h2>

          <div className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <div key={item.id} className="py-3.5 flex items-center justify-between text-xs">
                <div>
                  <h3 className="font-bold text-slate-900">{item.productName}</h3>
                  <div className="mt-1 flex items-center space-x-3 text-slate-500 font-mono text-[11px]">
                    <span>SKU: {item.productSku}</span>
                    {item.condition && <span>Condition: {item.condition}</span>}
                    {item.oemNumber && <span>OEM #: {item.oemNumber}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900">{formatPrice(item.price)}</span>
                  <span className="block text-[11px] text-slate-400">Qty: {item.quantity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Totals & Address Grid */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
          {/* Shipping & Billing details */}
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="font-bold text-slate-900 block mb-1">Delivered To:</span>
              <p className="text-slate-600 font-medium">{shippingAddress.name || order.customerName}</p>
              <p className="text-slate-600">{shippingAddress.phone || order.customerPhone}</p>
              <p className="text-slate-600 mt-0.5">
                {shippingAddress.addressLine}, {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}
              </p>
            </div>

            <div className="bg-emerald-50 text-emerald-900 p-4 rounded-2xl border border-emerald-200/80 flex items-center space-x-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>30-Day Testing Replacement Warranty active for this order.</span>
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-2 text-slate-600 max-w-xs sm:ml-auto">
            <div className="flex justify-between">
              <span>Parts Subtotal:</span>
              <span className="font-bold text-slate-900">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount Applied:</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Pan-India Surface Freight:</span>
              <span>{order.shipping === 0 ? "FREE" : formatPrice(order.shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%):</span>
              <span className="font-semibold text-slate-900">{formatPrice(order.tax)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
              <span>Total Paid:</span>
              <span className="text-lg text-orange-600">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
