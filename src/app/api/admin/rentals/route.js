import { NextResponse } from "next/server";
import { query, transaction } from "@/db/query";
import { createId } from "@/lib/createId";
import { requireAdmin } from "@/lib/adminAuth";
import { generateNextRequestId } from "@/lib/rentalRequestId";
import { reserveRewardForRental } from "@/lib/rewards/applyReward";
import rewardService from "@/services/rewardService";
import { createAdminNotification } from "@/lib/adminNotificationService";
import { bookingContainsCamera } from "@/lib/rewards/rewardValidation";
import { canTransitionRentalStatus } from "@/constants/rentalStatus";
import {
  validateExpectedAdvance,
  validateManualRentalAdvance,
} from "@/lib/rentalPayment";
import { withRentalPaymentSummary } from "@/lib/rentalPayments";
import {
  toPaise,
  fromPaise,
  sumPaise,
  validateSharedRentalDuration,
} from "@/lib/rentalDuration";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const normalizePhone = (value) => String(value || "").replace(/\D/g, "");

const MAX_ITEMS = 20;
const MAX_ITEM_PRICE = 10_000_000; // sanity cap per agreed item price


/**
 * POST /api/admin/rentals
 *
 * Create ONE manual rental request (phone / WhatsApp enquiry) containing one
 * or more rental items. Every item shares one predefined or custom duration,
 * while each item has its own admin-agreed price.
 *
 * Business rules:
 *  - Exactly one existing customer must be selected (never auto-created).
 *  - Standard items default to the persisted listing price; admins may agree
 *    to a negotiated price (stored as isCustomPrice) — never trusted from an
 *    unauthenticated client because this route is admin-auth only.
 *  - Custom durations are validated (whole hours/days within limits) and
 *    normalized to value + unit + display.
 *  - Amounts are summed with paise (integer) precision.
 *  - Pending requests remain pending and store an advance expectation only.
 *    Immediate confirmation records a payment only when the admin explicitly
 *    supplies a positive received advance, in the same transaction.
 *  - An applied reward is RESERVED (Applied) inside the booking transaction;
 *    it is never marked Used at creation, and eligibility is checked against
 *    the booking-level original amount and camera-containing item categories.
 */
