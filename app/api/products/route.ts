import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const vehicleType = searchParams.get("vehicleType");
    const brand = searchParams.get("brand");
    const model = searchParams.get("model");
    const year = searchParams.get("year");
    const category = searchParams.get("category");
    const condition = searchParams.get("condition");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const featured = searchParams.get("featured");
    const sort = searchParams.get("sort") || "newest";
    const status = searchParams.get("status") || "PUBLISHED";
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const where: any = {};

    if (status !== "ALL") {
      where.status = status;
    }

    if (vehicleType && vehicleType !== "ALL") {
      where.vehicleType = vehicleType;
    }

    if (featured === "true") {
      where.isFeatured = true;
    }

    if (brand && brand !== "ALL") {
      where.brand = {
        OR: [{ id: brand }, { name: { contains: brand } }],
      };
    }

    if (model && model !== "ALL") {
      where.model = {
        OR: [{ id: model }, { name: { contains: model } }],
      };
    }

    if (year) {
      where.year = parseInt(year, 10);
    }

    if (category && category !== "ALL") {
      where.category = {
        OR: [{ id: category }, { slug: category }, { name: { contains: category } }],
      };
    }

    if (condition && condition !== "ALL") {
      where.condition = condition;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
        { sku: { contains: q } },
        { partNumber: { contains: q } },
        { oemNumber: { contains: q } },
        { brand: { name: { contains: q } } },
        { model: { name: { contains: q } } },
      ];
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "price-asc") orderBy = { price: "asc" };
    if (sort === "price-desc") orderBy = { price: "desc" };
    if (sort === "oldest") orderBy = { createdAt: "asc" };

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        brand: true,
        model: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
        reviews: {
          where: { status: "APPROVED" },
          select: { rating: true },
        },
      },
      orderBy,
      take: limit,
    });

    const formatted = products.map((p) => {
      const avgRating =
        p.reviews.length > 0
          ? p.reviews.reduce((acc, r) => acc + r.rating, 0) / p.reviews.length
          : 5.0;

      return {
        ...p,
        averageRating: Number(avgRating.toFixed(1)),
        reviewCount: p.reviews.length,
      };
    });

    return NextResponse.json({ products: formatted });
  } catch (error) {
    console.error("Products GET API error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const adminRoles = [
      "SUPER_ADMIN",
      "ADMIN",
      "INVENTORY_MANAGER",
      "ORDER_MANAGER",
    ];

    if (!user || !adminRoles.includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      description,
      categoryId,
      vehicleType,
      brandId,
      modelId,
      variant,
      year,
      fuelType,
      partNumber,
      oemNumber,
      condition,
      conditionRating,
      conditionNotes,
      cosmeticCondition,
      functionalCondition,
      mileage,
      inspectionStatus,
      damageDisclosure,
      hasDamage,
      price,
      comparePrice,
      minimumOfferPrice,
      stock,
      isFeatured,
      warranty,
      returnEligibility,
      location,
      images, // array of { imageUrl, caption, isDamagePhoto }
    } = body;

    if (!name || !categoryId || !brandId || !modelId || !price) {
      return NextResponse.json({ error: "Missing required product fields" }, { status: 400 });
    }

    const count = await prisma.product.count();
    const sku = `PART-${new Date().getFullYear()}-${String(count + 101).padStart(6, "0")}`;
    const baseSlug = slugify(name);
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const product = await prisma.product.create({
      data: {
        sku,
        name,
        slug,
        description: description || name,
        categoryId,
        vehicleType: vehicleType || "CAR",
        brandId,
        modelId,
        variant: variant || null,
        year: parseInt(year, 10) || new Date().getFullYear(),
        fuelType: fuelType || null,
        partNumber: partNumber || null,
        oemNumber: oemNumber || null,
        condition: condition || "GENUINE_USED",
        conditionRating: conditionRating || "EXCELLENT",
        conditionNotes: conditionNotes || null,
        cosmeticCondition: cosmeticCondition || null,
        functionalCondition: functionalCondition || null,
        mileage: mileage || null,
        inspectionStatus: inspectionStatus || "INSPECTED_TESTED",
        damageDisclosure: damageDisclosure || null,
        hasDamage: Boolean(hasDamage),
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        minimumOfferPrice: minimumOfferPrice ? parseFloat(minimumOfferPrice) : parseFloat(price) * 0.7,
        stock: parseInt(stock, 10) || 1,
        isFeatured: Boolean(isFeatured),
        warranty: warranty || "30-Day Testing Warranty",
        returnEligibility: returnEligibility || "7 Days Fitment Guarantee",
        location: location || "Pune Warehouse",
        images: {
          create: (images || []).map((img: any, idx: number) => ({
            imageUrl: img.imageUrl,
            caption: img.caption || null,
            isDamagePhoto: Boolean(img.isDamagePhoto),
            sortOrder: idx,
          })),
        },
      },
      include: {
        images: true,
        category: true,
        brand: true,
        model: true,
      },
    });

    // Log admin audit
    await prisma.auditLog.create({
      data: {
        adminId: user.id,
        adminEmail: user.email,
        action: "PRODUCT_CREATED",
        entity: "PRODUCT",
        entityId: product.id,
        metadata: JSON.stringify({ sku: product.sku, name: product.name, price: product.price }),
      },
    });

    return NextResponse.json({ ok: true, product });
  } catch (error) {
    console.error("Product POST error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
