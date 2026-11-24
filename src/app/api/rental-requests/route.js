import { NextResponse } from "next/server";
import { createId } from "@/lib/createId";
import { query, transaction } from "@/db/query";
import { reserveRewardForRental } from "@/lib/rewards/applyReward";
import rewardService from "@/services/rewardService";
import { createAdminNotification } from "@/lib/adminNotificationService";
import { isRewardEligible } from "@/lib/rewards/rewardValidation";
import { generateNextRequestId } from "@/lib/rentalRequestId";
import { withRentalPaymentSummary } from "@/lib/rentalPayments";
import {
  getStandardDurationOptions,
  parsePricingKey,
} from "@/lib/rentalDuration";
import {
  ACTIVE_RENTAL_REQUEST_FILTER,
  RENTAL_REQUEST_ITEM_COLUMNS,
} from "@/lib/rentalDbColumns";
import { getActiveRentalRequests } from "@/lib/rentalRequestQueries";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const requests = await getActiveRentalRequests(query);

    // Attach the persisted rental items (multi-item manual bookings) so the
    // admin list/details show every item of a booking in one response.
    if (requests.length) {
      const requestIds = requests.map((row) => row.requestId);
      const itemRows = await query(
        `SELECT ${RENTAL_REQUEST_ITEM_COLUMNS} FROM "RentalRequestItem"
         WHERE "rentalRequestId" = ANY($1)
         ORDER BY "itemOrder" ASC, "id" ASC`,
        [requestIds],
      );
      const itemsByRequestId = itemRows.reduce((acc, row) => {
        if (!acc[row.rentalRequestId]) acc[row.rentalRequestId] = [];
        acc[row.rentalRequestId].push(row);
        return acc;
      }, {});
      requests.forEach((row) => {
        const items = itemsByRequestId[row.requestId];
        if (items && items.length) {
          row.items = items;
        }
      });

      const extraChargeRows = await query(
        `SELECT * FROM "RentalExtraCharge"
         WHERE "rentalRequestId" = ANY($1)
         ORDER BY "createdAt" ASC, "id" ASC`,
        [requestIds],
      );
      const extraChargesByRequestId = extraChargeRows.reduce((acc, entry) => {
        if (!acc[entry.rentalRequestId]) acc[entry.rentalRequestId] = [];
        acc[entry.rentalRequestId].push(entry);
        return acc;
      }, {});

      const paymentRows = await query(
        `SELECT * FROM "RentalPayment"
         WHERE "rentalRequestId" = ANY($1)
           AND "deletedAt" IS NULL
         ORDER BY "createdAt" ASC, "id" ASC`,
        [requestIds],
      );
      const paymentsByRequestId = paymentRows.reduce((acc, payment) => {
        if (!acc[payment.rentalRequestId]) acc[payment.rentalRequestId] = [];
        acc[payment.rentalRequestId].push(payment);
        return acc;
      }, {});
      for (let index = 0; index < requests.length; index += 1) {
        requests[index] = withRentalPaymentSummary(
          requests[index],
          paymentsByRequestId[requests[index].requestId] || [],
          extraChargesByRequestId[requests[index].requestId] || [],
        );
      }
    }

    return NextResponse.json({ success: true, data: requests });
  } catch (error) {
    console.error("[RENTAL_REQUESTS_GET]", {
      message: error?.message || String(error),
      stack: error?.stack,
      code: error?.code,
      detail: error?.detail,
      hint: error?.hint,
    });
    if (
      error.code === "42P01" &&
      error.message?.includes('"RentalExtraCharge"')
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'The rental extension database migration is missing. Run "npm run db:migrate" against the configured database, then retry.',
        },
        { status: 503 },
      );
    }
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
      !body.rentalDuration
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required booking fields" },
        { status: 400 },
      );
    }

    const rentalDuration = String(body.rentalDuration).trim();
    const requestedDuration = parsePricingKey(rentalDuration);
    if (!requestedDuration) {
      return NextResponse.json(
        { success: false, message: "Select a valid rental duration." },
        { status: 400 },
      );
    }

    const productRows = await query(
      'SELECT "id", "name", "available", "category", "pricing" FROM "RentalProduct" WHERE "id" = $1 LIMIT 1',
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

    const configuredDuration = getStandardDurationOptions(product).find(
      (option) =>
        option.value === requestedDuration.value &&
        option.unit === requestedDuration.unit,
    );
    if (!configuredDuration) {
      return NextResponse.json(
        {
          success: false,
          message: "The selected duration is not configured for this product.",
        },
        { status: 400 },
      );
    }
    const rentalPrice = configuredDuration.price;
    const totalAmount = rentalPrice;

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
      `SELECT "id" FROM "RentalRequest"
       WHERE ${ACTIVE_RENTAL_REQUEST_FILTER}
         AND "productId" = $1
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

    const requestId = await generateNextRequestId();

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
        "rentalPrice", "totalAmount", "originalAmount", "rewardId", "rewardDiscount",
        "bookingDate", "pickupTime", "notes", "status", "paymentStatus", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
      RETURNING ${RENTAL_REQUEST_COLUMNS}`;
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
        rentalDuration,
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
          `UPDATE "RentalRequest" SET "rewardId" = $1, "rewardDiscount" = $2, "totalAmount" = $3, "updatedAt" = NOW() WHERE "id" = $4 RETURNING ${RENTAL_REQUEST_COLUMNS}`,
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
