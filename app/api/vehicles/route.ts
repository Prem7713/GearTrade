import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const vehicleType = searchParams.get("type"); // CAR or BIKE

    const where: any = {};
    if (vehicleType && (vehicleType === "CAR" || vehicleType === "BIKE")) {
      where.vehicleType = vehicleType;
    }

    const brands = await prisma.vehicleBrand.findMany({
      where,
      include: {
        models: {
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ brands });
  } catch (error) {
    console.error("Vehicles API error:", error);
    return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 });
  }
}
