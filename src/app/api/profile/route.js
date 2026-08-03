import { NextResponse } from "next/server";
import { createId } from "@/lib/createId";
import { query, transaction } from "@/db/query";
import { getNextCustomerId } from "@/lib/customerId";
import {
  getCachedValue,
  setCachedValue,
  invalidateCachePrefix,
} from "@/lib/dataCache";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const selectColumns = [
  '"id"',
  '"customerId"',
  '"name"',
  '"email"',
  '"profileImage"',
  '"phoneNumber"',
  '"address"',
  '"createdAt"',
  '"updatedAt"',
];

export async function GET(request) {
  const email = request.headers.get("x-user-email");
  if (!email) {
    return NextResponse.json(
      { success: false, message: "Missing user email" },
      { status: 400 },
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  const cacheKey = `/api/profile:${normalizedEmail}`;
  const cachedPayload = getCachedValue(cacheKey);
  if (cachedPayload !== null) {
    return NextResponse.json(cachedPayload);
  }

  try {
    const rows = await query(
      `SELECT ${selectColumns.join(", ")} FROM "Customer" WHERE LOWER("email") = LOWER($1) LIMIT 1`,
      [normalizedEmail],
    );

    const customer = rows[0] || null;
    const payload = { success: true, data: customer };

    setCachedValue(cacheKey, payload, 60_000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error("[PROFILE_GET]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const email = request.headers.get("x-user-email");
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Missing user email" },
        { status: 400 },
      );
    }

    const body = await request.json();
    if (!body.fullName || !body.phoneNumber || !body.address) {
      return NextResponse.json(
        { success: false, message: "Missing required profile fields" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailValue = email.trim();

    const result = await transaction(async (client) => {
      const existingRows = await client.query(
        `SELECT ${selectColumns.join(", ")} FROM "Customer" WHERE LOWER("email") = LOWER($1) LIMIT 1`,
        [normalizedEmail],
      );

      if (existingRows.rows[0]) {
        const existing = existingRows.rows[0];
        const updatedRows = await client.query(
          `UPDATE "Customer"
           SET "name" = $1,
               "phoneNumber" = $2,
               "address" = $3,
               "profileImage" = COALESCE($4, "profileImage")
           WHERE LOWER("email") = LOWER($5)
           RETURNING ${selectColumns.join(", ")}`,
          [
            body.fullName,
            body.phoneNumber,
            body.address,
            body.profileImage ?? existing.profileImage,
            normalizedEmail,
          ],
        );
        return updatedRows.rows[0];
      }

      const customerId = await getNextCustomerId();
      const id = createId();
      const createdRows = await client.query(
        `INSERT INTO "Customer" ("id", "customerId", "name", "email", "profileImage", "phoneNumber", "address")
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING ${selectColumns.join(", ")}`,
        [
          id,
          customerId,
          body.fullName,
          emailValue,
          body.profileImage || "",
          body.phoneNumber,
          body.address,
        ],
      );
      return createdRows.rows[0];
    });

    invalidateCachePrefix("/api/profile");
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[PROFILE_PUT]", error);
    return NextResponse.json(
      { success: false, message: "Failed to update profile" },
      { status: 500 },
    );
  }
}
