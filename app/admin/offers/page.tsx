'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Eye, RefreshCw, MessageSquare } from 'lucide-react';

const OFFER_STATUSES = ['ALL', 'PENDING', 'COUNTER_OFFER', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED'];

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-300',
  COUNTER_OFFER: 'bg-blue-500/20 text-blue-300',
  ACCEPTED: 'bg-green-500/20 text-green-300',
  REJECTED: 'bg-red-500/20 text-red-300',
  EXPIRED: 'bg-slate-500/20 text-slate-300',
  CANCELLED: 'bg-slate-600/20 text-slate-400',
};

interface Offer {
  id: string;
  status: string;
  originalPrice: number;
  currentOffer: number;
  roundsCount: number;
  createdAt: string;
  expiresAt: string;
  product: { name: string; };
  customer: { name: string; email: string; };
  messages: { id: string; }[];
}

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const fetchOffers = useCallback(async () => {
    setError('');
    const params = new URLSearchParams({ limit: '50' });
    if (statusFilter !== 'ALL') params.set('status', statusFilter);
    try {
      const res = await fetch(`/api/offers?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load offers');
      setOffers(data.offers || []);
    } catch (fetchError) {
      setOffers([]);
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load offers');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => void fetchOffers(), 0);
    return () => window.clearTimeout(timer);
  }, [fetchOffers]);

  const filtered = offers.filter(o =>
    !search ||
    o.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.customer?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const formatPrice = (v: number) => `₹${v.toLocaleString('en-IN')}`;
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const discount = (orig: number, offer: number) => Math.round(((orig - offer) / orig) * 100);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Bargain / Offers</h1>
          <p className="text-slate-400 text-sm">Manage customer price negotiations</p>
        </div>
        <button onClick={() => { setLoading(true); void fetchOffers(); }} className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {OFFER_STATUSES.map(s => (
          <button key={s} onClick={() => { setLoading(true); setStatusFilter(s); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              statusFilter === s ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}>
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="bg-slate-800 rounded-2xl p-4 mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search product or customer..."
            className="w-full pl-9 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-orange-500 focus:outline-none" />
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-6 h-6 animate-spin text-orange-500" />
          </div>
        ) : error ? (
          <div role="alert" className="px-4 py-12 text-center text-sm text-red-300">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No offers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Product</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Listed Price</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Current Offer</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Discount</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Round</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Expires</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filtered.map(offer => (
                  <tr key={offer.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm text-white font-medium line-clamp-1 max-w-[200px]">{offer.product?.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-white">{offer.customer?.name}</p>
                      <p className="text-xs text-slate-400">{offer.customer?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">{formatPrice(offer.originalPrice)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-orange-400">{formatPrice(offer.currentOffer)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-red-400">{discount(offer.originalPrice, offer.currentOffer)}% off</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">{offer.roundsCount}/4</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[offer.status] || 'bg-slate-500/20 text-slate-300'}`}>
                        {offer.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{formatDate(offer.expiresAt)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/offers/${offer.id}`}
                        className="flex items-center gap-1 px-2 py-1.5 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 rounded-lg text-xs transition-colors">
                        <Eye className="w-3.5 h-3.5" /> Negotiate
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
