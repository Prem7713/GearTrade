'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Eye, RefreshCw, Package } from 'lucide-react';

const ORDER_STATUSES = [
  'ALL', 'PENDING', 'PAYMENT_PENDING', 'CONFIRMED', 'PROCESSING',
  'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED',
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-300',
  PAYMENT_PENDING: 'bg-orange-500/20 text-orange-300',
  CONFIRMED: 'bg-blue-500/20 text-blue-300',
  PROCESSING: 'bg-indigo-500/20 text-indigo-300',
  PACKED: 'bg-purple-500/20 text-purple-300',
  SHIPPED: 'bg-cyan-500/20 text-cyan-300',
  OUT_FOR_DELIVERY: 'bg-teal-500/20 text-teal-300',
  DELIVERED: 'bg-green-500/20 text-green-300',
  CANCELLED: 'bg-red-500/20 text-red-300',
  RETURNED: 'bg-pink-500/20 text-pink-300',
  REFUNDED: 'bg-slate-500/20 text-slate-300',
};

interface Order {
  id: string;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  items: { id: string; }[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');

  const fetchOrders = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (statusFilter !== 'ALL') params.set('status', statusFilter);
    if (search) params.set('search', search);
    try {
      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load orders');
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } catch (fetchError) {
      setOrders([]);
      setTotal(0);
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    const timer = window.setTimeout(() => void fetchOrders(), 0);
    return () => window.clearTimeout(timer);
  }, [fetchOrders]);

  const formatPrice = (v: number) => `₹${v.toLocaleString('en-IN')}`;
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-slate-400 text-sm">{total} total orders</p>
        </div>
        <button onClick={() => { setLoading(true); setError(''); void fetchOrders(); }} className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-2xl p-4 mb-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          {ORDER_STATUSES.map(s => (
            <button key={s} onClick={() => { setLoading(true); setError(''); setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                statusFilter === s ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}>
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => { setLoading(true); setError(''); setSearch(e.target.value); setPage(1); }}
              placeholder="Search order # or customer..."
              className="w-full pl-9 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-orange-500 focus:outline-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-6 h-6 animate-spin text-orange-500" />
          </div>
        ) : error ? (
          <div role="alert" className="px-4 py-12 text-center text-sm text-red-300">{error}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Order #</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Items</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Payment</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-orange-400">{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-white font-medium">{order.customerName}</p>
                      <p className="text-xs text-slate-400">{order.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">{order.items?.length || 0} item(s)</td>
                    <td className="px-4 py-3 text-sm font-semibold text-white">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.orderStatus] || 'bg-slate-500/20 text-slate-300'}`}>
                        {order.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.paymentStatus === 'PAID' ? 'bg-green-500/20 text-green-300' :
                        order.paymentStatus === 'PENDING' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${order.id}`}
                        className="p-1.5 hover:bg-orange-500/20 text-orange-400 rounded-lg transition-colors inline-flex">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700">
            <p className="text-sm text-slate-400">Page {page} of {Math.ceil(total / 20)}</p>
            <div className="flex gap-2">
              <button onClick={() => { setLoading(true); setPage(p => Math.max(1, p - 1)); }} disabled={page === 1}
                className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg text-sm disabled:opacity-40 hover:bg-slate-600 transition-colors">
                Previous
              </button>
              <button onClick={() => { setLoading(true); setPage(p => p + 1); }} disabled={page >= Math.ceil(total / 20)}
                className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg text-sm disabled:opacity-40 hover:bg-slate-600 transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
