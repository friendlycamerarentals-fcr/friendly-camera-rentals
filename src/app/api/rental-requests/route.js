import { NextResponse } from "next/server";
import { createId } from "@/lib/createId";
import { query, transaction } from "@/db/query";
import { reserveRewardForRental } from "@/lib/rewards/applyReward";
import rewardService from "@/services/rewardService";
import { createAdminNotification } from "@/lib/adminNotificationService";
import { isRewardEligible } from "@/lib/rewards/rewardValidation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function buildRequestId(idNumber) {
  return `FCR-R${String(idNumber).padStart(6, "0")}`;
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
    await rewardService.expireRewards();
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
      'SELECT "id", "name", "available", "category" FROM "RentalProduct" WHERE "id" = $1 LIMIT 1',
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

    if (body.rewardId && !isRewardEligible(product.category)) {
      return NextResponse.json(
        {
          success: false,
          message: "This reward is only valid for camera rentals.",
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
         AND "status" IN ('Pending', 'Confirmed', 'Approved', 'Picked Up', 'Returned', 'Completed')
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
    const result = await transaction(async (client) => {
      let reservation = null;
      if (body.rewardId) {
        const customerRows = await client.query(
          'SELECT "id" FROM "Customer" WHERE "customerId" = $1 AND LOWER("email") = LOWER($2) LIMIT 1',
          [body.customerId, body.email],
        );
        if (!customerRows.rows.length) {
          const error = new Error("Reward does not belong to this customer.");
          error.status = 403;
          throw error;
        }
      }

      const insertSql = `INSERT INTO "RentalRequest" (
        "id", "requestId", "customerId", "userId", "fullName", "email", "phone",
        "address", "productId", "productName", "productImage", "rentalDuration",
        "quantity", "rentalPrice", "totalAmount", "originalAmount", "rewardId", "rewardDiscount",
        "bookingDate", "pickupTime", "notes", "status", "paymentStatus", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
      RETURNING *`;
      const insertParams = [
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
        totalAmount,
        null,
        0,
        body.bookingDate,
        body.pickupTime || null,
        body.notes || null,
        "Pending",
        "Pending",
        now,
        now,
      ];

      let rentalRequest = (await client.query(insertSql, insertParams)).rows[0];

      if (body.rewardId) {
        reservation = await reserveRewardForRental(client, {
          customerId: body.customerId,
          rewardId: body.rewardId,
          rentalRequestId: requestId,
          originalAmount: totalAmount,
        });
        if (!reservation.success) {
          const error = new Error(reservation.message);
          error.status = 409;
          throw error;
        }

        const updatedRentalRows = await client.query(
          'UPDATE "RentalRequest" SET "rewardId" = $1, "rewardDiscount" = $2, "totalAmount" = $3, "updatedAt" = NOW() WHERE "id" = $4 RETURNING *',
          [
            reservation.reward.rewardId,
            reservation.rewardDiscount,
            reservation.finalAmount,
            id,
          ],
        );
        rentalRequest = updatedRentalRows.rows[0];
      }

      return { rentalRequest, reservation };
    });
    const { rentalRequest, reservation } = result;

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
        rewardApplied: Boolean(reservation),
        reward: reservation?.reward || null,
        rewardDiscount: reservation?.rewardDiscount || 0,
        finalAmount: reservation?.finalAmount ?? totalAmount,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[RENTAL_REQUESTS_POST]", error);
    return NextResponse.json(
      { success: false, message: "Failed to create rental request" },
      { status: error.status || 500 },
    );
  }
}
