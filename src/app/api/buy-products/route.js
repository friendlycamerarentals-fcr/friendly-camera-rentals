import { NextResponse } from "next/server";
import { createId } from "@/lib/createId";
import { query } from "@/db/query";
import {
  getCachedValue,
  setCachedValue,
  invalidateCachePrefix,
} from "@/lib/dataCache";

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

const selectColumns = [
  '"id"',
  '"name"',
  '"slug"',
  '"brand"',
  '"model"',
  '"category"',
  '"condition"',
  '"warranty"',
  '"status"',
  '"description"',
  '"price"',
  '"image"',
  '"images"',
  '"specifications"',
  '"accessories"',
  '"display_order"',
  '"createdAt"',
  '"updatedAt"',
];

export async function GET() {
  const cacheKey = "/api/buy-products";
  const cachedPayload = getCachedValue(cacheKey);
  if (cachedPayload !== null) {
    return NextResponse.json(cachedPayload);
  }

  try {
    const products = await query(
      `SELECT ${selectColumns.join(", ")} FROM "BuyProduct" ORDER BY "display_order" ASC, "createdAt" DESC`,
    );

    const normalizedProducts = products.map((product) => ({
      ...product,
      status: normalizeStatus(product.status),
    }));

    const payload = {
      success: true,
      data: normalizedProducts,
    };

    setCachedValue(cacheKey, payload, 30_000);
    return NextResponse.json(payload);
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

export async function POST(request) {
  try {
    const body = await request.json();

    const id = createId();

    // Use a single INSERT query with a CTE so there is no extra round-trip for the display order.
    const rows = await query(
      `WITH next_display AS (
        SELECT COALESCE(MAX("display_order"), -1) + 1 AS "next_display_order"
        FROM "BuyProduct"
      )
      INSERT INTO "BuyProduct" (
        "id", "name", "slug", "brand", "model", "category",
        "condition", "warranty", "status", "description",
        "price", "image", "images", "specifications",
        "accessories", "display_order"
      )
      SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, "next_display_order"
      FROM next_display
      RETURNING ${selectColumns.join(", ")}`,
      [
        id,
        body.name,
        body.slug,
        body.brand,
        body.model,
        body.category,
        body.condition || "",
        body.warranty || "",
        normalizeStatus(body.status),
        body.description || "",
        Number(body.price || 0),
        body.image || "",
        body.images || [],
        body.specifications || [],
        body.accessories || [],
      ],
    );

    invalidateCachePrefix("/api/buy-products");
    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        data: rows[0],
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
