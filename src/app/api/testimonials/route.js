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

const selectColumns = [
  '"id"',
  '"name"',
  '"designation"',
  '"image"',
  '"rating"',
  '"review"',
  '"status"',
  '"featured"',
  '"createdAt"',
  '"updatedAt"',
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const cacheKey = `/api/testimonials:${status || "all"}`;
  const cachedPayload = getCachedValue(cacheKey);
  if (cachedPayload !== null) {
    return NextResponse.json(cachedPayload);
  }

  try {
    let sql = `SELECT ${selectColumns.join(", ")} FROM "Testimonial"`;
    const params = [];

    if (status && ["pending", "approved", "rejected"].includes(status)) {
      sql += ' WHERE "status" = $1';
      params.push(status);
    }

    sql += ' ORDER BY "createdAt" DESC';

    const testimonials = await query(sql, params);
    const payload = { success: true, data: testimonials };
    setCachedValue(cacheKey, payload, 30_000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error("[TESTIMONIALS_GET]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch testimonials" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 },
      );
    }

    if (!body.review && !body.text) {
      return NextResponse.json(
        { success: false, message: "Review text is required" },
        { status: 400 },
      );
    }

    const review = (body.review || body.text).trim();
    if (review.length < 10) {
      return NextResponse.json(
        {
          success: false,
          message: "Review must be at least 10 characters long",
        },
        { status: 400 },
      );
    }

    const rating = parseInt(body.rating) || 5;
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating must be between 1 and 5" },
        { status: 400 },
      );
    }

    const id = createId();
    const rows = await query(
      `INSERT INTO "Testimonial" (
        "id", "name", "designation", "image", "rating", "review", "featured", "status"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING ${selectColumns.join(", ")}`,
      [
        id,
        body.name.trim(),
        (body.designation || body.role || "").trim(),
        body.image || null,
        rating,
        review,
        body.featured || false,
        "pending",
      ],
    );

    invalidateCachePrefix("/api/testimonials");
    return NextResponse.json(
      {
        success: true,
        data: rows[0],
        message:
          "Testimonial submitted successfully. It will appear after admin approval.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[TESTIMONIAL_CREATE]", error);
    return NextResponse.json(
      { success: false, message: "Failed to create testimonial" },
      { status: 500 },
    );
  }
}
