"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/user-context";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import CartDrawer from "@/components/CartDrawer";
import {
  Wrench,
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  ShieldCheck,
  Truck,
  Handshake,
  LayoutDashboard,
  Package,
  LogOut,
  ChevronDown,
} from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const { user, logout, isAdmin } = useUser();
  const { totalCount, setIsCartOpen } = useCart();
  const { wishlistIds } = useWishlist();

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Top Banner Bar */}
      <div className="bg-slate-950 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6 text-[11px] sm:text-xs">
            <span className="flex items-center space-x-1.5 text-orange-400 font-semibold">
              <Truck className="w-3.5 h-3.5" />
              <span>Pan-India Surface Logistics & Safe Crate Delivery</span>
            </span>
            <span className="hidden md:flex items-center space-x-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>30-Day Testing & Compatibility Warranty</span>
            </span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] font-medium">
            <Link href="/bargain" className="text-orange-400 hover:text-orange-300 flex items-center space-x-1 font-bold">
              <Handshake className="w-3.5 h-3.5" />
              <span>Make an Offer</span>
            </Link>
            <span className="text-slate-600">|</span>
            <Link href="/contact" className="hover:text-white transition">Support: +91 8000 123 456</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2.5 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-800 flex items-center justify-center text-orange-500 shadow-md border border-slate-700">
                <Wrench className="w-5 h-5 -rotate-45" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-slate-900 flex items-center">
                  GEAR<span className="text-orange-600">TRADE</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
                  Used Auto Spares
                </span>
              </div>
            </Link>

            {/* Desktop Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden lg:flex flex-1 max-w-lg mx-4">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by part name, OEM #, vehicle model (e.g. Creta headlight, Swift gearbox)..."
                  className="w-full bg-slate-100/90 border border-slate-300/80 rounded-xl pl-10 pr-20 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-hidden transition"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-slate-900 hover:bg-orange-600 text-white text-[11px] font-bold transition"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Actions: Wishlist, Cart, Profile */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Wishlist */}
              <Link
                href="/account/wishlist"
                className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistIds.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {wishlistIds.length}
                  </span>
                )}
              </Link>

              {/* Cart Drawer Trigger */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition flex items-center"
                title="Shopping Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-orange-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {totalCount}
                  </span>
                )}
              </button>

              {/* User Dropdown / Auth CTA */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 py-1.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 transition"
                  >
                    <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline-block text-xs font-bold text-slate-800 max-w-[100px] truncate">
                      {user.name.split(" ")[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-xs"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      </div>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center space-x-2 px-4 py-2.5 text-orange-600 font-bold hover:bg-orange-50 transition"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          <span>Admin Control Panel</span>
                        </Link>
                      )}

                      <Link
                        href="/account"
                        className="flex items-center space-x-2 px-4 py-2 text-slate-700 hover:bg-slate-50 transition"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Customer Dashboard</span>
                      </Link>

                      <Link
                        href="/account/orders"
                        className="flex items-center space-x-2 px-4 py-2 text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        <span>My Orders</span>
                      </Link>

                      <Link
                        href="/account/offers"
                        className="flex items-center space-x-2 px-4 py-2 text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Handshake className="w-4 h-4 text-orange-500" />
                        <span>My Bargains & Offers</span>
                      </Link>

                      <div className="border-t border-slate-100 my-1" />

                      <button
                        onClick={logout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-rose-600 hover:bg-rose-50 transition text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/login"
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 hover:text-orange-600 hover:bg-slate-100 transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="hidden sm:inline-flex px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs transition"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile Menu Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Desktop Sub Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8 py-2.5 border-t border-slate-100 text-xs font-bold text-slate-700">
            <Link href="/" className="hover:text-orange-600 transition">
              Home
            </Link>
            <Link href="/shop" className="hover:text-orange-600 transition">
              Shop All Parts
            </Link>
            <Link href="/cars" className="hover:text-orange-600 transition flex items-center space-x-1">
              <span>Car Parts</span>
            </Link>
            <Link href="/bikes" className="hover:text-orange-600 transition flex items-center space-x-1">
              <span>Bike Parts</span>
            </Link>
            <Link href="/categories" className="hover:text-orange-600 transition">
              Categories
            </Link>
            <Link href="/bargain" className="text-orange-600 hover:text-orange-700 transition flex items-center space-x-1 font-extrabold">
              <Handshake className="w-3.5 h-3.5" />
              <span>Bargain / Make an Offer</span>
            </Link>
            <Link href="/about" className="hover:text-orange-600 transition">
              About Us
            </Link>
            <Link href="/faq" className="hover:text-orange-600 transition">
              FAQ
            </Link>
            <Link href="/contact" className="hover:text-orange-600 transition">
              Contact
            </Link>
          </nav>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search parts, models, OEM numbers..."
                  className="w-full bg-slate-100 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 outline-hidden"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </form>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-800">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100"
              >
                Home
              </Link>
              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100"
              >
                Shop All Parts
              </Link>
              <Link
                href="/cars"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100"
              >
                Car Parts
              </Link>
              <Link
                href="/bikes"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100"
              >
                Bike Parts
              </Link>
              <Link
                href="/categories"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100"
              >
                Categories
              </Link>
              <Link
                href="/bargain"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg bg-orange-50 text-orange-600 font-extrabold"
              >
                Make an Offer
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100"
              >
                Contact Us
              </Link>
            </div>

            {isAdmin && (
              <div className="pt-2 border-t border-slate-100">
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-2.5 text-center rounded-xl bg-slate-900 text-orange-400 text-xs font-bold"
                >
                  Go to Admin Panel
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Cart Drawer component */}
      <CartDrawer />
    </>
  );
}
