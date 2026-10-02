"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LifeBuoy, Plus, ArrowRight, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function CustomerTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // Form fields
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [priority, setPriority] = useState("MEDIUM");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/support/tickets");
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, category, priority, description }),
      });

      if (res.ok) {
        setShowCreate(false);
        setSubject("");
        setDescription("");
        fetchTickets();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
      <div className="pb-6 border-b border-slate-100 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Support Desk & Complaints</h1>
          <p className="text-xs text-slate-500 mt-1">
            Need fitment help, have an issue with delivery, or request a return? Open a ticket below.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{showCreate ? "Cancel" : "Open New Support Ticket"}</span>
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Create Support Ticket</h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Compatibility question on Swift K12 gearbox mount"
              className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-hidden focus:border-orange-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-800 outline-hidden"
              >
                <option value="GENERAL">General Technical Inquiry</option>
                <option value="PART_ISSUE">Part Fitment or Condition Issue</option>
                <option value="DELIVERY">Delivery & Courier Tracking</option>
                <option value="RETURN_REFUND">Return / Replacement Request</option>
                <option value="BARGAIN">Bargaining or Negotiation Query</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-800 outline-hidden"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High (Urgent Vehicle Repair)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your issue or question in detail..."
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 outline-hidden focus:border-orange-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs"
          >
            {submitting ? "Opening Ticket..." : "Submit Support Ticket"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading support tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400">No support tickets found.</div>
      ) : (
        <div className="divide-y divide-slate-100">
          {tickets.map((t) => (
            <div key={t.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-slate-900">{t.ticketNumber}</span>
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold text-[10px]">
                    {t.status}
                  </span>
                  <span className="text-slate-400">• {formatDate(t.createdAt)}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mt-1">{t.subject}</h3>
                <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{t.description}</p>
              </div>

              <div>
                <Link
                  href={`/account/tickets/${t.id}`}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition flex items-center space-x-1"
                >
                  <span>View Ticket</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
