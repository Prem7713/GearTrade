import React from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import NegotiationChatClient from "@/components/NegotiationChatClient";

export const dynamic = "force-dynamic";

interface OfferDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerOfferDetailPage({ params }: OfferDetailPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const offer = await prisma.offer.findFirst({
    where: {
      id,
      customerId: user.id,
    },
    include: {
      product: {
        include: {
          images: { take: 1, orderBy: { sortOrder: "asc" } },
          brand: true,
          model: true,
        },
      },
      customer: {
        select: { id: true, name: true, email: true },
      },
      messages: {
        include: {
          sender: { select: { id: true, name: true, role: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!offer) {
    notFound();
  }

  return (
    <NegotiationChatClient
      initialOffer={offer}
      currentUserId={user.id}
      isAdmin={false}
    />
  );
}