export async function POST(request) {
  try {
    const { email: adminEmail } = await requireAdmin();

    await rewardService.expireRewards();

    const body = await request.json();
    const action = body.action || "pending";
    if (!["pending", "confirm"].includes(action)) {
      return NextResponse.json(
        { success: false, message: "Choose a valid booking action." },
        { status: 400 },
      );
    }
    if (
      action !== "confirm" &&
      Object.prototype.hasOwnProperty.call(body, "payment")
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Record payments in Rental Details after the money has been received.",
        },
        { status: 400 },
      );
    }
    const rawItems = Array.isArray(body.items) ? body.items : Array.isArray(body) ? body : [];

    if (!rawItems.length) {
      return NextResponse.json(
        { success: false, message: "Add at least one rental item." },
        { status: 400 },
      );
    }
    if (rawItems.length > MAX_ITEMS) {
      return NextResponse.json(
        { success: false, message: `A booking can contain at most ${MAX_ITEMS} rental items.` },
        { status: 400 },
      );
    }

    if (!body.bookingDate || !body.pickupTime) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking date and pickup time are required.",
        },
        { status: 400 },
      );
    }

    const bookingDate = String(body.bookingDate).trim();
    const parsedBookingDate = new Date(`${bookingDate}T00:00:00`);
    if (Number.isNaN(parsedBookingDate.getTime())) {
      return NextResponse.json(
        { success: false, message: "Invalid booking date." },
        { status: 400 },
      );
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsedBookingDate < today) {
      return NextResponse.json(
        { success: false, message: "Booking date cannot be in the past." },
        { status: 400 },
      );
    }

    const pickupTime = String(body.pickupTime).trim();
    if (!pickupTime) {
      return NextResponse.json(
        { success: false, message: "Pickup time is required." },
        { status: 400 },
      );
    }

    let advanceExpected;
    try {
      advanceExpected = validateExpectedAdvance(body.advanceExpected);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status || 400 },
      );
    }

    // ---- Customer validation (existing customers only) ------------------
    const customerRows = await query(
      `SELECT "id", "customerId", "name", "email", "phoneNumber", "address"
       FROM "Customer" WHERE "customerId" = $1 LIMIT 1`,
      [String(body.customerId || "").trim()],
    );
    const customer = customerRows[0];
    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The selected customer record could not be found. Please select a registered customer.",
        },
        { status: 400 },
      );
    }

    // ---- Item validation --------------------------------------------------
    // Fetch all referenced products in one query, then validate each item
    // against its product's persisted pricing.
    const productIds = [...new Set(rawItems.map((item) => String(item?.productId || "").trim()))];
    if (productIds.some((id) => !id)) {
      return NextResponse.json(
        { success: false, message: "Every rental item must have a selected product." },
        { status: 400 },
      );
    }

    const productRows = await query(
      `SELECT "id", "name", "image", "available", "category", "pricing"
       FROM "RentalProduct" WHERE "id" = ANY($1)`,
      [productIds],
    );
    const productsById = productRows.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {});

    let firstInvalidAvailableProduct = null;
    for (const productId of productIds) {
      const product = productsById[productId];
      if (!product || product.available === false) {
        firstInvalidAvailableProduct = product
          ? `${product.name} is currently unavailable for rent.`
          : "The selected product is currently unavailable for rent.";
        break;
      }
    }
    if (firstInvalidAvailableProduct) {
      return NextResponse.json(
        { success: false, message: firstInvalidAvailableProduct },
        { status: 400 },
      );
    }

    const durationValidation = validateSharedRentalDuration(body.duration);
    if (!durationValidation.ok) {
      return NextResponse.json(
        { success: false, message: durationValidation.message },
        { status: 400 },
      );
    }
    const sharedDuration = durationValidation.duration;

    const validatedItems = [];
    for (let index = 0; index < rawItems.length; index += 1) {
      const rawItem = rawItems[index] || {};
      const product = productsById[String(rawItem.productId).trim()];
      const pricing = product.pricing || {};

      let price = null;
      let isCustomPrice = false;

      if (sharedDuration.type === "standard") {
        const listingPrice = Number(pricing[sharedDuration.key]);
        const hasListingPrice = Number.isFinite(listingPrice) && listingPrice > 0;
        if (!hasListingPrice && (rawItem.price == null || rawItem.price === "")) {
          return NextResponse.json(
            {
              success: false,
              message: `Item ${index + 1}: enter an agreed price for ${product.name} at ${sharedDuration.display}.`,
            },
            { status: 400 },
          );
        }

        price =
          rawItem.price == null || rawItem.price === ""
            ? listingPrice
            : Number(rawItem.price);
        if (!Number.isFinite(price) || price <= 0) {
          return NextResponse.json(
            {
              success: false,
              message: `Item ${index + 1}: rental price must be a positive amount.`,
            },
            { status: 400 },
          );
        }
        if (price > MAX_ITEM_PRICE) {
          return NextResponse.json(
            {
              success: false,
              message: `Item ${index + 1}: rental price exceeds the allowed limit.`,
            },
            { status: 400 },
          );
        }
        isCustomPrice =
          !hasListingPrice || toPaise(price) !== toPaise(listingPrice);
      } else {
        if (rawItem.price == null || rawItem.price === "") {
          return NextResponse.json(
            {
              success: false,
              message: `Item ${index + 1}: enter the agreed rental price for the shared custom duration.`,
            },
            { status: 400 },
          );
        }
        price = Number(rawItem.price);
        if (!Number.isFinite(price) || price <= 0) {
          return NextResponse.json(
            {
              success: false,
              message: `Item ${index + 1}: rental price must be a positive amount.`,
            },
            { status: 400 },
          );
        }
        if (price > MAX_ITEM_PRICE) {
          return NextResponse.json(
            {
              success: false,
              message: `Item ${index + 1}: rental price exceeds the allowed limit.`,
            },
            { status: 400 },
          );
        }
        isCustomPrice = true;
      }

      validatedItems.push({
        productId: product.id,
        productName: product.name,
        productImage: product.image || null,
        category: product.category || null,
        durationValue: sharedDuration.value,
        durationUnit: sharedDuration.unit,
        durationDisplay: sharedDuration.display,
        isCustomDuration: sharedDuration.type === "custom",
        rentalPrice: fromPaise(toPaise(price)),
        isCustomPrice,
        pricingKey: sharedDuration.type === "standard" ? sharedDuration.key : null,
      });
    }

    const originalAmount = fromPaise(sumPaise(validatedItems.map((item) => item.rentalPrice)));
    if (originalAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "The agreed rental total must be positive." },
        { status: 400 },
      );
    }

    // ---- Reward eligibility (booking-level, camera items required) --------
    const itemCategories = validatedItems.map((item) => item.category);
    const rewardId = body.rewardId ? String(body.rewardId).trim() : null;
    if (rewardId && !bookingContainsCamera(itemCategories)) {
      return NextResponse.json(
        { success: false, message: "This reward is only valid for camera rentals." },
        { status: 400 },
      );
    }

    const phone = normalizePhone(customer.phoneNumber) || normalizePhone(body.phone);
    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The customer profile does not have a phone number. Ask them to complete their profile.",
        },
        { status: 400 },
      );
    }

    // ---- Duplicate submission protection ----------------------------------
    const primaryItem = validatedItems[0];
    const existingRows = await query(
      `SELECT * FROM "RentalRequest"
       WHERE "productId" = $1
         AND "phone" = $2
         AND "bookingDate" = $3
         AND "pickupTime" IS NOT DISTINCT FROM $4
         AND "rentalDuration" = $5
         AND "status" IN ('Pending', 'Confirmed', 'Approved', 'Picked Up', 'Returned', 'Completed')
       LIMIT 1`,
      [primaryItem.productId, phone, bookingDate, pickupTime, primaryItem.durationDisplay],
    );
    if (existingRows.length) {
      return NextResponse.json(
        { success: false, message: "A similar booking request already exists" },
        { status: 409 },
      );
    }

    const requestId = await generateNextRequestId();

    // ---- Create Pending booking + items + (optionally) reserve reward -----
    const result = await transaction(async (client) => {
      const id = createId();
      const now = new Date();

      const lockedProducts = await client.query(
        'SELECT "id", "name", "available" FROM "RentalProduct" WHERE "id" = ANY($1) FOR UPDATE',
        [productIds],
      );
      const lockedProductsById = Object.fromEntries(
        lockedProducts.rows.map((product) => [product.id, product]),
      );
      for (const productId of productIds) {
        const product = lockedProductsById[productId];
        if (!product || product.available === false) {
          const error = new Error(
            product
              ? `${product.name} is currently unavailable for rent.`
              : "The selected product is currently unavailable for rent.",
          );
          error.status = 409;
          throw error;
        }
      }

      const customerLockRows = await client.query(
        'SELECT "id" FROM "Customer" WHERE "customerId" = $1 LIMIT 1 FOR UPDATE',
        [customer.customerId],
      );
      if (!customerLockRows.rows.length) {
        const error = new Error(
          "The selected customer record could not be found.",
        );
        error.status = 400;
        throw error;
      }

      const duplicateKey = [
        primaryItem.productId,
        phone,
        bookingDate,
        pickupTime,
        primaryItem.durationDisplay,
      ].join("|");
      await client.query(
        "SELECT pg_advisory_xact_lock(hashtext($1))",
        [duplicateKey],
      );
      const duplicateRows = await client.query(
        `SELECT "id" FROM "RentalRequest"
         WHERE "productId" = $1
           AND "phone" = $2
           AND "bookingDate" = $3
           AND "pickupTime" IS NOT DISTINCT FROM $4
           AND "rentalDuration" = $5
           AND "status" IN ('Pending', 'Confirmed', 'Approved', 'Picked Up', 'Returned', 'Completed')
         LIMIT 1`,
        [
          primaryItem.productId,
          phone,
          bookingDate,
          pickupTime,
          primaryItem.durationDisplay,
        ],
      );
      if (duplicateRows.rows.length) {
        const error = new Error("A similar booking request already exists.");
        error.status = 409;
        throw error;
      }

      let rentalRequest = (
        await client.query(
          `INSERT INTO "RentalRequest" (
            "id", "requestId", "customerId", "userId", "fullName", "email", "phone",
            "address", "productId", "productName", "productImage", "rentalDuration",
            "quantity", "rentalPrice", "totalAmount", "originalAmount", "rewardId", "rewardDiscount",
            "discount", "advanceAmount", "advanceExpected", "bookingDate", "pickupTime", "notes",
            "status", "paymentStatus", "bookingSource", "createdByAdmin", "createdAt", "updatedAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30)
          RETURNING *`,
          [
            id,
            requestId,
            customer.customerId,
            null,
            customer.name,
            customer.email || null,
            phone,
            customer.address || null,
            primaryItem.productId,
            primaryItem.productName,
            primaryItem.productImage,
            primaryItem.durationDisplay,
            1,
            primaryItem.rentalPrice,
            originalAmount,
            originalAmount,
            null,
            0,
            0,
            0,
            advanceExpected,
            bookingDate,
            pickupTime,
            body.notes ? String(body.notes).trim() || null : null,
            "Pending",
            "Pending",
            "Manual",
            adminEmail,
            now,
            now,
          ],
        )
      ).rows[0];

      // Persist every item against the same booking.
      await client.query(
        `INSERT INTO "RentalRequestItem" (
          "id", "rentalRequestId", "productId", "productName", "productImage", "category",
          "durationValue", "durationUnit", "durationDisplay", "rentalPrice",
          "isCustomDuration", "isCustomPrice", "itemOrder", "createdAt", "updatedAt"
        ) SELECT * FROM unnest($1::text[], $2::text[], $3::text[], $4::text[], $5::text[], $6::text[], $7::float8[], $8::text[], $9::text[], $10::float8[], $11::boolean[], $12::boolean[], $13::int4[], $14::timestamptz[], $15::timestamptz[])`,
        [
          validatedItems.map(() => createId()),
          validatedItems.map(() => requestId),
          validatedItems.map((item) => item.productId),
          validatedItems.map((item) => item.productName),
          validatedItems.map((item) => item.productImage),
          validatedItems.map((item) => item.category),
          validatedItems.map((item) => item.durationValue),
          validatedItems.map((item) => item.durationUnit),
          validatedItems.map((item) => item.durationDisplay),
          validatedItems.map((item) => item.rentalPrice),
          validatedItems.map((item) => item.isCustomDuration),
          validatedItems.map((item) => item.isCustomPrice),
          validatedItems.map((_, index) => index),
          validatedItems.map(() => now.toISOString()),
          validatedItems.map(() => now.toISOString()),
        ],
      );

      let reservation = null;
      if (rewardId) {
        reservation = await reserveRewardForRental(client, {
          customerId: customer.customerId,
          rewardId,
          rentalRequestId: requestId,
          originalAmount,
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

      let paymentRecord = null;
      const validatedAdvance = validateManualRentalAdvance({
        action,
        advanceExpected,
        payment: body.payment,
        finalAmount: Number(rentalRequest.totalAmount || 0),
      });
      if (action === "confirm") {
        if (!canTransitionRentalStatus(rentalRequest.status, "Confirmed")) {
          const error = new Error(
            `Rental cannot transition from ${rentalRequest.status} to Confirmed.`,
          );
          error.status = 409;
          throw error;
        }

        if (validatedAdvance.payment) {
          paymentRecord = (
            await client.query(
              `INSERT INTO "RentalPayment" (
                 "id", "rentalRequestId", "paymentType", "amount", "method",
                 "reference", "verified", "verifiedAt", "verifiedBy",
                 "idempotencyKey", "source", "createdAt"
               ) VALUES ($1, $2, 'Advance', $3, $4, NULL, TRUE, $5, $6, $7, 'Admin', $5)
               RETURNING *`,
              [
                createId(),
                requestId,
                validatedAdvance.payment.amount,
                validatedAdvance.payment.method,
                now,
                adminEmail,
                validatedAdvance.payment.idempotencyKey,
              ],
            )
          ).rows[0];
        }
        const confirmedRows = await client.query(
          `UPDATE "RentalRequest"
           SET "status" = 'Confirmed',
               "advanceAmount" = $1,
               "advanceVerified" = $2,
               "advanceVerifiedAt" = $3,
               "advanceVerifiedBy" = $4,
               "advancePaymentMethod" = $5,
               "advancePaymentRef" = NULL,
               "paymentStatus" = $6,
               "confirmedByAdmin" = $4,
               "updatedAt" = $3
           WHERE "id" = $7
           RETURNING *`,
          [
            validatedAdvance.payment?.amount || 0,
            Boolean(validatedAdvance.payment),
            validatedAdvance.payment ? now : null,
            validatedAdvance.payment ? adminEmail : null,
            validatedAdvance.payment?.method || null,
            validatedAdvance.payment
              ? validatedAdvance.payment.amount >=
                Number(rentalRequest.totalAmount || 0)
                ? "Paid"
                : "Advance Paid"
              : "Pending",
            id,
          ],
        );
        rentalRequest = confirmedRows.rows[0];
      }

      const insertedItems = (
        await client.query(
          'SELECT * FROM "RentalRequestItem" WHERE "rentalRequestId" = $1 ORDER BY "itemOrder" ASC, "id" ASC',
          [requestId],
        )
      ).rows;

      const paymentHistory = paymentRecord ? [paymentRecord] : [];
      return {
        rentalRequest: withRentalPaymentSummary(rentalRequest, paymentHistory),
        reservation,
        items: insertedItems,
        paymentHistory,
        paymentRecord,
      };
    });

    const {
      rentalRequest,
      reservation,
      items,
      paymentHistory,
      paymentRecord,
    } = result;

    await createAdminNotification({
      type: "rental_booking",
      title: "New Manual Rental Request",
      message: `${customer.name} · ${items.length} item(s) starting with ${primaryItem.productName} (${primaryItem.durationDisplay}) — booked by ${adminEmail}`,
      relatedId: rentalRequest.id,
      relatedType: "RentalRequest",
    });

    const finalAmount = Number(rentalRequest.totalAmount || 0);

    return NextResponse.json(
      {
        success: true,
        data: rentalRequest,
        items,
        paymentHistory,
        rewardApplied: Boolean(reservation),
        reward: reservation?.reward || null,
        rewardDiscount: reservation?.rewardDiscount || 0,
        finalAmount,
        remainingAmount: rentalRequest.remainingAmount,
        paymentRecord,
        message:
          rentalRequest.status === "Confirmed"
            ? paymentRecord
              ? "Rental created and confirmed after recording the received advance."
              : "Rental created and confirmed without an advance payment."
            : "Rental request created in Pending status.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[ADMIN_RENTALS_POST]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create rental request" },
      { status: error.status || 500 },
    );
  }
}
