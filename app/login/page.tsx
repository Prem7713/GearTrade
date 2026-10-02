"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/lib/user-context";
import { Wrench, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";
  const { refreshUser } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
      } else {
        await refreshUser();
        router.push(redirectUrl);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillCustomerDemo = () => {
    setEmail("rajesh.kumar@gmail.com");
    setPassword("customer123");
    setError(null);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-16 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-orange-500 flex items-center justify-center">
              <Wrench className="w-5 h-5 -rotate-45" />
            </div>
            <span className="text-xl font-black text-slate-900">
              GEAR<span className="text-orange-600">TRADE</span>
            </span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 mt-4 tracking-tight">Customer Sign In</h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your orders, tracked deliveries, and live part negotiations.
          </p>
        </div>

        {/* Demo Credentials Quick-Fill button */}
        <div className="mb-6 p-3 bg-orange-50/80 border border-orange-200/80 rounded-2xl flex items-center justify-between">
          <div className="text-[11px] text-orange-950 font-medium">
            <p className="font-bold flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>Demo Customer Login:</span>
            </p>
            <p className="text-orange-800 text-[10px]">rajesh.kumar@gmail.com / customer123</p>
          </div>
          <button
            type="button"
            onClick={fillCustomerDemo}
            className="px-2.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-[11px] shadow-xs"
          >
            Auto-Fill
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start space-x-2 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-slate-300 pl-10 pr-3 py-2.5 text-xs text-slate-900 outline-hidden focus:border-orange-500"
                required
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">Password</label>
              <Link href="/forgot-password" className="text-[11px] font-semibold text-orange-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 pl-10 pr-3 py-2.5 text-xs text-slate-900 outline-hidden focus:border-orange-500"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2"
          >
            <span>{loading ? "Signing in..." : "Sign In to Account"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
          Don&apos;t have an account yet?{" "}
          <Link href="/register" className="font-bold text-orange-600 hover:underline">
            Register for Free
          </Link>
        </div>

        <div className="mt-3 text-center">
          <Link href="/admin/login" className="text-[11px] text-slate-400 hover:text-slate-600">
            Are you a staff member? Admin Sign In →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <LoginForm />
    </Suspense>
  );
}
