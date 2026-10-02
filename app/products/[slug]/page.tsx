import React from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/ProductDetailClient";
import type { Metadata } from "next";

export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: {
      OR: [{ slug }, { id: slug }, { sku: slug }],
    },
    include: { brand: true, model: true },
  });

  if (!product) {
    return { title: "Product Not Found | GearTrade India" };
  }

  return {
    title: `${product.name} | Used Auto Parts | GearTrade`,
    description: `Buy verified tested ${product.name} compatible with ${product.brand.name} ${product.model.name}. Condition: ${product.condition}. Make an offer on GearTrade India.`,
    openGraph: {
      title: `${product.name} — Used OEM Auto Spare`,
      description: `Tested & Inspected ${product.brand.name} ${product.model.name} part. Available for instant dispatch with 30-day testing warranty.`,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findFirst({
    where: {
      OR: [{ slug }, { id: slug }, { sku: slug }],
    },
    include: {
      category: true,
      brand: true,
      model: true,
      images: { orderBy: { sortOrder: "asc" } },
      reviews: {
        where: { status: "APPROVED" },
        include: { customer: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
      },
      questions: {
        where: { isPublic: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
      : 5.0;

  const formattedProduct = {
    ...product,
    averageRating: Number(avgRating.toFixed(1)),
    reviewCount: product.reviews.length,
  };

  return <ProductDetailClient product={formattedProduct} />;
}
