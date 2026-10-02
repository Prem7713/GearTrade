import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Super Admin access required" }, { status: 403 });
  }

  try {
    const body: unknown = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid profile details" }, { status: 400 });
    }

    const values = body as { name?: unknown; email?: unknown; phone?: unknown };
    const name = typeof values.name === "string" ? values.name.trim() : "";
    const email = typeof values.email === "string" ? values.email.trim().toLowerCase() : "";
    const phone = typeof values.phone === "string" ? values.phone.trim() : "";

    if (!name || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid name and email address" }, { status: 400 });
    }
    if (phone.length > 30) {
      return NextResponse.json({ error: "Phone number is too long" }, { status: 400 });
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: admin.id },
        data: { name, email, phone: phone || null },
        select: { id: true, name: true, email: true, phone: true, role: true, avatar: true },
      });

      await tx.auditLog.create({
        data: {
          adminId: admin.id,
          adminEmail: admin.email,
          action: "SUPER_ADMIN_PROFILE_UPDATED",
          entity: "USER",
          entityId: admin.id,
          metadata: JSON.stringify({ name, email, phone: phone || null }),
        },
      });

      return updated;
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "That email address is already in use" }, { status: 409 });
    }
    console.error("Super Admin profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
