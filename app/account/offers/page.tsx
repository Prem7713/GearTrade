import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatPrice, formatDate, getOfferStatusBadge } from "@/lib/utils";
import { Handshake, ArrowRight, Clock, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerOffersPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const offers = await prisma.offer.findMany({
    where: { customerId: user.id },
    include: {
      product: {
        include: {
          images: { take: 1, orderBy: { sortOrder: "asc" } },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
      <div className="pb-6 border-b border-slate-100 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">My Bargains & Negotiations</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track real-time counter-offers, chat with parts specialists, and unlock agreed discounts.
          </p>
        </div>
        <Link
          href="/bargain"
          className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition self-start sm:self-auto"
        >
          Make a New Offer
        </Link>
      </div>

      {offers.length === 0 ? (
        <div className="py-16 text-center text-xs">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
            <Handshake className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">No active negotiations</h3>
          <p className="text-slate-400 mt-1">
            You haven't made any offers yet. Click "Make an Offer" on any eligible part to negotiate.
          </p>
          <Link
            href="/shop"
            className="mt-4 inline-block px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
          >
            Explore Used Parts
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => {
            const statusBadge = getOfferStatusBadge(offer.status);
            const savings = offer.originalPrice - offer.currentOffer;
            const percent = Math.round((savings / offer.originalPrice) * 100);

            return (
              <div
                key={offer.id}
                className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-start space-x-4 min-w-0">
                  {offer.product.images?.[0] && (
                    <img
                      src={offer.product.images[0].imageUrl}
                      alt={offer.product.name}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 bg-white shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-900">{offer.offerNumber}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusBadge.bg}`}>
                        {statusBadge.label}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm mt-1 truncate max-w-md">
                      {offer.product.name}
                    </h3>

                    <div className="mt-1 flex items-center space-x-3 text-slate-500">
                      <span>Listed: {formatPrice(offer.originalPrice)}</span>
                      <span>•</span>
                      <span>
                        Current Bargain: <strong className="text-orange-600 font-bold">{formatPrice(offer.currentOffer)}</strong>
                      </span>
                      {savings > 0 && (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-bold text-[10px]">
                          Save {percent}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0 self-end sm:self-center">
                  <Link
                    href={`/account/offers/${offer.id}`}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition flex items-center space-x-1.5"
                  >
                    <span>Negotiation Room</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
