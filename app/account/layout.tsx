"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/lib/user-context";
import {
  User,
  Package,
  Handshake,
  Heart,
  MapPin,
  LifeBuoy,
  Bell,
  Settings,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout, isAdmin } = useUser();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname || "/account")}`);
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const navLinks = [
    { label: "Dashboard Overview", href: "/account", icon: LayoutDashboard },
    { label: "My Orders & Tracking", href: "/account/orders", icon: Package },
    { label: "My Bargains & Offers", href: "/account/offers", icon: Handshake },
    { label: "Saved Wishlist", href: "/account/wishlist", icon: Heart },
    { label: "Delivery Addresses", href: "/account/addresses", icon: MapPin },
    { label: "Support Tickets", href: "/account/tickets", icon: LifeBuoy },
    { label: "Notifications", href: "/account/notifications", icon: Bell },
    { label: "Account Settings", href: "/account/settings", icon: Settings },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Customer Left Sidebar */}
          <aside className="lg:col-span-3 space-y-4">
            {/* User Profile Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs text-center">
              <div className="w-16 h-16 rounded-full bg-slate-900 text-white mx-auto flex items-center justify-center text-xl font-bold border-2 border-orange-500 shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="mt-3 font-bold text-base text-slate-900 truncate">{user.name}</h2>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
              {user.phone && <p className="text-[11px] text-slate-500 mt-0.5">{user.phone}</p>}

              {isAdmin && (
                <Link
                  href="/admin"
                  className="mt-4 block w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-orange-400 font-bold text-xs transition"
                >
                  Admin Portal →
                </Link>
              )}
            </div>

            {/* Navigation links */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-3 shadow-xs space-y-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-xs font-bold transition ${
                      isActive
                        ? "bg-orange-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <div className="pt-2 border-t border-slate-100 my-1">
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Customer Content Area */}
          <main className="lg:col-span-9">{children}</main>
        </div>
      </div>
    </div>
  );
}
