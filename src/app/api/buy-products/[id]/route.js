import { NextResponse } from "next/server";
import { query, transaction } from "@/db/query";
import {
  normalizeBuyProductStatus,
  updateBuyProductWithSoldEvent,
} from "@/lib/buyProductUpdate";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

    const rows = await query(
      'SELECT * FROM "BuyProduct" WHERE "id" = $1 LIMIT 1',
      [id],
    );
    const product = rows[0];

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
        status: normalizeBuyProductStatus(product.status),
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
    const result = await transaction((client) =>
      updateBuyProductWithSoldEvent(client, id, body),
    );

    if (result.notFound) {
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
      message: "Product updated successfully",
      data: result.product,
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

    const existingRows = await query(
      'SELECT * FROM "BuyProduct" WHERE "id" = $1 LIMIT 1',
      [id],
    );
    if (!existingRows[0]) {
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

    await query('DELETE FROM "BuyProduct" WHERE "id" = $1', [id]);

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
