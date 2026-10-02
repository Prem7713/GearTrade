"use client";

import React, { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/lib/user-context";
import {
  LayoutDashboard,
  Package,
  Handshake,
  ShoppingCart,
  Boxes,
  Layers,
  Car,
  Users,
  Star,
  LifeBuoy,
  Tag,
  Image,
  BarChart3,
  History,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Wrench,
  Pencil,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout, isAdmin, refreshUser } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", email: "", phone: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  useEffect(() => {
    if (pathname !== "/admin/login" && !loading && (!user || !isAdmin)) {
      router.push("/admin/login");
    }
  }, [pathname, user, isAdmin, loading, router]);

  const openProfileEditor = () => {
    if (!user) return;
    setProfileForm({ name: user.name, email: user.email, phone: user.phone || "" });
    setProfileError("");
    setProfileSuccess("");
    setProfileOpen(true);
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileSaving(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      const response = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update profile");
      await refreshUser();
      setProfileSuccess("Profile updated successfully.");
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Could not update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs">
        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  const adminNav = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Products Catalog", href: "/admin/products", icon: Package },
    { label: "Bargains & Offers", href: "/admin/offers", icon: Handshake },
    { label: "Orders & Shipping", href: "/admin/orders", icon: ShoppingCart },
    { label: "Inventory & Warehouses", href: "/admin/inventory", icon: Boxes },
    { label: "Categories", href: "/admin/categories", icon: Layers },
    { label: "Vehicles & Models", href: "/admin/vehicles", icon: Car },
    { label: "Customer Accounts", href: "/admin/customers", icon: Users },
    { label: "Customer Reviews", href: "/admin/reviews", icon: Star },
    { label: "Support Tickets", href: "/admin/support", icon: LifeBuoy },
    { label: "Discount Coupons", href: "/admin/coupons", icon: Tag },
    { label: "Banners & Homepage", href: "/admin/banners", icon: Image },
    { label: "Reports & Analytics", href: "/admin/analytics", icon: BarChart3 },
    { label: "Audit Logs", href: "/admin/audit-logs", icon: History },
    { label: "Website Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
      {/* Mobile Header Bar */}
      <header className="lg:hidden bg-slate-950 text-white p-4 flex items-center justify-between border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-black">
            <Wrench className="w-4 h-4 -rotate-45" />
          </div>
          <span className="font-bold text-sm tracking-tight">Admin Console</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Admin Sidebar (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand header */}
        <div className="p-6 border-b border-slate-850 flex items-center justify-between">
          <Link href="/admin" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-md">
              <Wrench className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <span className="text-base font-black text-white tracking-tight flex items-center">
                GEAR<span className="text-orange-500">TRADE</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 block -mt-1">
                Admin Panel
              </span>
            </div>
          </Link>
        </div>

        {/* Admin User Info Pill */}
        <div className="px-6 py-4 border-b border-slate-850 bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 text-orange-400 border border-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <span className="inline-block mt-0.5 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                {user.role}
              </span>
              {user.role === "SUPER_ADMIN" && (
                <button
                  type="button"
                  onClick={openProfileEditor}
                  className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-white"
                >
                  <Pencil className="h-3 w-3" /> Edit profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1 text-xs">
          {adminNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold transition ${
                  isActive
                    ? "bg-orange-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-850 space-y-2 text-xs">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition font-medium text-[11px]"
          >
            <span className="flex items-center space-x-2">
              <ExternalLink className="w-3.5 h-3.5 text-orange-400" />
              <span>Live Storefront</span>
            </span>
            <span className="text-[10px] text-slate-500">New tab</span>
          </Link>

          <button
            onClick={logout}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/40 transition font-medium text-[11px]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Desktop Top Bar */}
        <header className="hidden lg:flex bg-white border-b border-slate-200 px-8 py-4 items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center space-x-3 text-xs text-slate-500">
            <span className="font-bold text-slate-900">GearTrade Automotive Administration</span>
            <span>•</span>
            <span className="font-mono text-emerald-600 font-bold flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Database Connected</span>
            </span>
          </div>

          <div className="flex items-center space-x-4 text-xs font-bold">
            <Link
              href="/admin/products/new"
              className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition"
            >
              + Add Used Part
            </Link>
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition flex items-center space-x-1"
            >
              <span>View Store</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">{children}</main>
      </div>
      {profileOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close profile editor"
            onClick={() => setProfileOpen(false)}
            className="absolute inset-0 bg-slate-950/70"
          />
          <section role="dialog" aria-modal="true" aria-labelledby="profile-editor-title" className="relative z-10 w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="profile-editor-title" className="text-lg font-bold text-slate-900">Edit Super Admin Profile</h2>
                <p className="mt-1 text-sm text-slate-500">Update your account contact details.</p>
              </div>
              <button type="button" aria-label="Close" onClick={() => setProfileOpen(false)} className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={saveProfile} className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700">
                Name
                <input required maxLength={100} value={profileForm.name} onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })} className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Email
                <input required type="email" value={profileForm.email} onChange={(event) => setProfileForm({ ...profileForm, email: event.target.value })} className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Phone
                <input type="tel" maxLength={30} value={profileForm.phone} onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })} className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
              </label>
              {profileError && <p role="alert" className="text-sm text-red-700">{profileError}</p>}
              {profileSuccess && <p role="status" className="text-sm text-emerald-700">{profileSuccess}</p>}
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button type="button" onClick={() => setProfileOpen(false)} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Close</button>
                <button type="submit" disabled={profileSaving} className="rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50">{profileSaving ? "Saving..." : "Save profile"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
