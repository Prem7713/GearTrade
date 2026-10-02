import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: { isDefault: "desc" },
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, addressLine, city, state, pincode, type, isDefault } = body;

    if (!name || !phone || !addressLine || !city || !state || !pincode) {
      return NextResponse.json({ error: "All address fields are required" }, { status: 400 });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        name,
        phone,
        addressLine,
        city,
        state,
        pincode,
        type: type || "HOME",
        isDefault: Boolean(isDefault),
      },
    });

    return NextResponse.json({ ok: true, address });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save address" }, { status: 500 });
  }
}
