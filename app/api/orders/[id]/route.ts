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

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
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
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const adminRoles = ["SUPER_ADMIN", "ADMIN", "ORDER_MANAGER", "INVENTORY_MANAGER"];
    const isAdmin = user && adminRoles.includes(user.role);

    // If order has customerId and viewer is logged in as someone else who is not admin
    if (order.customerId && (!user || (!isAdmin && user.id !== order.customerId))) {
      return NextResponse.json({ error: "Unauthorized access to order" }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Order GET single error:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    const adminRoles = ["SUPER_ADMIN", "ADMIN", "ORDER_MANAGER"];

    if (!user || !adminRoles.includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const {
      orderStatus,
      paymentStatus,
      trackingNumber,
      shippingCompany,
      estimatedDelivery,
      internalNotes,
    } = body;

    if (!orderStatus && !paymentStatus && trackingNumber === undefined && shippingCompany === undefined && estimatedDelivery === undefined && internalNotes === undefined) {
      return NextResponse.json({ error: "Provide at least one order field to update" }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        ...(orderStatus && { orderStatus }),
        ...(paymentStatus && { paymentStatus }),
        ...(trackingNumber !== undefined && { trackingNumber }),
        ...(shippingCompany !== undefined && { shippingCompany }),
        ...(estimatedDelivery !== undefined && { estimatedDelivery }),
        ...(internalNotes !== undefined && { internalNotes }),
      },
      include: { items: true },
    });

    if (updated.customerId && orderStatus) {
      await prisma.notification.create({
        data: {
          userId: updated.customerId,
          title: `Order Update: #${updated.orderNumber}`,
          message: `Your order status changed to ${orderStatus.replace(/_/g, " ")}. Tracking: ${updated.trackingNumber || "N/A"}.`,
          type: "ORDER",
          link: `/account/orders/${updated.id}`,
        },
      });
    }

    // Log admin audit
    await prisma.auditLog.create({
      data: {
        adminId: user.id,
        adminEmail: user.email,
        action: "ORDER_STATUS_UPDATED",
        entity: "ORDER",
        entityId: updated.id,
        metadata: JSON.stringify({ status: updated.orderStatus, tracking: updated.trackingNumber }),
      },
    });

    return NextResponse.json({ ok: true, order: updated });
  } catch (error) {
    console.error("Order PUT error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
