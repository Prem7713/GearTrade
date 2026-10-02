import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }, { sku: id }],
      },
      include: {
        category: true,
        brand: true,
        model: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
        reviews: {
          where: { status: "APPROVED" },
          include: {
            customer: {
              select: { name: true, avatar: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        questions: {
          where: { isPublic: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
        : 5.0;

    return NextResponse.json({
      product: {
        ...product,
        averageRating: Number(avgRating.toFixed(1)),
        reviewCount: product.reviews.length,
      },
    });
  } catch (error) {
    console.error("Product GET single error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    const adminRoles = ["SUPER_ADMIN", "ADMIN", "INVENTORY_MANAGER", "ORDER_MANAGER"];

    if (!user || !adminRoles.includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { images, ...data } = body;

    if (data.price) data.price = parseFloat(data.price);
    if (data.comparePrice) data.comparePrice = parseFloat(data.comparePrice);
    if (data.minimumOfferPrice) data.minimumOfferPrice = parseFloat(data.minimumOfferPrice);
    if (data.stock !== undefined) data.stock = parseInt(data.stock, 10);
    if (data.year) data.year = parseInt(data.year, 10);

    const updated = await prisma.product.update({
      where: { id },
      data,
      include: { images: true, category: true, brand: true, model: true },
    });

    await prisma.auditLog.create({
      data: {
        adminId: user.id,
        adminEmail: user.email,
        action: "PRODUCT_UPDATED",
        entity: "PRODUCT",
        entityId: updated.id,
        metadata: JSON.stringify({ name: updated.name, price: updated.price, stock: updated.stock }),
      },
    });

    return NextResponse.json({ ok: true, product: updated });
  } catch (error) {
    console.error("Product PUT error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    const adminRoles = ["SUPER_ADMIN", "ADMIN", "INVENTORY_MANAGER"];

    if (!user || !adminRoles.includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if product has historical orders to prevent breaking order history (soft delete or status change)
    const orderItemsCount = await prisma.orderItem.count({ where: { productId: id } });
    if (orderItemsCount > 0) {
      await prisma.product.update({
        where: { id },
        data: { status: "ARCHIVED", stock: 0, isSold: true },
      });
    } else {
      await prisma.product.delete({ where: { id } });
    }

    await prisma.auditLog.create({
      data: {
        adminId: user.id,
        adminEmail: user.email,
        action: "PRODUCT_DELETED",
        entity: "PRODUCT",
        entityId: id,
        metadata: JSON.stringify({ softDelete: orderItemsCount > 0 }),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Product DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
