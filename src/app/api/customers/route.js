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
      console.warn("[CUSTOMER_SYNC]", {
        outcome: "invalid_request",
        reason: "missing_email",
      });
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
    const customerName =
      typeof body.name === "string" && body.name.trim()
        ? body.name.trim()
        : "Customer";
    const profileImage =
      typeof body.profileImage === "string" ? body.profileImage : "";
    const phoneNumber =
      typeof body.phoneNumber === "string" ? body.phoneNumber : "";
    const address = typeof body.address === "string" ? body.address : "";

    const customer = await transaction(async (client) => {
      await client.query(
        "SELECT pg_advisory_xact_lock(hashtext('fcr_customer_email:' || $1))",
        [normalizedEmail],
      );

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

      const customerId = await getNextCustomerId(client);

      const id = createId();
      const createdRows = await client.query(
        `INSERT INTO "Customer" (
          "id",
          "customerId",
          "name",
          "email",
          "profileImage",
          "phoneNumber",
          "address",
          "createdAt",
          "updatedAt"
        )
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT ("email") DO NOTHING
         RETURNING ${selectColumns.join(", ")}`,
        [
          id,
          customerId,
          customerName,
          normalizedEmail,
          profileImage,
          phoneNumber,
          address,
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

    if (!customer?.customer) {
      console.error("[CUSTOMER_SYNC]", {
        outcome: "missing_transaction_result",
      });
      return NextResponse.json(
        {
          success: false,
          message: "Customer synchronization did not return a customer",
        },
        { status: 500 },
      );
    }

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

    console.info("[CUSTOMER_SYNC]", {
      outcome: customer.created ? "created" : "existing",
      hasCustomerId: Boolean(customer.customer?.customerId),
    });

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
    console.error("[CUSTOMER_SYNC]", {
      outcome: "database_error",
      errorName: error.name,
      errorCode: error.code,
      column: error.column,
      constraint: error.constraint,
      table: error.table,
    });

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
