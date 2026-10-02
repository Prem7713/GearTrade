import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const customers = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      include: {
        orders: {
          select: { total: true, orderStatus: true },
        },
        offers: {
          select: { id: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = customers.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      status: c.status,
      avatar: c.avatar,
      createdAt: c.createdAt,
      orderCount: c.orders.length,
      totalSpent: c.orders.reduce((acc, o) => acc + o.total, 0),
      offerCount: c.offers.length,
    }));

    return NextResponse.json({ customers: formatted });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { customerId, status } = await req.json();

    const updated = await prisma.user.update({
      where: { id: customerId },
      data: { status },
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        adminEmail: admin.email,
        action: `CUSTOMER_STATUS_${status}`,
        entity: "USER",
        entityId: customerId,
      },
    });

    return NextResponse.json({ ok: true, customer: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}
