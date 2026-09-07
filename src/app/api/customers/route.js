import { NextResponse } from "next/server";
import { createId } from "@/lib/createId";
import { query, transaction } from "@/db/query";
import { getNextCustomerId } from "@/lib/customerId";
import {
  getCachedValue,
  setCachedValue,
  invalidateCachePrefix,
} from "@/lib/dataCache";
import { createAdminNotification } from "@/lib/adminNotificationService";

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
         ON CONFLICT ("email") DO NOTHING
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
      if (createdRows.rows[0]) {
        return {
          customer: createdRows.rows[0],
          created: true,
        };
      }

      const concurrentRows = await client.query(
        `SELECT ${selectColumns.join(", ")} FROM "Customer"
         WHERE LOWER("email") = LOWER($1)
         LIMIT 1`,
        [normalizedEmail],
      );

      return {
        customer: concurrentRows.rows[0],
        created: false,
      };
    });

    invalidateCachePrefix("/api/profile");
    invalidateCachePrefix("/api/customers");

    // Create admin notification for new customer
    if (customer.created) {
      await createAdminNotification({
        type: "new_customer",
        title: "New Customer Registration",
        message: `${customer.customer.name} (${customer.customer.email}) registered`,
        relatedId: customer.customer.id,
        relatedType: "Customer",
      });
    }

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
