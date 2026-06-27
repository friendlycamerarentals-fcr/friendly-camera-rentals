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
| GET SINGLE PRODUCT
|--------------------------------------------------------------------------
*/
export async function GET(_request, context) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing product id",
        },
        {
          status: 400,
        },
      );
    }

    const product = await prisma.buyProduct.findUnique({
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
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        status: normalizeStatus(product.status),
      },
    });
  } catch (error) {
    console.error("[BUY_PRODUCT_GET]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch product",
      },
      {
        status: 500,
      },
    );
  }
}

/*
|--------------------------------------------------------------------------
| UPDATE PRODUCT
|--------------------------------------------------------------------------
*/
export async function PUT(request, context) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing product id",
        },
        {
          status: 400,
        },
      );
    }

    const body = await request.json();

    const existingProduct = await prisma.buyProduct.findUnique({
      where: {
        id,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        {
          status: 404,
        },
      );
    }

    const updateData = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.brand !== undefined) updateData.brand = body.brand;
    if (body.model !== undefined) updateData.model = body.model;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.condition !== undefined) updateData.condition = body.condition;
    if (body.warranty !== undefined) updateData.warranty = body.warranty;
    if (body.status !== undefined)
      updateData.status = normalizeStatus(body.status);
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.price !== undefined) updateData.price = Number(body.price);
    if (body.image !== undefined) updateData.image = body.image;
    if (body.images !== undefined)
      updateData.images = Array.isArray(body.images)
        ? body.images
        : existingProduct.images || [];
    if (body.specifications !== undefined)
      updateData.specifications = body.specifications;
    if (body.accessories !== undefined)
      updateData.accessories = body.accessories;

    const updatedProduct = await prisma.buyProduct.update({
      where: {
        id,
      },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("[BUY_PRODUCT_UPDATE]", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to update product",
      },
      {
        status: 500,
      },
    );
  }
}

/*
|--------------------------------------------------------------------------
| DELETE PRODUCT
|--------------------------------------------------------------------------
*/
export async function DELETE(_request, context) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing product id",
        },
        {
          status: 400,
        },
      );
    }

    const existingProduct = await prisma.buyProduct.findUnique({
      where: {
        id,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        {
          status: 404,
        },
      );
    }

    await prisma.buyProduct.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("[BUY_PRODUCT_DELETE]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete product",
      },
      {
        status: 500,
      },
    );
  }
}
