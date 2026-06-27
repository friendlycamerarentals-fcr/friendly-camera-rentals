import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const createSlug = (text = "") =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const formatPricingKey = ({ unit, duration }) => {
  const count = Number(duration) || 0;
  const normalizedUnit = (unit || "hour").toLowerCase();

  if (normalizedUnit === "hour") {
    return `${count}${count === 1 ? "hr" : "hrs"}`;
  }

  if (normalizedUnit === "day") {
    return `${count}${count === 1 ? "day" : "days"}`;
  }

  return `${count}${count === 1 ? "week" : "weeks"}`;
};

const createPricingObject = (pricing) => {
  if (!pricing) {
    return {};
  }

  if (Array.isArray(pricing)) {
    return pricing.reduce((acc, item) => {
      const key = formatPricingKey(item);
      const price = Number(item.price || 0);
      const duration = Number(item.duration || 0);

      if (!key || price <= 0 || duration <= 0) {
        return acc;
      }

      acc[key] = price;
      return acc;
    }, {});
  }

  if (typeof pricing === "object") {
    return pricing;
  }

  return {};
};

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    const product = await prisma.rentalProduct.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
  const { id } = await params;

  try {
    const body = await request.json();

    const existingProduct = await prisma.rentalProduct.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 },
      );
    }

    const slug =
      body.slug ||
      existingProduct.slug ||
      createSlug(body.name ?? existingProduct.name);

    const pricing =
      body.pricing !== undefined
        ? createPricingObject(body.pricing)
        : existingProduct.pricing;

    const specifications =
      body.specifications !== undefined
        ? body.specifications
        : (existingProduct.specifications ?? {
            megapixels: body.megapixels ?? existingProduct.megapixels ?? "",
            batteries: Number(body.batteries ?? existingProduct.batteries ?? 0),
          });

    const product = await prisma.rentalProduct.update({
      where: {
        id,
      },
      data: {
        name: body.name ?? existingProduct.name,
        slug,
        brand: body.brand ?? existingProduct.brand,
        model: body.model ?? existingProduct.model,
        category: body.category ?? existingProduct.category,
        description: body.description ?? existingProduct.description ?? "",
        megapixels: body.megapixels ?? existingProduct.megapixels ?? "",
        batteries: Number(body.batteries ?? existingProduct.batteries ?? 0),
        available: body.available ?? existingProduct.available ?? true,
        image: body.image ?? existingProduct.image ?? "",
        images: Array.isArray(body.images)
          ? body.images
          : (existingProduct.images ?? []),
        pricing,
        specifications,
      },
    });

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update product",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;

  try {
    await prisma.rentalProduct.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete product",
      },
      { status: 500 },
    );
  }
}
