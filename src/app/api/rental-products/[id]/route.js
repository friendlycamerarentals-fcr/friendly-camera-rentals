import { NextResponse } from "next/server";
import { query } from "@/db/query";
import { invalidateCachePrefix } from "@/lib/dataCache";

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
    const rows = await query(
      'SELECT * FROM "RentalProduct" WHERE "id" = $1 LIMIT 1',
      [id],
    );
    const product = rows[0];

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
  const { id } = await params;

  try {
    const body = await request.json();
    const existingRows = await query(
      'SELECT * FROM "RentalProduct" WHERE "id" = $1 LIMIT 1',
      [id],
    );
    const existingProduct = existingRows[0];

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }

    const slug =
      body.slug ||
      existingProduct.slug ||
      createSlug(body.name ?? existingProduct.name);

    let imagesValue = Array.isArray(body.images)
      ? body.images
      : (existingProduct.images ?? []);

    if (typeof imagesValue === "string") {
      try {
        imagesValue = JSON.parse(imagesValue);
      } catch {
        imagesValue = [imagesValue];
      }
    }
    if (!Array.isArray(imagesValue)) {
      imagesValue = [imagesValue].filter(Boolean);
    }

    let pricingValue =
      body.pricing !== undefined
        ? createPricingObject(body.pricing)
        : existingProduct.pricing;

    if (typeof body.pricing === "string") {
      try {
        pricingValue = JSON.parse(body.pricing);
      } catch {
        pricingValue = createPricingObject({});
      }
    }

    let specificationsValue =
      body.specifications !== undefined
        ? body.specifications
        : (existingProduct.specifications ?? {
            megapixels: body.megapixels ?? existingProduct.megapixels ?? "",
            batteries: body.batteries ?? existingProduct.batteries ?? "",
          });

    if (typeof specificationsValue === "string") {
      try {
        specificationsValue = JSON.parse(specificationsValue);
      } catch {
        specificationsValue = {
          megapixels: body.megapixels ?? existingProduct.megapixels ?? "",
          batteries: body.batteries ?? existingProduct.batteries ?? "",
        };
      }
    }

    const rows = await query(
      `UPDATE "RentalProduct"
       SET "name" = $1,
           "slug" = $2,
           "brand" = $3,
           "model" = $4,
           "category" = $5,
           "description" = $6,
           "megapixels" = $7,
           "batteries" = $8,
           "available" = $9,
           "image" = $10,
           "images" = $11::jsonb,
           "pricing" = $12::jsonb,
           "specifications" = $13::jsonb
       WHERE "id" = $14
       RETURNING *`,
      [
        body.name ?? existingProduct.name,
        slug,
        body.brand ?? existingProduct.brand,
        body.model ?? existingProduct.model,
        body.category ?? existingProduct.category,
        body.description ?? existingProduct.description ?? "",
        body.megapixels ?? existingProduct.megapixels ?? "",
        body.batteries ?? existingProduct.batteries ?? "",
        body.available ?? existingProduct.available ?? true,
        body.image ?? existingProduct.image ?? "",
        JSON.stringify(imagesValue),
        JSON.stringify(pricingValue),
        JSON.stringify(specificationsValue),
        id,
      ],
    );

    invalidateCachePrefix("/api/rental-products");
    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update product" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;

  try {
    await query('DELETE FROM "RentalProduct" WHERE "id" = $1', [id]);
    invalidateCachePrefix("/api/rental-products");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to delete product" },
      { status: 500 },
    );
  }
}
