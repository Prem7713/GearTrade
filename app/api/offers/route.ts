import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const adminRoles = ["SUPER_ADMIN", "ADMIN", "INVENTORY_MANAGER", "ORDER_MANAGER"];
    const isAdmin = adminRoles.includes(user.role);

    const where: any = {};
    if (!isAdmin) {
      where.customerId = user.id;
    }
    if (status && status !== "ALL") {
      where.status = status;
    }

    const offers = await prisma.offer.findMany({
      where,
      include: {
        product: {
          include: {
            images: { take: 1, orderBy: { sortOrder: "asc" } },
            brand: true,
            model: true,
          },
        },
        customer: {
          select: { id: true, name: true, email: true, phone: true, avatar: true },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ offers });
  } catch (error) {
    console.error("Offers GET error:", error);
    return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to make an offer on this part" }, { status: 401 });
    }

    const { productId, offerAmount, message } = await req.json();

    if (!productId || !offerAmount || isNaN(offerAmount)) {
      return NextResponse.json({ error: "Valid product ID and offer amount are required" }, { status: 400 });
    }

    const amount = parseFloat(offerAmount);

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.isSold || product.stock <= 0) {
      return NextResponse.json({ error: "This unique part has already been sold." }, { status: 400 });
    }

    // Minimum bargaining threshold rule: Cannot offer lower than 50% of listed price
    const minThreshold = product.price * 0.5;
    if (amount < minThreshold) {
      return NextResponse.json(
        { error: `Offers below 50% of the listed price (₹${minThreshold.toFixed(0)}) cannot be accepted.` },
        { status: 400 }
      );
    }

    if (amount >= product.price) {
      return NextResponse.json(
        { error: "Your offer must be lower than the current listed price. You can use 'Buy Now' directly!" },
        { status: 400 }
      );
    }

    const offerCount = await prisma.offer.count();
    const offerNumber = `OFF-${new Date().getFullYear()}-${String(offerCount + 101).padStart(5, "0")}`;
    const expiresAt = new Date(Date.now() + 48 * 3600 * 1000); // 48h validity

    // Check if auto-acceptable (e.g. customer offer >= minimumOfferPrice set by admin)
    // If so, we can auto-accept immediately or leave under review!
    const isAutoAccept = product.minimumOfferPrice && amount >= product.minimumOfferPrice;

    const offer = await prisma.offer.create({
      data: {
        offerNumber,
        productId: product.id,
        customerId: user.id,
        originalPrice: product.price,
        currentOffer: amount,
        customerNote: message || null,
        status: isAutoAccept ? "ACCEPTED" : "PENDING",
        roundsCount: 1,
        maxRounds: 4,
        expiresAt,
        acceptedAt: isAutoAccept ? new Date() : null,
        checkoutToken: isAutoAccept ? `CHK-OFF-${Date.now().toString(36).toUpperCase()}` : null,
        messages: {
          create: [
            {
              senderId: user.id,
              senderRole: "CUSTOMER",
              message: message ? message.trim() : `Customer submitted initial offer of ₹${amount}`,
              offerAmount: amount,
            },
            ...(isAutoAccept
              ? [
                  {
                    senderId: user.id, // automated system response
                    senderRole: "ADMIN",
                    message: `Great news! Your offer of ₹${amount} meets our auto-acceptance criteria. Deal accepted! You can proceed to checkout.`,
                    offerAmount: amount,
                  },
                ]
              : []),
          ],
        },
      },
      include: {
        product: true,
        messages: true,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: isAutoAccept ? "Offer Accepted!" : "Offer Submitted Successfully",
        message: isAutoAccept
          ? `Your offer of ₹${amount} for ${product.name} was accepted! Click to proceed to checkout.`
          : `Your offer of ₹${amount} for ${product.name} is under review by our parts specialist.`,
        type: "OFFER",
        link: `/account/offers/${offer.id}`,
      },
    });

    return NextResponse.json({ ok: true, offer });
  } catch (error) {
    console.error("Offer creation error:", error);
    return NextResponse.json({ error: "Failed to submit offer" }, { status: 500 });
  }
}
