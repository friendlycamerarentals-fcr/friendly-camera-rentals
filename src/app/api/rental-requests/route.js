import { NextResponse } from "next/server";
import { createId } from "@/lib/createId";
import { query } from "@/db/query";
import { createAdminNotification } from "@/lib/adminNotificationService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function buildRequestId(idNumber) {
  return `FCR-R${String(idNumber).padStart(6, "0")}`;
}

async function getRentalRequestRewardColumnSupport() {
  try {
    const rows = await query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'RentalRequest'
        AND column_name IN ('rewardId', 'rewardDiscount')
    `);
    const columns = new Set(rows.map((row) => row.column_name));

    return {
      rewardId: columns.has("rewardId"),
      rewardDiscount: columns.has("rewardDiscount"),
    };
  } catch (error) {
    console.warn("[RENTAL_REQUEST_SCHEMA_CHECK]", error.message);
    return {
      rewardId: false,
      rewardDiscount: false,
    };
  }
}

export async function GET() {
  try {
    const requests = await query(
      'SELECT * FROM "RentalRequest" ORDER BY "createdAt" DESC',
    );
    return NextResponse.json({ success: true, data: requests });
  } catch (error) {
    console.error("[RENTAL_REQUESTS_GET]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch rental requests" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (
      !body.productId ||
      !body.productName ||
      !body.phone ||
      !body.fullName ||
      !body.bookingDate ||
      !body.customerId ||
      !body.rentalDuration ||
      body.quantity == null ||
      body.rentalPrice == null ||
      body.totalAmount == null
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required booking fields" },
        { status: 400 },
      );
    }

    const quantity = Number(body.quantity);
    const rentalPrice = Number(body.rentalPrice);
    const totalAmount = Number(body.totalAmount);

    if (
      Number.isNaN(quantity) ||
      Number.isNaN(rentalPrice) ||
      Number.isNaN(totalAmount)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid numeric booking fields" },
        { status: 400 },
      );
    }

    const productRows = await query(
      'SELECT "id", "name", "available" FROM "RentalProduct" WHERE "id" = $1 LIMIT 1',
      [body.productId],
    );
    const product = productRows[0];

    if (!product || product.available === false) {
      return NextResponse.json(
        {
          success: false,
          message: product
            ? `${product.name} is currently unavailable for rent.`
            : "The selected product is currently unavailable for rent.",
        },
        { status: 400 },
      );
    }

    const existingRows = await query(
      `SELECT * FROM "RentalRequest"
       WHERE "productId" = $1
         AND "phone" = $2
         AND "bookingDate" = $3
         AND "pickupTime" IS NOT DISTINCT FROM $4
         AND "rentalDuration" = $5
         AND "status" IN ('Pending', 'Approved', 'Completed')
       LIMIT 1`,
      [
        body.productId,
        body.phone,
        body.bookingDate,
        body.pickupTime || null,
        body.rentalDuration,
      ],
    );

    if (existingRows.length) {
      return NextResponse.json(
        { success: false, message: "A similar booking request already exists" },
        { status: 409 },
      );
    }

    const requestRows = await query(
      `SELECT "requestId" FROM "RentalRequest" WHERE "requestId" LIKE 'FCR-R%' ORDER BY "requestId" DESC LIMIT 50`,
    );

    const numericSequences = requestRows
      .map((item) => String(item.requestId).match(/^FCR-R(\d{6})$/)?.[1])
      .filter(Boolean)
      .map(Number);

    const lastSequence = numericSequences.length
      ? Math.max(...numericSequences)
      : NaN;
    const nextSequence = Number.isInteger(lastSequence)
      ? Math.max(lastSequence + 1, 100001)
      : 100001;

    const requestId = buildRequestId(nextSequence);

    const id = createId();
    const now = new Date();
    const rewardColumns = await getRentalRequestRewardColumnSupport();

    let insertSql;
    let insertParams;

    if (rewardColumns.rewardId && rewardColumns.rewardDiscount) {
      insertSql = `INSERT INTO "RentalRequest" (
        "id", "requestId", "customerId", "userId", "fullName", "email", "phone",
        "address", "productId", "productName", "productImage", "rentalDuration",
        "quantity", "rentalPrice", "totalAmount", "rewardId", "rewardDiscount",
        "bookingDate", "pickupTime", "notes", "status", "paymentStatus", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
      RETURNING *`;
      insertParams = [
        id,
        requestId,
        body.customerId,
        body.userId || null,
        body.fullName,
        body.email || null,
        body.phone,
        body.address || null,
        body.productId,
        body.productName,
        body.productImage || null,
        body.rentalDuration,
        quantity,
        rentalPrice,
        totalAmount,
        null,
        null,
        body.bookingDate,
        body.pickupTime || null,
        body.notes || null,
        "Pending",
        "Pending",
        now,
        now,
      ];
    } else {
      insertSql = `INSERT INTO "RentalRequest" (
        "id", "requestId", "customerId", "userId", "fullName", "email", "phone",
        "address", "productId", "productName", "productImage", "rentalDuration",
        "quantity", "rentalPrice", "totalAmount",
        "bookingDate", "pickupTime", "notes", "status", "paymentStatus", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      RETURNING *`;
      insertParams = [
        id,
        requestId,
        body.customerId,
        body.userId || null,
        body.fullName,
        body.email || null,
        body.phone,
        body.address || null,
        body.productId,
        body.productName,
        body.productImage || null,
        body.rentalDuration,
        quantity,
        rentalPrice,
        totalAmount,
        body.bookingDate,
        body.pickupTime || null,
        body.notes || null,
        "Pending",
        "Pending",
        now,
        now,
      ];
    }

    const rows = await query(insertSql, insertParams);
    const rentalRequest = rows[0];

    // Create admin notification for new rental booking
    await createAdminNotification({
      type: "rental_booking",
      title: "New Rental Booking",
      message: `${body.fullName} booked ${body.productName} for ${body.rentalDuration}`,
      relatedId: rentalRequest.id,
      relatedType: "RentalRequest",
    });

    return NextResponse.json(
      {
        success: true,
        data: rentalRequest,
        rewardApplied: false,
        reward: null,
        rewardDiscount: 0,
        finalAmount: totalAmount,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[RENTAL_REQUESTS_POST]", error);
    return NextResponse.json(
      { success: false, message: "Failed to create rental request" },
      { status: 500 },
    );
  }
}
