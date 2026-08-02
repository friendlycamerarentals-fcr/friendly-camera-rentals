import { NextResponse } from "next/server";
import { query } from "@/db/query";

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
    const existingRows = await query(
      'SELECT * FROM "BuyProduct" WHERE "id" = $1 LIMIT 1',
      [id],
    );
    const existingProduct = existingRows[0];

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

    const updates = [];
    const values = [id];

    const pushValue = (column, value) => {
      if (value !== undefined) {
        updates.push(`"${column}" = $${values.length + 1}`);
        values.push(value);
      }
    };

    pushValue("name", body.name);
    pushValue("slug", body.slug);
    pushValue("brand", body.brand);
    pushValue("model", body.model);
    pushValue("category", body.category);
    pushValue("condition", body.condition);
    pushValue("warranty", body.warranty);
    if (body.status !== undefined)
      pushValue("status", normalizeStatus(body.status));
    if (body.description !== undefined)
      pushValue("description", body.description);
    if (body.price !== undefined) pushValue("price", Number(body.price));
    if (body.image !== undefined) pushValue("image", body.image);
    if (body.images !== undefined)
      pushValue(
        "images",
        Array.isArray(body.images) ? body.images : existingProduct.images || [],
      );
    if (body.specifications !== undefined)
      pushValue("specifications", body.specifications);
    if (body.accessories !== undefined)
      pushValue("accessories", body.accessories);

    const rows = await query(
      `UPDATE "BuyProduct" SET ${updates.join(", ")} WHERE "id" = $1 RETURNING *`,
      values,
    );

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      data: rows[0],
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
