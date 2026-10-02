"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Send, LifeBuoy, User, Headphones, CheckCircle2 } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function CustomerTicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchTicket = async () => {
    try {
      const res = await fetch(`/api/support/tickets/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTicket(data.ticket);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/support/tickets/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyMessage.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setTicket(data.ticket);
        setReplyMessage("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-xs text-slate-400">Loading ticket...</div>;
  }

  if (!ticket) {
    return <div className="py-12 text-center text-xs text-slate-400">Ticket not found.</div>;
  }

  return (
    <div className="space-y-6">
      <Link
        href="/account/tickets"
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Tickets</span>
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-8">
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-mono text-orange-400 font-bold">#{ticket.ticketNumber}</span>
            <span>•</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold">
              {ticket.status}
            </span>
            <span>•</span>
            <span className="text-slate-400">Category: {ticket.category}</span>
          </div>
          <h1 className="text-xl font-bold mt-2">{ticket.subject}</h1>
        </div>

        {/* Message Log */}
        <div className="p-6 sm:p-8 space-y-4 max-h-[460px] overflow-y-auto bg-slate-50/50">
          {ticket.messages && ticket.messages.map((msg: any) => {
            const isAdmin = msg.senderRole === "ADMIN";
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isAdmin ? "items-start" : "items-end"}`}
              >
                <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mb-1 px-1">
                  {isAdmin ? (
                    <span className="font-bold text-orange-600 flex items-center space-x-1">
                      <Headphones className="w-3 h-3" />
                      <span>GearTrade Support Team</span>
                    </span>
                  ) : (
                    <span className="font-bold text-slate-700 flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>You</span>
                    </span>
                  )}
                  <span>•</span>
                  <span>{formatDateTime(msg.createdAt)}</span>
                </div>

                <div
                  className={`max-w-lg rounded-2xl p-4 text-xs shadow-xs leading-relaxed ${
                    isAdmin
                      ? "bg-white text-slate-800 border border-slate-200 rounded-tl-xs"
                      : "bg-slate-900 text-white rounded-tr-xs"
                  }`}
                >
                  <p>{msg.message}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reply Box */}
        <div className="p-6 border-t border-slate-200 bg-white">
          <form onSubmit={handleSendReply} className="flex gap-2">
            <input
              type="text"
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Type your message or response..."
              className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-xs text-slate-800 outline-hidden focus:border-orange-500"
            />
            <button
              type="submit"
              disabled={submitting || !replyMessage.trim()}
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-xs transition flex items-center space-x-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Reply</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
