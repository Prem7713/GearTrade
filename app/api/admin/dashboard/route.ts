import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const adminRoles = ["SUPER_ADMIN", "ADMIN", "INVENTORY_MANAGER", "ORDER_MANAGER", "SUPPORT_MANAGER", "CONTENT_MANAGER"];

    if (!user || !adminRoles.includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const [
      totalOrders,
      orders,
      totalCustomers,
      totalProducts,
      soldProducts,
      offers,
      recentOrders,
      recentOffers,
      openTickets,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.findMany({ select: { total: true, orderStatus: true, paymentStatus: true } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.product.count(),
      prisma.product.count({ where: { isSold: true } }),
      prisma.offer.findMany({ select: { status: true, currentOffer: true, originalPrice: true } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { items: true },
      }),
      prisma.offer.findMany({
        take: 5,
        orderBy: { updatedAt: "desc" },
        include: {
          product: { select: { name: true, sku: true, price: true } },
          customer: { select: { name: true, email: true } },
        },
      }),
      prisma.supportTicket.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    ]);

    const totalSales = orders
      .filter((o) => o.paymentStatus === "PAID" || o.orderStatus !== "CANCELLED")
      .reduce((acc, o) => acc + o.total, 0);

    const pendingOffers = offers.filter((o) => o.status === "PENDING" || o.status === "COUNTER_OFFER").length;
    const acceptedOffers = offers.filter((o) => o.status === "ACCEPTED").length;
    const offerAcceptanceRate = offers.length > 0 ? Math.round((acceptedOffers / offers.length) * 100) : 0;

    return NextResponse.json({
      metrics: {
        totalSales,
        totalOrders,
        totalCustomers,
        totalProducts,
        soldProducts,
        availableProducts: totalProducts - soldProducts,
        pendingOffers,
        acceptedOffers,
        offerAcceptanceRate,
        openTickets,
      },
      recentOrders,
      recentOffers,
    });
  } catch (error) {
    console.error("Admin dashboard API error:", error);
    return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 });
  }
}
