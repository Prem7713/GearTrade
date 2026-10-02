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

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        messages: {
          include: {
            sender: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const adminRoles = ["SUPER_ADMIN", "ADMIN", "SUPPORT_MANAGER"];
    const isAdmin = adminRoles.includes(user.role);

    if (!isAdmin && ticket.customerId !== user.id) {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch ticket" }, { status: 500 });
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

    const { message, status } = await req.json();
    if (!message?.trim()) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const adminRoles = ["SUPER_ADMIN", "ADMIN", "SUPPORT_MANAGER"];
    const isAdmin = adminRoles.includes(user.role);
    const senderRole = isAdmin ? "ADMIN" : "CUSTOMER";

    const newStatus = status || (isAdmin ? "WAITING_FOR_CUSTOMER" : "IN_PROGRESS");

    const updated = await prisma.supportTicket.update({
      where: { id },
      data: {
        status: newStatus,
        messages: {
          create: {
            senderId: user.id,
            senderRole,
            message: message.trim(),
          },
        },
      },
      include: {
        messages: {
          include: {
            sender: { select: { id: true, name: true, role: true } },
          },
        },
      },
    });

    return NextResponse.json({ ok: true, ticket: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to post message" }, { status: 500 });
  }
}
