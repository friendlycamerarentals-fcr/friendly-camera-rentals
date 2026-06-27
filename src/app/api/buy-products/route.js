import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const normalizeStatus = (status) => {
  if (!status) return "In Stock";

  const value = String(status).trim().toLowerCase();

  if (value === "available" || value === "in stock") {
    return "In Stock";
  }

  if (value === "reserved" || value === "out of stock") {
    return "Out of Stock";
  }

  if (value === "sold") {
    return "Sold";
  }

  return status;
};

/*
|--------------------------------------------------------------------------
| GET ALL PRODUCTS
|--------------------------------------------------------------------------
*/
export async function GET() {
  try {
    const products = await prisma.buyProduct.findMany({
      orderBy: [
        {
          display_order: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    const normalizedProducts = products.map((product) => ({
      ...product,
      status: normalizeStatus(product.status),
    }));

    return NextResponse.json({
      success: true,
      data: normalizedProducts,
    });
  } catch (error) {
    console.error("[BUY_PRODUCTS_GET]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch products",
      },
      {
        status: 500,
      },
    );
  }
}

/*
|--------------------------------------------------------------------------
| CREATE PRODUCT
|--------------------------------------------------------------------------
*/
export async function POST(request) {
  try {
    const body = await request.json();

    // Get the highest display_order to set new product at the end
    const lastProduct = await prisma.buyProduct.findFirst({
      orderBy: {
        display_order: "desc",
      },
      select: {
        display_order: true,
      },
    });

    const nextDisplayOrder = (lastProduct?.display_order ?? -1) + 1;

    const product = await prisma.buyProduct.create({
      data: {
        name: body.name,
        slug: body.slug,

        brand: body.brand,
        model: body.model,
        category: body.category,

        condition: body.condition || "",
        warranty: body.warranty || "",

        status: normalizeStatus(body.status),

        description: body.description || "",

        price: Number(body.price || 0),
        image: body.image || "",
        images: body.images || [],

        specifications: body.specifications || [],

        accessories: body.accessories || [],

        display_order: nextDisplayOrder,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        data: product,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("[BUY_PRODUCTS_POST]", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      },
    );
  }
}
