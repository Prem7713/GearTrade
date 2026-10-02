"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/user-context";
import { ShieldAlert, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { refreshUser } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, isAdminLogin: true }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Admin authentication failed");
      } else {
        await refreshUser();
        router.push("/admin");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const autofillSuperAdmin = () => {
    setEmail("admin@geartrade.in");
    setPassword("admin123");
    setError(null);
  };

  const autofillInventoryLead = () => {
    setEmail("inventory@geartrade.in");
    setPassword("manager123");
    setError(null);
  };

  return (
    <div className="bg-slate-950 min-h-screen py-16 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 p-8 sm:p-10 shadow-2xl text-white">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-orange-600/20 text-orange-500 mx-auto flex items-center justify-center border border-orange-500/30 mb-3">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Admin & Staff Portal</h1>
          <p className="text-xs text-slate-400 mt-1">
            Restricted access. Role-based marketplace management console.
          </p>
        </div>

        {/* Demo Credentials Quick-Fill button */}
        <div className="mb-6 p-3.5 bg-slate-800/80 border border-slate-700 rounded-2xl space-y-2">
          <p className="text-xs font-bold text-orange-400 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Development Quick-Login:</span>
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={autofillSuperAdmin}
              className="flex-1 py-1.5 px-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-[11px] transition"
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={autofillInventoryLead}
              className="flex-1 py-1.5 px-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-[11px] transition"
            >
              Inventory Lead
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-rose-950/50 border border-rose-800 text-rose-300 p-3 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Admin Email</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@geartrade.in"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-3 py-2.5 text-xs text-white outline-hidden focus:border-orange-500"
                required
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Master Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-3 py-2.5 text-xs text-white outline-hidden focus:border-orange-500"
                required
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-orange-600/20 transition flex items-center justify-center space-x-2"
          >
            <span>{loading ? "Authenticating..." : "Sign In to Admin Console"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
          Looking for customer login?{" "}
          <Link href="/login" className="text-orange-400 hover:underline font-bold">
            Customer Sign In →
          </Link>
        </div>
      </div>
    </div>
  );
}
