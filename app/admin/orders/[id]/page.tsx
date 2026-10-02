'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Package, MapPin, CreditCard, Truck, CheckCircle,
  Clock, RefreshCw, Save, AlertCircle
} from 'lucide-react';

const ORDER_STATUSES = [
  'PENDING', 'PAYMENT_PENDING', 'CONFIRMED', 'PROCESSING',
  'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED',
  'CANCELLED', 'RETURNED', 'REFUNDED',
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  PAYMENT_PENDING: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  CONFIRMED: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  PROCESSING: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  PACKED: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  SHIPPED: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  OUT_FOR_DELIVERY: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  DELIVERED: 'bg-green-500/20 text-green-300 border-green-500/30',
  CANCELLED: 'bg-red-500/20 text-red-300 border-red-500/30',
  RETURNED: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  REFUNDED: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

interface OrderDetail {
  id: string;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  trackingNumber: string | null;
  internalNotes: string | null;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string | null;
  items: Array<{
    id: string; quantity: number; price: number; productName: string; productSku: string;
    product: { id: string; name: string; sku: string; images: { imageUrl: string }[] };
  }>;
}

function getAddressLines(address: string | null): string[] {
  if (!address) return [];
  try {
    const parsed: unknown = JSON.parse(address);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return Object.values(parsed).filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
    }
  } catch {
    return [address];
  }
  return [address];
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/orders/${id}`);
    const data = await res.json();
    if (res.ok) {
      setOrder(data.order);
      setNewStatus(data.order.orderStatus);
      setTrackingNumber(data.order.trackingNumber || '');
      setAdminNote(data.order.internalNotes || '');
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    const timer = window.setTimeout(() => void fetchOrder(), 0);
    return () => window.clearTimeout(timer);
  }, [fetchOrder]);

  const handleUpdate = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus, trackingNumber, internalNotes: adminNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setSuccess('Order updated successfully!');
      setOrder(data.order);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (v: number) => `₹${v.toLocaleString('en-IN')}`;
  const formatDate = (d: string) => new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-slate-400">Order not found</p>
        <Link href="/admin/orders" className="text-orange-400 hover:underline text-sm">Back to orders</Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/orders" className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Order #{order.orderNumber}</h1>
          <p className="text-slate-400 text-sm">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <span className={`ml-auto px-3 py-1.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[order.orderStatus] || 'bg-slate-500/20 text-slate-300'}`}>
          {order.orderStatus.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-slate-800 rounded-2xl p-5">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-orange-400" /> Order Items
            </h2>
            <div className="space-y-3">
              {order.items.map(item => (
                <div key={item.id} className="flex gap-4 p-3 bg-slate-700/50 rounded-xl">
                  <div className="w-16 h-16 bg-slate-600 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product?.images?.[0] ? (
                      <img src={item.product.images[0].imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white line-clamp-1">{item.productName}</p>
                    {item.productSku && <p className="text-xs text-slate-400">SKU: {item.productSku}</p>}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-slate-400">Qty: {item.quantity}</span>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-white">{formatPrice(item.price)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer & Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-2xl p-5">
              <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-orange-400" /> Customer
              </h2>
              <p className="text-sm text-white font-medium">{order.customerName}</p>
              <p className="text-sm text-slate-400">{order.customerEmail}</p>
              {order.customerPhone && <p className="text-sm text-slate-400">{order.customerPhone}</p>}
              <div className="mt-3 pt-3 border-t border-slate-700">
                <p className="text-xs text-slate-500 mb-1">Payment Method</p>
                <p className="text-sm text-white font-medium">{order.paymentMethod?.replace(/_/g, ' ')}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                  order.paymentStatus === 'PAID' ? 'bg-green-500/20 text-green-300' :
                  order.paymentStatus === 'PENDING' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-red-500/20 text-red-300'
                }`}>{order.paymentStatus}</span>
              </div>
            </div>

            <div className="bg-slate-800 rounded-2xl p-5">
              <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-400" /> Shipping Address
              </h2>
              {order.shippingAddress ? (
                <div className="text-sm text-slate-300 space-y-0.5">
                  {getAddressLines(order.shippingAddress).map((line, index) => (
                    <p key={`${index}-${line}`} className={index === 0 ? 'text-white font-medium' : undefined}>{line}</p>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">No shipping address</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Price Summary */}
          <div className="bg-slate-800 rounded-2xl p-5">
            <h2 className="text-base font-semibold text-white mb-4">Price Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Subtotal</span>
                <span className="text-white">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Shipping</span>
                <span className="text-white">{formatPrice(order.shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tax (GST)</span>
                <span className="text-white">{formatPrice(order.tax)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Discount</span>
                  <span className="text-green-400">-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-2 border-t border-slate-700">
                <span className="text-white">Total</span>
                <span className="text-orange-400">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Update Status */}
          <div className="bg-slate-800 rounded-2xl p-5">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4 text-orange-400" /> Update Order
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 focus:outline-none">
                  {ORDER_STATUSES.map(s => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Tracking Number</label>
                <input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 focus:outline-none"
                  placeholder="BLUEDART12345678" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Admin Note</label>
                <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 focus:outline-none resize-none"
                  placeholder="Internal note..." />
              </div>
              {error && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
              {success && <p className="text-xs text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" />{success}</p>}
              <button onClick={handleUpdate} disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Update Order'}
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-slate-800 rounded-2xl p-5">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-400" /> Timeline
            </h2>
            <div className="text-sm text-slate-400 space-y-2">
              <div className="flex justify-between">
                <span>Created</span>
                <span className="text-white">{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated</span>
                <span className="text-white">{formatDate(order.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
