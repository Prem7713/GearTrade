import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminRoles = ["SUPER_ADMIN", "ADMIN", "SUPPORT_MANAGER"];
    const isAdmin = adminRoles.includes(user.role);

    const where: any = {};
    if (!isAdmin) {
      where.customerId = user.id;
    }

    const tickets = await prisma.supportTicket.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to open a support ticket" }, { status: 401 });
    }

    const body = await req.json();
    const { subject, category, description, orderId, priority } = body;

    if (!subject || !description) {
      return NextResponse.json({ error: "Subject and description are required" }, { status: 400 });
    }

    const count = await prisma.supportTicket.count();
    const ticketNumber = `TKT-${new Date().getFullYear()}-${String(count + 105).padStart(5, "0")}`;

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        customerId: user.id,
        orderId: orderId || null,
        subject: subject.trim(),
        category: category || "GENERAL",
        description: description.trim(),
        priority: priority || "MEDIUM",
        status: "OPEN",
        messages: {
          create: {
            senderId: user.id,
            senderRole: "CUSTOMER",
            message: description.trim(),
          },
        },
      },
      include: {
        messages: true,
      },
    });

    return NextResponse.json({ ok: true, ticket });
  } catch (error) {
    console.error("Support ticket POST error:", error);
    return NextResponse.json({ error: "Failed to create support ticket" }, { status: 500 });
  }
}
