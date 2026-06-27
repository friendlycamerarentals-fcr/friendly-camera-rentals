import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.trim() || "";
    const category = url.searchParams.get("category")?.trim().toLowerCase();

    const where = {};

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          brand: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          model: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (category && category !== "all") {
      where.category = category;
    }

    const products = await prisma.rentalProduct.findMany({
      where,
      orderBy: [
        {
          display_order: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch products",
      },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const slug = body.slug || createSlug(body.name);
    const pricing = createPricingObject(body.pricing);
    const specifications = body.specifications || {
      megapixels: body.megapixels || "",
      batteries: Number(body.batteries || 0),
    };

    // Get the highest display_order to set new product at the end
    const lastProduct = await prisma.rentalProduct.findFirst({
      orderBy: {
        display_order: "desc",
      },
      select: {
        display_order: true,
      },
    });

    const nextDisplayOrder = (lastProduct?.display_order ?? -1) + 1;

    const product = await prisma.rentalProduct.create({
      data: {
        name: body.name,
        slug,
        brand: body.brand,
        model: body.model,
        category: body.category,
        description: body.description || "",
        megapixels: body.megapixels || "",
        batteries: Number(body.batteries || 0),
        available: body.available ?? true,
        image: body.image || "",
        images: body.images || [],
        pricing,
        specifications,
        display_order: nextDisplayOrder,
      },
    });

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error(error);
    const message =
      error?.code === "P2002" && error?.meta?.target?.includes("slug")
        ? "A product with this slug already exists."
        : error.message || "Failed to create product";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 },
    );
  }
}
