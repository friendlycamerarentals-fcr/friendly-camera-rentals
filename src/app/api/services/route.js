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
  '"fullName"',
  '"phone"',
  '"shootType"',
  '"eventDate"',
  '"eventTime"',
  '"location"',
  '"description"',
  '"message"',
  '"notes"',
  '"status"',
  '"createdAt"',
  '"updatedAt"',
];

export async function GET() {
  const cacheKey = "/api/services";
  const cachedPayload = getCachedValue(cacheKey);
  if (cachedPayload !== null) {
    return NextResponse.json(cachedPayload);
  }

  try {
    const bookings = await query(
      `SELECT ${selectColumns.join(", ")} FROM "ServiceBooking" ORDER BY "createdAt" DESC`,
    );

    const payload = { success: true, data: bookings };
    setCachedValue(cacheKey, payload, 30_000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error("[SERVICE_BOOKINGS_GET]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch bookings" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const id = createId();
    const rows = await query(
      `INSERT INTO "ServiceBooking" (
        "id", "fullName", "phone", "shootType", "eventDate", "eventTime",
        "location", "description", "message", "status"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING ${selectColumns.join(", ")}`,
      [
        id,
        body.fullName || body.name,
        body.phone || body.phoneNumber,
        body.shootType || body.service,
        body.eventDate || body.date,
        body.eventTime || null,
        body.location || body.eventLocation,
        body.description || body.message || "",
        body.message || "",
        "pending",
      ],
    );

    invalidateCachePrefix("/api/services");
    return NextResponse.json({ success: true, data: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("[SERVICE_BOOKINGS_POST]", error);
    return NextResponse.json(
      { success: false, message: "Failed to create booking" },
      { status: 500 },
    );
  }
}
