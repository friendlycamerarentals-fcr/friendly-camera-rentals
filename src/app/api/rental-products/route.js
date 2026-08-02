import { NextResponse } from "next/server";
import { createId } from "@paralleldrive/cuid2";
import { query } from "@/db/query";
import {
  getCachedValue,
  setCachedValue,
  invalidateCachePrefix,
} from "@/lib/dataCache";

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

const selectColumns = [
  '"id"',
  '"name"',
  '"slug"',
  '"brand"',
  '"model"',
  '"category"',
  '"description"',
  '"megapixels"',
  '"batteries"',
  '"available"',
  '"image"',
  '"images"',
  '"pricing"',
  '"specifications"',
  '"display_order"',
  '"createdAt"',
  '"updatedAt"',
];

const getCacheKey = (search, category) =>
  `/api/rental-products:${search || "all"}:${category || "all"}`;

export async function GET(request) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search")?.trim() || "";
  const category = url.searchParams.get("category")?.trim().toLowerCase();
  const cacheKey = getCacheKey(search, category);

  const cachedPayload = getCachedValue(cacheKey);
  if (cachedPayload !== null) {
    return NextResponse.json(cachedPayload);
  }

  try {
    let sql = `SELECT ${selectColumns.join(", ")} FROM "RentalProduct"`;
    const params = [];

    if (search) {
      sql += ' WHERE "name" ILIKE $1 OR "brand" ILIKE $2 OR "model" ILIKE $3';
      const pattern = `%${search.toLowerCase()}%`;
      params.push(pattern, pattern, pattern);
    }

    if (category && category !== "all") {
      sql += search ? ' AND "category" ILIKE $4' : ' WHERE "category" ILIKE $1';
      params.push(category);
    }

    sql += ' ORDER BY "display_order" ASC, "createdAt" DESC';

    const products = await query(sql, params);
    const payload = { success: true, data: products };

    // Cache GET responses so repeated reads avoid a round-trip to Postgres.
    setCachedValue(cacheKey, payload, 30_000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error("[RENTAL_PRODUCTS_GET]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const slug = body.slug || createSlug(body.name);

    let images = body.images ?? [];
    if (typeof images === "string") {
      try {
        images = JSON.parse(images);
      } catch {
        images = [images];
      }
    }
    if (!Array.isArray(images)) {
      images = [images].filter(Boolean);
    }

    let pricing = createPricingObject(body.pricing);
    if (typeof body.pricing === "string") {
      try {
        pricing = JSON.parse(body.pricing);
      } catch {
        pricing = createPricingObject({});
      }
    }

    let specifications = body.specifications || {
      megapixels: body.megapixels || "",
      batteries: body.batteries ?? "",
    };

    if (typeof specifications === "string") {
      try {
        specifications = JSON.parse(specifications);
      } catch {
        specifications = {
          megapixels: body.megapixels || "",
          batteries: body.batteries ?? "",
        };
      }
    }

    const id = createId();

    // Use a single INSERT query with a CTE to avoid a separate lookup for the display order.
    const rows = await query(
      `WITH next_display AS (
        SELECT COALESCE(MAX("display_order"), -1) + 1 AS "next_display_order"
        FROM "RentalProduct"
      )
      INSERT INTO "RentalProduct" (
        "id", "name", "slug", "brand", "model", "category", "description",
        "megapixels", "batteries", "available", "image", "images",
        "pricing", "specifications", "display_order"
      )
      SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, "next_display_order"
      FROM next_display
      RETURNING ${selectColumns.join(", ")}`,
      [
        id,
        body.name,
        slug,
        body.brand,
        body.model,
        body.category,
        body.description || "",
        body.megapixels || "",
        body.batteries ?? "",
        body.available ?? true,
        body.image || "",
        JSON.stringify(images),
        JSON.stringify(pricing),
        JSON.stringify(specifications),
      ],
    );

    invalidateCachePrefix("/api/rental-products");
    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("[RENTAL_PRODUCTS_POST]", error);
    const message = error.message || "Failed to create product";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
