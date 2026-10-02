import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon || coupon.status !== "ACTIVE") {
      return NextResponse.json({ error: "Invalid or expired coupon code" }, { status: 400 });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "This coupon code usage limit has been reached" }, { status: 400 });
    }

    if (subtotal < coupon.minimumOrder) {
      return NextResponse.json(
        { error: `This coupon requires a minimum cart value of ₹${coupon.minimumOrder}` },
        { status: 400 }
      );
    }

    let discount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      const calculated = (subtotal * coupon.discountValue) / 100;
      discount = coupon.maximumDiscount ? Math.min(calculated, coupon.maximumDiscount) : calculated;
    } else {
      discount = coupon.discountValue;
    }

    return NextResponse.json({
      ok: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discount,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Validation failed" }, { status: 500 });
  }
}
