'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Eye, RefreshCw, Users, ShieldOff, ShieldCheck } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count: { orders: number; offers: number; reviews: number; };
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (search) params.set('search', search);
    const res = await fetch(`/api/admin/customers?${params}`);
    const data = await res.json();
    setCustomers(data.customers || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const toggleActive = async (id: string, isActive: boolean) => {
    await fetch(`/api/admin/customers`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id, isActive: !isActive }),
    });
    fetchCustomers();
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-slate-400 text-sm">{total} total customers</p>
        </div>
        <button onClick={fetchCustomers} className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="bg-slate-800 rounded-2xl p-4 mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-orange-500 focus:outline-none" />
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-6 h-6 animate-spin text-orange-500" />
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Phone</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Orders</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Offers</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Reviews</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Joined</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-white">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">{c.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        c.role === 'CUSTOMER' ? 'bg-slate-600 text-slate-300' :
                        'bg-orange-500/20 text-orange-300'
                      }`}>{c.role}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">{c._count?.orders ?? 0}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{c._count?.offers ?? 0}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{c._count?.reviews ?? 0}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{formatDate(c.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${c.isActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                        {c.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(c.id, c.isActive)}
                        className={`p-1.5 rounded-lg transition-colors ${c.isActive ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-green-500/20 text-green-400'}`}
                        title={c.isActive ? 'Suspend' : 'Activate'}>
                        {c.isActive ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700">
            <p className="text-sm text-slate-400">Page {page} of {Math.ceil(total / 20)}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg text-sm disabled:opacity-40 hover:bg-slate-600 transition-colors">
                Previous
              </button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 20)}
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
