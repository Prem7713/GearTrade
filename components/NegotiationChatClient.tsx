"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Check, LoaderCircle, MessageSquare, RefreshCw, Send, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface NegotiationMessage {
  id: string;
  senderId: string;
  senderRole: string;
  message: string;
  offerAmount: number | null;
  createdAt: Date | string;
  sender: { id: string; name: string; role: string };
}

interface NegotiationOffer {
  id: string;
  offerNumber: string;
  status: string;
  originalPrice: number;
  currentOffer: number;
  roundsCount: number;
  maxRounds: number;
  expiresAt: Date | string;
  checkoutToken: string | null;
  product: {
    name: string;
    slug: string;
    price: number;
    images: { imageUrl: string }[];
    brand: { name: string };
    model: { name: string };
  };
  messages: NegotiationMessage[];
}

interface NegotiationChatClientProps {
  offerId?: string;
  initialOffer?: NegotiationOffer;
  currentUserId?: string;
  isAdmin: boolean;
}

export default function NegotiationChatClient({
  offerId: suppliedOfferId,
  initialOffer,
  currentUserId,
  isAdmin,
}: NegotiationChatClientProps) {
  const [offer, setOffer] = useState<NegotiationOffer | null>(initialOffer ?? null);
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(!initialOffer);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [error, setError] = useState("");
  const id = suppliedOfferId ?? initialOffer?.id;

  async function refreshOffer() {
    if (!id) return;

    const response = await fetch(`/api/offers/${id}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not load this negotiation.");
    setOffer(data.offer as NegotiationOffer);
  }

  useEffect(() => {
    if (initialOffer || !id) return;

    let cancelled = false;
    async function loadOffer() {
      try {
        const response = await fetch(`/api/offers/${id}`, { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load this negotiation.");
        if (!cancelled) setOffer(data.offer as NegotiationOffer);
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Could not load this negotiation.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadOffer();
    return () => {
      cancelled = true;
    };
  }, [id, initialOffer]);

  async function performAction(action: "MESSAGE" | "COUNTER" | "ACCEPT" | "REJECT") {
    if (!id) return;
    setBusyAction(action);
    setError("");

    try {
      const response = await fetch(`/api/offers/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          message: message.trim() || undefined,
          amount: action === "COUNTER" ? amount : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update this negotiation.");
      setMessage("");
      if (action === "COUNTER") setAmount("");
      await refreshOffer();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Something went wrong.");
    } finally {
      setBusyAction(null);
    }
  }

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (message.trim()) void performAction("MESSAGE");
  }

  if (loading) {
    return (
      <div className="flex min-h-72 items-center justify-center text-slate-500">
        <LoaderCircle className="mr-2 h-5 w-5 animate-spin" /> Loading negotiation...
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="mx-auto max-w-3xl p-8 text-center">
        <p className="font-semibold text-slate-900">Negotiation unavailable</p>
        <p className="mt-2 text-sm text-slate-500">{error || "This offer could not be found."}</p>
        <Link href={isAdmin ? "/admin/offers" : "/account/offers"} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-orange-700">
          <ArrowLeft className="h-4 w-4" /> Back to offers
        </Link>
      </div>
    );
  }

  const finalized = ["ACCEPTED", "REJECTED", "EXPIRED", "CANCELLED"].includes(offer.status);
  const canCounter = !finalized && offer.roundsCount < offer.maxRounds;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <Link href={isAdmin ? "/admin/offers" : "/account/offers"} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-orange-700">
        <ArrowLeft className="h-4 w-4" /> Back to offers
      </Link>

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-orange-700">Offer {offer.offerNumber}</p>
              <h1 className="mt-1 text-xl font-bold text-slate-900">Negotiation</h1>
            </div>
            <span className="rounded-sm bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{offer.status.replaceAll("_", " ")}</span>
          </header>

          <div className="max-h-[34rem] min-h-64 space-y-4 overflow-y-auto bg-slate-50 px-4 py-5 sm:px-6">
            {offer.messages.map((item) => {
              const ownMessage = currentUserId ? item.senderId === currentUserId : (item.senderRole === "ADMIN") === isAdmin;
              return (
                <div key={item.id} className={`flex ${ownMessage ? "justify-end" : "justify-start"}`}>
                  <article className={`max-w-[88%] rounded-lg border px-4 py-3 sm:max-w-[75%] ${ownMessage ? "border-orange-200 bg-orange-50" : "border-slate-200 bg-white"}`}>
                    <div className="flex items-center justify-between gap-5 text-xs">
                      <span className="font-bold text-slate-800">{ownMessage ? "You" : item.sender.name}</span>
                      <time className="shrink-0 text-slate-500">{new Date(item.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</time>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{item.message}</p>
                    {item.offerAmount !== null && (
                      <p className="mt-2 border-t border-slate-200 pt-2 text-sm font-bold text-orange-800">Offer: {formatPrice(item.offerAmount)}</p>
                    )}
                  </article>
                </div>
              );
            })}
            {offer.messages.length === 0 && <p className="py-16 text-center text-sm text-slate-500">No messages yet. Start the conversation below.</p>}
          </div>

          {error && <p role="alert" className="border-t border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700">{error}</p>}

          {!finalized && (
            <div className="border-t border-slate-200 p-4 sm:p-5">
              <form onSubmit={submitMessage} className="flex gap-2">
                <label htmlFor="offer-message" className="sr-only">Write a message</label>
                <input
                  id="offer-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Write a message..."
                  maxLength={1000}
                  className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
                <button type="submit" disabled={!message.trim() || busyAction !== null} aria-label="Send message" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-slate-900 text-white hover:bg-slate-700 disabled:opacity-50">
                  {busyAction === "MESSAGE" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </form>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {canCounter && (
                  <>
                    <label htmlFor="counter-amount" className="sr-only">Counter offer amount</label>
                    <input
                      id="counter-amount"
                      type="number"
                      min="1"
                      step="1"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      placeholder="Counter amount (₹)"
                      className="w-44 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
                    />
                    <button type="button" disabled={!amount || busyAction !== null} onClick={() => void performAction("COUNTER")} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50">
                      {busyAction === "COUNTER" ? "Sending..." : "Counter offer"}
                    </button>
                  </>
                )}
                <button type="button" disabled={busyAction !== null} onClick={() => void refreshOffer().catch((refreshError: Error) => setError(refreshError.message))} className="ml-auto inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
                  <RefreshCw className="h-4 w-4" /> Refresh
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                <button type="button" disabled={busyAction !== null} onClick={() => void performAction("ACCEPT")} className="inline-flex items-center gap-1.5 rounded-md bg-emerald-700 px-3.5 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
                  <Check className="h-4 w-4" /> Accept {formatPrice(offer.currentOffer)}
                </button>
                <button type="button" disabled={busyAction !== null} onClick={() => void performAction("REJECT")} className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50">
                  <X className="h-4 w-4" /> Decline offer
                </button>
                <span className="ml-auto self-center text-xs text-slate-500">Round {offer.roundsCount} of {offer.maxRounds}</span>
              </div>
            </div>
          )}
          {finalized && offer.checkoutToken && offer.status === "ACCEPTED" && (
            <div className="border-t border-emerald-100 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-900">
              Deal accepted. Checkout token: {offer.checkoutToken}
            </div>
          )}
        </section>

        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5">
          {offer.product.images[0]?.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={offer.product.images[0].imageUrl} alt={offer.product.name} className="mb-4 aspect-[4/3] w-full rounded-md bg-slate-100 object-cover" />
          )}
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{offer.product.brand.name} · {offer.product.model.name}</p>
          <h2 className="mt-1 font-bold text-slate-900">{offer.product.name}</h2>
          <Link href={`/products/${offer.product.slug}`} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-orange-700 hover:text-orange-800">
            <MessageSquare className="h-4 w-4" /> View part
          </Link>
          <dl className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Listed price</dt><dd className="font-semibold text-slate-800">{formatPrice(offer.originalPrice)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Current offer</dt><dd className="font-bold text-orange-800">{formatPrice(offer.currentOffer)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Product price</dt><dd className="font-semibold text-slate-800">{formatPrice(offer.product.price)}</dd></div>
          </dl>
        </aside>
      </div>
    </main>
  );
}