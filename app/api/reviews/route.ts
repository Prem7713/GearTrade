import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    const where: any = {};
    if (productId) {
      where.productId = productId;
      where.status = "APPROVED";
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, avatar: true } },
        product: { select: { id: true, name: true, sku: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to submit a review" }, { status: 401 });
    }

    const body = await req.json();
    const { productId, orderId, rating, title, comment, conditionRating } = body;

    if (!productId || !rating || !comment) {
      return NextResponse.json({ error: "Product, rating, and review comment are required" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        productId,
        customerId: user.id,
        orderId: orderId || null,
        rating: parseInt(rating, 10),
        title: title || null,
        comment: comment.trim(),
        conditionRating: conditionRating || "EXCELLENT",
        isVerifiedPurchase: true,
        status: "APPROVED",
      },
      include: {
        customer: { select: { name: true, avatar: true } },
      },
    });

    return NextResponse.json({ ok: true, review });
  } catch (error) {
    console.error("Review creation error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
