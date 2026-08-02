import { NextResponse } from "next/server";
import { transaction } from "@/db/query";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PUT(request) {
  try {
    const body = await request.json();
    const { productOrder } = body;

    if (!Array.isArray(productOrder)) {
      return NextResponse.json(
        {
          success: false,
          message: "productOrder must be an array",
        },
        { status: 400 },
      );
    }

    await transaction(async (client) => {
      for (const item of productOrder) {
        await client.query(
          'UPDATE "RentalProduct" SET "display_order" = $1 WHERE "id" = $2',
          [item.display_order, item.id],
        );
      }
    });

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
