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

export async function GET() {
  const cacheKey = "/api/customers";
  const cachedPayload = getCachedValue(cacheKey);
  if (cachedPayload !== null) {
    return NextResponse.json(cachedPayload);
  }

  try {
    const customers = await query(
      `SELECT ${selectColumns.join(", ")} FROM "Customer" ORDER BY "createdAt" DESC`,
    );

    const payload = {
      success: true,
      data: customers,
    };
    setCachedValue(cacheKey, payload, 30_000);
    return NextResponse.json(payload);
  } catch (error) {
    console.error("[CUSTOMERS_GET]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch customers",
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

    if (!body?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required",
        },
        {
          status: 400,
        },
      );
    }

    const emailValue = (body.email || "").trim();
    const normalizedEmail = emailValue.toLowerCase();

    const customer = await transaction(async (client) => {
      const existingRows = await client.query(
        `SELECT ${selectColumns.join(", ")} FROM "Customer"
         WHERE LOWER("email") = LOWER($1)
         LIMIT 1`,
        [normalizedEmail],
      );

      if (existingRows.rows[0]) {
        return {
          customer: existingRows.rows[0],
          created: false,
        };
      }

      const customerId = await getNextCustomerId();

      const id = createId();
      const createdRows = await client.query(
        `INSERT INTO "Customer" (
          "id",
          "customerId",
          "name",
          "email",
          "profileImage",
          "phoneNumber",
          "address"
        )
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING ${selectColumns.join(", ")}`,
        [
          id,
          customerId,
          body.name || "Customer",
          emailValue,
          body.profileImage || "",
          body.phoneNumber || "",
          body.address || "",
        ],
      );
      return {
        customer: createdRows.rows[0],
        created: true,
      };
    });

    invalidateCachePrefix("/api/profile");
    invalidateCachePrefix("/api/customers");

    return NextResponse.json(
      {
        success: true,
        data: customer.customer,
      },
      {
        status: customer.created ? 201 : 200,
      },
    );
  } catch (error) {
    console.error("[CUSTOMER_CREATE]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create customer",
      },
      {
        status: 500,
      },
    );
  }
}
