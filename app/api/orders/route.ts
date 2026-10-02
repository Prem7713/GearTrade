import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
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
    const search = searchParams.get("search")?.trim();
    const requestedPage = Number.parseInt(searchParams.get("page") || "1", 10);
    const requestedLimit = Number.parseInt(searchParams.get("limit") || "20", 10);
    const page = Number.isFinite(requestedPage) ? Math.max(requestedPage, 1) : 1;
    const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 20;

    const adminRoles = ["SUPER_ADMIN", "ADMIN", "ORDER_MANAGER", "INVENTORY_MANAGER"];
    const isAdmin = adminRoles.includes(user.role);

    const where: Prisma.OrderWhereInput = {};
    if (!isAdmin) {
      where.customerId = user.id;
    }
    if (status && status !== "ALL") {
      where.orderStatus = status;
    }
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customerName: { contains: search } },
        { customerEmail: { contains: search } },
      ];
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { take: 1, orderBy: { sortOrder: "asc" } },
                },
              },
            },
          },
          payments: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({ orders, total, page, limit });
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      paymentMethod, // 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET' | 'COD'
      items, // array of { productId, quantity, checkoutToken }
      couponCode,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!shippingAddress || !customerName || !customerEmail || !customerPhone) {
      return NextResponse.json({ error: "Shipping details and contact information are required" }, { status: 400 });
    }

    // 1. Database Transaction to prevent race conditions when two customers buy the same unique part
    const order = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsToCreate = [];

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        if (product.isSold || product.stock <= 0) {
          throw new Error(`Sorry, "${product.name}" was just sold or is no longer available.`);
        }

        let finalPrice = product.price;

        // Check if an accepted offer exists for this customer/product
        if (item.checkoutToken) {
          const validOffer = await tx.offer.findFirst({
            where: {
              productId: product.id,
              checkoutToken: item.checkoutToken,
              status: "ACCEPTED",
              isCheckedOut: false,
            },
          });

          if (validOffer) {
            // Apply locked bargain price securely from the database offer record!
            finalPrice = validOffer.currentOffer;
            await tx.offer.update({
              where: { id: validOffer.id },
              data: { isCheckedOut: true },
            });
          }
        }

        const qty = item.quantity || 1;
        subtotal += finalPrice * qty;

        orderItemsToCreate.push({
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          price: finalPrice,
          quantity: qty,
          condition: product.condition,
          oemNumber: product.oemNumber,
        });

        // Deduct inventory and mark sold for unique parts
        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: { decrement: qty },
            isSold: true,
            status: "SOLD",
          },
        });
      }

      // Calculate Coupon Discount
      let discount = 0;
      if (couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: couponCode.trim().toUpperCase() },
        });

        if (coupon && coupon.status === "ACTIVE" && subtotal >= coupon.minimumOrder) {
          if (coupon.discountType === "PERCENTAGE") {
            const calculated = (subtotal * coupon.discountValue) / 100;
            discount = coupon.maximumDiscount ? Math.min(calculated, coupon.maximumDiscount) : calculated;
          } else {
            discount = coupon.discountValue;
          }

          await tx.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
          });
        }
      }

      const taxableAmount = Math.max(0, subtotal - discount);
      const shipping = taxableAmount > 5000 ? 0 : 250;
      const tax = Math.round(taxableAmount * 0.18); // 18% GST for automotive spares in India
      const total = taxableAmount + shipping + tax;

      const orderCount = await tx.order.count();
      const orderNumber = `ORD-${new Date().getFullYear()}-${String(orderCount + 90414).padStart(6, "0")}`;
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(orderCount + 101).padStart(5, "0")}`;
      const transactionId = `pay_GT_${Date.now().toString(36).toUpperCase()}_${Math.floor(1000 + Math.random() * 9000)}`;

      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: user?.id || null,
          customerName,
          customerEmail,
          customerPhone,
          subtotal,
          discount,
          couponCode: couponCode || null,
          shipping,
          tax,
          total,
          paymentStatus: paymentMethod === "COD" ? "PENDING" : "PAID",
          orderStatus: "CONFIRMED",
          paymentMethod: paymentMethod || "COD",
          paymentGateway: paymentMethod === "COD" ? "COD" : "RAZORPAY",
          transactionId,
          shippingAddress: typeof shippingAddress === "string" ? shippingAddress : JSON.stringify(shippingAddress),
          trackingNumber: `EXP-${Math.floor(10000000 + Math.random() * 90000000)}`,
          shippingCompany: "Blue Dart Surface Cargo",
          estimatedDelivery: "3-5 Business Days",
          invoiceNumber,
          gstNumber: "27AABCT8521P1Z4",
          items: {
            create: orderItemsToCreate,
          },
          payments: {
            create: {
              customerId: user?.id || null,
              paymentGateway: paymentMethod === "COD" ? "COD" : "RAZORPAY",
              transactionId,
              amount: total,
              status: paymentMethod === "COD" ? "PENDING" : "SUCCESS",
            },
          },
        },
        include: {
          items: true,
          payments: true,
        },
      });

      if (user) {
        await tx.notification.create({
          data: {
            userId: user.id,
            title: `Order Confirmed: #${newOrder.orderNumber}`,
            message: `Thank you for your order of ₹${total.toLocaleString("en-IN")}. Your used parts are being packed for inspection & dispatch.`,
            type: "ORDER",
            link: `/account/orders/${newOrder.id}`,
          },
        });
      }

      return newOrder;
    });

    return NextResponse.json({ ok: true, order });
  } catch (error: unknown) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process order. Please try again." },
      { status: 400 }
    );
  }
}
