import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const offer = await prisma.offer.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            images: { orderBy: { sortOrder: "asc" } },
            brand: true,
            model: true,
            category: true,
          },
        },
        customer: {
          select: { id: true, name: true, email: true, phone: true, avatar: true },
        },
        messages: {
          include: {
            sender: {
              select: { id: true, name: true, role: true, avatar: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    const adminRoles = ["SUPER_ADMIN", "ADMIN", "INVENTORY_MANAGER", "ORDER_MANAGER"];
    const isAdmin = adminRoles.includes(user.role);

    if (!isAdmin && offer.customerId !== user.id) {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    return NextResponse.json({ offer });
  } catch (error) {
    console.error("Offer GET single error:", error);
    return NextResponse.json({ error: "Failed to fetch offer" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, amount, message } = body; // action: 'ACCEPT' | 'REJECT' | 'COUNTER' | 'MESSAGE'

    const offer = await prisma.offer.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    const adminRoles = ["SUPER_ADMIN", "ADMIN", "INVENTORY_MANAGER", "ORDER_MANAGER"];
    const isAdmin = adminRoles.includes(user.role);

    if (!isAdmin && offer.customerId !== user.id) {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    if (["ACCEPTED", "REJECTED", "EXPIRED", "CANCELLED"].includes(offer.status)) {
      return NextResponse.json(
        { error: `This negotiation is already finalized (${offer.status}).` },
        { status: 400 }
      );
    }

    const senderRole = isAdmin ? "ADMIN" : "CUSTOMER";

    if (action === "ACCEPT") {
      const checkoutToken = `CHK-OFF-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const updated = await prisma.offer.update({
        where: { id },
        data: {
          status: "ACCEPTED",
          acceptedAt: new Date(),
          checkoutToken,
          messages: {
            create: {
              senderId: user.id,
              senderRole,
              message: message || `Deal Accepted at ₹${offer.currentOffer}! You may now proceed to checkout.`,
              offerAmount: offer.currentOffer,
            },
          },
        },
        include: {
          messages: {
            include: { sender: { select: { id: true, name: true, role: true } } },
          },
        },
      });

      // Notify customer if admin accepted, or notify admin if customer accepted
      const targetUserId = isAdmin ? offer.customerId : user.id;
      await prisma.notification.create({
        data: {
          userId: targetUserId,
          title: "Deal Accepted!",
          message: `Offer #${offer.offerNumber} has been accepted at ₹${offer.currentOffer}. Proceed to checkout to secure your part.`,
          type: "OFFER",
          link: `/account/offers/${offer.id}`,
        },
      });

      return NextResponse.json({ ok: true, offer: updated });
    }

    if (action === "REJECT") {
      const updated = await prisma.offer.update({
        where: { id },
        data: {
          status: "REJECTED",
          messages: {
            create: {
              senderId: user.id,
              senderRole,
              message: message || "Offer was declined.",
            },
          },
        },
        include: {
          messages: {
            include: { sender: { select: { id: true, name: true, role: true } } },
          },
        },
      });

      return NextResponse.json({ ok: true, offer: updated });
    }

    if (action === "COUNTER") {
      if (!amount || isNaN(amount)) {
        return NextResponse.json({ error: "Please enter a valid counter-offer amount" }, { status: 400 });
      }

      const counterAmount = parseFloat(amount);
      if (counterAmount <= 0) {
        return NextResponse.json({ error: "Amount must be greater than zero" }, { status: 400 });
      }

      if (offer.roundsCount >= offer.maxRounds) {
        return NextResponse.json(
          { error: `Maximum negotiation rounds (${offer.maxRounds}) reached for this deal.` },
          { status: 400 }
        );
      }

      const updated = await prisma.offer.update({
        where: { id },
        data: {
          currentOffer: counterAmount,
          status: "COUNTER_OFFER",
          roundsCount: { increment: 1 },
          messages: {
            create: {
              senderId: user.id,
              senderRole,
              message: message || `${senderRole === "ADMIN" ? "Specialist" : "Customer"} proposed counter-offer of ₹${counterAmount}`,
              offerAmount: counterAmount,
            },
          },
        },
        include: {
          messages: {
            include: { sender: { select: { id: true, name: true, role: true } } },
          },
        },
      });

      // Notification
      const targetUserId = isAdmin ? offer.customerId : user.id;
      if (isAdmin) {
        await prisma.notification.create({
          data: {
            userId: targetUserId,
            title: "New Counter-Offer Received",
            message: `Our specialist proposed ₹${counterAmount} for ${offer.product.name}. Check negotiation room.`,
            type: "OFFER",
            link: `/account/offers/${offer.id}`,
          },
        });
      }

      return NextResponse.json({ ok: true, offer: updated });
    }

    if (action === "MESSAGE") {
      if (!message?.trim()) {
        return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
      }

      await prisma.offerMessage.create({
        data: {
          offerId: id,
          senderId: user.id,
          senderRole,
          message: message.trim(),
        },
      });

      const updated = await prisma.offer.findUnique({
        where: { id },
        include: {
          messages: {
            include: { sender: { select: { id: true, name: true, role: true } } },
          },
        },
      });

      return NextResponse.json({ ok: true, offer: updated });
    }

    return NextResponse.json({ error: "Invalid negotiation action" }, { status: 400 });
  } catch (error) {
    console.error("Negotiation POST error:", error);
    return NextResponse.json({ error: "Failed to process negotiation" }, { status: 500 });
  }
}
