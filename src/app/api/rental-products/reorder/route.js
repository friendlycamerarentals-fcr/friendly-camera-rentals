import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/*
|--------------------------------------------------------------------------
| REORDER PRODUCTS
|--------------------------------------------------------------------------
*/
export async function PUT(request) {
  try {
    const body = await request.json();
    const { productOrder } = body; // Array of { id, display_order }

    if (!Array.isArray(productOrder)) {
      return NextResponse.json(
        {
          success: false,
          message: "productOrder must be an array",
        },
        { status: 400 },
      );
    }

    // Use transaction to ensure all updates succeed or all fail
    const updates = productOrder.map((item) =>
      prisma.rentalProduct.update({
        where: { id: item.id },
        data: { display_order: item.display_order },
      }),
    );

    await prisma.$transaction(updates);

    return NextResponse.json({
      success: true,
      message: "Products reordered successfully",
    });
  } catch (error) {
    console.error("[RENTAL_PRODUCTS_REORDER]", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to reorder products",
      },
      { status: 500 },
    );
  }
}
