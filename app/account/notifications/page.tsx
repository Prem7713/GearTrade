"use client";

import React, { useState, useEffect } from "react";
import { Bell, CheckCircle2, Package, Handshake, Info } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";

export default function CustomerNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/account/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    await fetch("/api/account/notifications", { method: "POST" });
    fetchNotifications();
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
      <div className="pb-6 border-b border-slate-100 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Notifications</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time updates on counter-offers, shipment dispatches, and deals.
          </p>
        </div>
        <button
          onClick={markAllRead}
          className="text-xs font-bold text-orange-600 hover:text-orange-700"
        >
          Mark all as read
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="py-16 text-center text-xs">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
            <Bell className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">No notifications</h3>
          <p className="text-slate-400 mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {notifications.map((n) => (
            <div key={n.id} className="py-4 flex items-start space-x-3 text-xs">
              <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                {n.type === "ORDER" ? (
                  <Package className="w-4 h-4" />
                ) : n.type === "OFFER" ? (
                  <Handshake className="w-4 h-4" />
                ) : (
                  <Info className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">{n.title}</h4>
                  <span className="text-[11px] text-slate-400">{formatDateTime(n.createdAt)}</span>
                </div>
                <p className="text-slate-600 mt-0.5">{n.message}</p>
                {n.link && (
                  <Link
                    href={n.link}
                    className="inline-block mt-1 font-bold text-orange-600 hover:underline"
                  >
                    View Details →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
