import { NextResponse } from "next/server";
import { query, transaction } from "@/db/query";
import rewardService from "@/services/rewardService";
import {
  completeAppliedRewardInTransaction,
  releaseAppliedRewardInTransaction,
} from "@/lib/rewards/applyReward";
import {
  canTransitionRentalStatus,
  isRentalStatus,
  RENTAL_STATUSES_WITHOUT_EXTRA_CHARGES,
} from "@/constants/rentalStatus";
import { requireAdmin } from "@/lib/adminAuth";
import { createId } from "@/lib/createId";
import {
  matchesRentalPaymentSubmission,
  validateAdvancePayment,
} from "@/lib/rentalPayment";
import { withRentalPaymentSummary } from "@/lib/rentalPayments";
import {
  formatDuration,
  fromPaise,
  getDurationListingPrice,
  parsePricingKey,
  sumPaise,
  toPaise,
} from "@/lib/rentalDuration";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(request, { params }) {
  try {
    // Admin-only action: status transitions, payment recording and booking
    // edits are never performed by customers or anonymous visitors.
    const { email: adminEmail } = await requireAdmin();

    const resolvedParams = await params;
    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Rental request ID is required." },
        { status: 400 },
      );
    }

    const body = await request.json();

    const hasField = (field) =>
      Object.prototype.hasOwnProperty.call(body, field);
    const hasPaymentUpdate = ["totalAmount", "discount"].some(hasField);
    const hasPaymentRecord = Boolean(body.payment);
    const hasPaymentStatusUpdate = typeof body.paymentStatus === "string";
    const hasDurationUpdate = hasField("durationUpdate");
    const hasPaymentOperation =
      hasPaymentUpdate || hasPaymentRecord || hasPaymentStatusUpdate;

    if (
      hasDurationUpdate &&
      (!body.durationUpdate ||
        typeof body.durationUpdate !== "object" ||
        Array.isArray(body.durationUpdate) ||
        typeof body.durationUpdate.key !== "string" ||
        !body.durationUpdate.key.trim() ||
        (body.durationUpdate.itemId != null &&
          typeof body.durationUpdate.itemId !== "string"))
    ) {
      return NextResponse.json(
        { success: false, message: "A valid rental duration is required." },
        { status: 400 },
      );
    }

    if (
      hasDurationUpdate &&
      (hasPaymentOperation || hasPaymentStatusUpdate)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Update the rental duration separately from payment details.",
        },
        { status: 400 },
      );
    }

    if (hasPaymentOperation) {
      const currentRentalRows = await query(
        'SELECT "status" FROM "RentalRequest" WHERE "id" = $1 LIMIT 1',
        [id],
      );
      if (
        RENTAL_STATUSES_WITHOUT_EXTRA_CHARGES.includes(body.status) ||
        RENTAL_STATUSES_WITHOUT_EXTRA_CHARGES.includes(
          currentRentalRows[0]?.status,
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Payment management is unavailable for this rental status.",
          },
          { status: 409 },
        );
      }
    }

    if (hasDurationUpdate) {
      const currentRentalRows = await query(
        'SELECT "status" FROM "RentalRequest" WHERE "id" = $1 LIMIT 1',
        [id],
      );
      if (
        RENTAL_STATUSES_WITHOUT_EXTRA_CHARGES.includes(
          currentRentalRows[0]?.status,
        ) ||
        RENTAL_STATUSES_WITHOUT_EXTRA_CHARGES.includes(body.status)
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Rental duration cannot be changed for this rental status.",
          },
          { status: 409 },
        );
      }
    }

    await rewardService.expireRewards();

    const payload = {};
    if (hasField("status")) {
      if (typeof body.status !== "string" || !isRentalStatus(body.status)) {
        return NextResponse.json(
          { success: false, message: "Invalid rental status." },
          { status: 400 },
        );
      }
      payload.status = body.status;
    }
    if (typeof body.paymentStatus === "string")
      payload.paymentStatus = body.paymentStatus;

    for (const field of ["totalAmount", "discount"]) {
      if (hasField(field) && typeof body[field] !== "number") {
        return NextResponse.json(
          { success: false, message: `${field} must be a number.` },
          { status: 400 },
        );
      }
    }

    // The advance is only ever changed through the dedicated payment-recording
    // action so that recorded money is always verified by an admin.
    if (hasField("advanceAmount")) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Use the payment recording action to add an advance. Advances must be verified by an admin.",
        },
        { status: 400 },
      );
    }

    if (
      !Object.keys(payload).length &&
      !hasPaymentUpdate &&
      !hasPaymentRecord &&
      !hasDurationUpdate
    ) {
      return NextResponse.json(
        { success: false, message: "No valid fields to update" },
        { status: 400 },
      );
    }

    const updateParts = [];
    const values = [];
    const pushUpdate = (column, value) => {
      updateParts.push(`"${column}" = $${values.length + 1}`);
      values.push(value);
    };

    const result = await transaction(async (client) => {
      const existingRows = await client.query(
        'SELECT * FROM "RentalRequest" WHERE "id" = $1 LIMIT 1 FOR UPDATE',
        [id],
      );
      const existing = existingRows.rows[0];
      if (!existing) {
        const error = new Error("Rental request not found.");
        error.status = 404;
        throw error;
      }

      if (
        hasPaymentOperation &&
        (RENTAL_STATUSES_WITHOUT_EXTRA_CHARGES.includes(existing.status) ||
          RENTAL_STATUSES_WITHOUT_EXTRA_CHARGES.includes(payload.status))
      ) {
        const error = new Error(
          "Payment management is unavailable for this rental status.",
        );
        error.status = 409;
        throw error;
      }

      if (
        payload.status &&
        !canTransitionRentalStatus(existing.status, payload.status)
      ) {
        const error = new Error(
          `Rental cannot transition from ${existing.status} to ${payload.status}.`,
        );
        error.status = 409;
        throw error;
      }

      if (
        hasDurationUpdate &&
        (RENTAL_STATUSES_WITHOUT_EXTRA_CHARGES.includes(existing.status) ||
          RENTAL_STATUSES_WITHOUT_EXTRA_CHARGES.includes(payload.status))
      ) {
        const error = new Error(
          "Rental duration cannot be changed for this rental status.",
        );
        error.status = 409;
        throw error;
      }

      const persistedPayments = (
        await client.query(
          `SELECT * FROM "RentalPayment"
           WHERE "rentalRequestId" = $1
           ORDER BY "createdAt" ASC, "id" ASC`,
          [existing.requestId],
        )
      ).rows;
      const extraCharges = (
        await client.query(
          `SELECT * FROM "RentalExtraCharge"
           WHERE "rentalRequestId" = $1
           ORDER BY "createdAt" ASC, "id" ASC`,
          [existing.requestId],
        )
      ).rows;
      const currentPaymentSummary = withRentalPaymentSummary(
        existing,
        persistedPayments,
        extraCharges,
      ).paymentSummary;

      let originalAmount = Number(
        existing.originalAmount ??
          Number(existing.totalAmount || 0) +
            Number(existing.rewardDiscount || 0),
      );
      let otherDiscount = Number(existing.discount || 0);
      const advanceAmount = currentPaymentSummary.advanceReceived;
      const totalVerifiedPayments = currentPaymentSummary.totalVerifiedPayments;
      let rewardDiscount = Number(existing.rewardDiscount || 0);
      const totalExtraCharges = Number(currentPaymentSummary.totalExtraCharges || 0);

      if (hasDurationUpdate) {
        const durationKey = body.durationUpdate.key.trim();
        const parsedDuration = parsePricingKey(durationKey);
        if (!parsedDuration) {
          const error = new Error("Select a valid configured rental duration.");
          error.status = 400;
          throw error;
        }

        const rentalItems = (
          await client.query(
            `SELECT * FROM "RentalRequestItem"
             WHERE "rentalRequestId" = $1
             ORDER BY "itemOrder" ASC, "id" ASC`,
            [existing.requestId],
          )
        ).rows;
        const itemId = body.durationUpdate.itemId || null;
        let targetItem = null;
        if (itemId) {
          targetItem = rentalItems.find((item) => item.id === itemId);
          if (!targetItem) {
            const error = new Error("Rental item not found on this booking.");
            error.status = 404;
            throw error;
          }
        } else if (rentalItems.length) {
          const error = new Error(
            "Select a rental item before changing its duration.",
          );
          error.status = 400;
          throw error;
        }

        const productId = targetItem?.productId || existing.productId;
        const productRows = await client.query(
          'SELECT "id", "pricing" FROM "RentalProduct" WHERE "id" = $1 LIMIT 1 FOR SHARE',
          [productId],
        );
        const product = productRows.rows[0];
        const rentalPrice = Number(
          getDurationListingPrice(product, {
            type: "standard",
            key: durationKey,
          }),
        );
        if (!product || !Number.isFinite(rentalPrice) || rentalPrice <= 0) {
          const error = new Error(
            "That duration does not have a configured price for this product.",
          );
          error.status = 400;
          throw error;
        }

        if (targetItem) {
          await client.query(
            `UPDATE "RentalRequestItem"
             SET "durationValue" = $1, "durationUnit" = $2,
                 "durationDisplay" = $3, "rentalPrice" = $4,
                 "isCustomDuration" = FALSE, "isCustomPrice" = FALSE,
                 "updatedAt" = NOW()
             WHERE "id" = $5`,
            [
              parsedDuration.value,
              parsedDuration.unit,
              formatDuration(parsedDuration),
              rentalPrice,
              targetItem.id,
            ],
          );
          originalAmount = fromPaise(
            sumPaise(
              rentalItems.map((item) =>
                item.id === targetItem.id ? rentalPrice : item.rentalPrice,
              ),
            ),
          );
          if (rentalItems[0]?.id === targetItem.id) {
            pushUpdate("rentalDuration", formatDuration(parsedDuration));
            pushUpdate("rentalPrice", rentalPrice);
          }
        } else {
          originalAmount = fromPaise(
            toPaise(rentalPrice) * Number(existing.quantity || 1),
          );
          pushUpdate("rentalDuration", formatDuration(parsedDuration));
          pushUpdate("rentalPrice", rentalPrice);
        }

        if (existing.rewardId) {
          const rewardDiscountLimit = Math.max(
            fromPaise(
              toPaise(originalAmount) -
                toPaise(otherDiscount) -
                toPaise(advanceAmount),
            ),
            0,
          );
          const adjustedRewardDiscount = Math.min(
            rewardDiscount,
            rewardDiscountLimit,
          );
          if (adjustedRewardDiscount !== rewardDiscount) {
            rewardDiscount = adjustedRewardDiscount;
            pushUpdate("rewardDiscount", rewardDiscount);
          }
        }
      }

      let finalAmount =
        originalAmount + totalExtraCharges - rewardDiscount - otherDiscount;

      if (hasPaymentUpdate) {
        if (hasField("totalAmount")) originalAmount = body.totalAmount;
        if (hasField("discount")) otherDiscount = body.discount;

        if (
          ![originalAmount, otherDiscount].every(Number.isFinite) ||
          originalAmount < 0 ||
          otherDiscount < 0
        ) {
          const error = new Error(
            "Payment amounts must be non-negative numbers.",
          );
          error.status = 400;
          throw error;
        }

        finalAmount =
          originalAmount + totalExtraCharges - rewardDiscount - otherDiscount;
        if (finalAmount < 0) {
          const error = new Error(
            "Other discount cannot exceed the amount remaining after the reward discount.",
          );
          error.status = 400;
          throw error;
        }
        if (totalVerifiedPayments > finalAmount) {
          const error = new Error(
            "Recorded payments exceed the updated final rent. Reduce the final amount change or issue an appropriate refund.",
          );
          error.status = 400;
          throw error;
        }

        pushUpdate("originalAmount", originalAmount);
        pushUpdate("discount", otherDiscount);
        pushUpdate("totalAmount", finalAmount);
      }

      if (hasDurationUpdate) {
        finalAmount =
          originalAmount + totalExtraCharges - rewardDiscount - otherDiscount;
        if (finalAmount < 0) {
          const error = new Error(
            "The configured reward and discount exceed the new rental amount.",
          );
          error.status = 400;
          throw error;
        }
        if (totalVerifiedPayments > finalAmount) {
          const error = new Error(
            "Verified payments exceed the new rental amount. Record an appropriate refund before reducing the duration.",
          );
          error.status = 400;
          throw error;
        }
        pushUpdate("originalAmount", originalAmount);
        pushUpdate("totalAmount", finalAmount);
        pushUpdate(
          "paymentStatus",
          totalVerifiedPayments >= finalAmount
            ? "Paid"
            : totalVerifiedPayments > 0
              ? "Advance Paid"
              : "Pending",
        );
      }

      Object.entries(payload).forEach(([key, value]) => {
        pushUpdate(key, value);
      });

      // ---- Record a verified advance payment ---------------------------
      let paymentRecord = null;
      if (hasPaymentRecord) {
        const idempotencyKey =
          typeof body.payment.idempotencyKey === "string"
            ? body.payment.idempotencyKey.trim()
            : "";
        if (!idempotencyKey || idempotencyKey.length > 128) {
          const error = new Error("A valid payment submission key is required.");
          error.status = 400;
          throw error;
        }
        const duplicatePayment = persistedPayments.find(
          (payment) => payment.idempotencyKey === idempotencyKey,
        );
        finalAmount =
          originalAmount + totalExtraCharges - rewardDiscount - otherDiscount;
        const remainingBalance = Math.max(
          Math.round((finalAmount - totalVerifiedPayments) * 100) / 100,
          0,
        );
        const payment = validateAdvancePayment(
          { ...body.payment, idempotencyKey },
          duplicatePayment
            ? Math.max(remainingBalance, Number(duplicatePayment.amount))
            : remainingBalance,
          finalAmount,
        );

        if (duplicatePayment) {
          if (!matchesRentalPaymentSubmission(duplicatePayment, payment)) {
            const error = new Error(
              "This payment submission key was already used for a different payment.",
            );
            error.status = 409;
            throw error;
          }
          paymentRecord = duplicatePayment;
        } else {
          const paymentRows = await client.query(
            `INSERT INTO "RentalPayment" (
               "id", "rentalRequestId", "paymentType", "amount", "method",
               "reference", "verified", "verifiedAt", "verifiedBy",
               "idempotencyKey", "source", "createdAt"
             ) VALUES ($1, $2, $3, $4, $5, $6, TRUE, NOW(), $7, $8, 'Admin', NOW())
             RETURNING *`,
            [
              createId(),
              existing.requestId,
              payment.paymentType,
              payment.amount,
              payment.method,
              payment.reference,
              adminEmail,
              idempotencyKey,
            ],
          );
          paymentRecord = paymentRows.rows[0];

          const newTotalVerified =
            Math.round((totalVerifiedPayments + payment.amount) * 100) / 100;
          if (payment.paymentType === "Advance") {
            const newAdvance =
              Math.round((advanceAmount + payment.amount) * 100) / 100;
            pushUpdate("advanceAmount", newAdvance);
            pushUpdate("advanceVerified", true);
            pushUpdate("advanceVerifiedAt", paymentRecord.verifiedAt);
            pushUpdate("advanceVerifiedBy", adminEmail);
            pushUpdate("advancePaymentMethod", payment.method);
            pushUpdate("advancePaymentRef", payment.reference);
          }
          pushUpdate(
            "paymentStatus",
            newTotalVerified >= finalAmount
              ? "Paid"
              : newTotalVerified > 0
                ? "Advance Paid"
                : "Pending",
          );
        }
      }

      // Confirmation does not require an advance. Any advance remains recorded
      // only through the verified payment action above.
      if (payload.status === "Confirmed") {
        // Recheck product availability at confirmation time.
        const productRows = await client.query(
          'SELECT "name", "available" FROM "RentalProduct" WHERE "id" = $1 LIMIT 1',
          [existing.productId],
        );
        const product = productRows.rows[0];
        if (!product || product.available === false) {
          const error = new Error(
            product
              ? `${product.name} is currently unavailable for rent.`
              : "The selected product is currently unavailable for rent.",
          );
          error.status = 400;
          throw error;
        }

        pushUpdate("confirmedByAdmin", adminEmail);
      }

      if (!updateParts.length && !paymentRecord) {
        const error = new Error("No valid fields to update");
        error.status = 400;
        throw error;
      }

      let updated = existing;
      if (updateParts.length) {
        values.push(id);
        const updatedRows = await client.query(
          `UPDATE "RentalRequest" SET ${updateParts.join(", ")}, "updatedAt" = NOW() WHERE "id" = $${values.length} RETURNING *`,
          values,
        );
        updated = updatedRows.rows[0];
      }
      const updatedPayments = (
        await client.query(
          `SELECT * FROM "RentalPayment"
           WHERE "rentalRequestId" = $1
           ORDER BY "createdAt" ASC, "id" ASC`,
          [updated.requestId],
        )
      ).rows;
      const updatedExtraCharges = (
        await client.query(
          `SELECT * FROM "RentalExtraCharge"
           WHERE "rentalRequestId" = $1
           ORDER BY "createdAt" ASC, "id" ASC`,
          [updated.requestId],
        )
      ).rows;
      const updatedItems = (
        await client.query(
          `SELECT * FROM "RentalRequestItem"
           WHERE "rentalRequestId" = $1
           ORDER BY "itemOrder" ASC, "id" ASC`,
          [updated.requestId],
        )
      ).rows;
      if (updatedItems.length) updated.items = updatedItems;
      updated = withRentalPaymentSummary(
        updated,
        updatedPayments,
        updatedExtraCharges,
      );
      let rewardResult = null;

      if (payload.status === "Completed" && existing.status !== "Completed") {
        rewardResult = await completeAppliedRewardInTransaction(
          client,
          updated.requestId,
        );
      } else if (["Cancelled", "Rejected"].includes(payload.status)) {
        rewardResult = await releaseAppliedRewardInTransaction(
          client,
          updated.requestId,
        );
      }
      return { updated, rewardResult, paymentRecord };
    });

    const updated = result.updated;
    let rewardResult = result.rewardResult;
    let generatedReward = null;
    if (payload.status === "Completed") {
      generatedReward = await rewardService.generateReward(updated.requestId);
      rewardResult = generatedReward;
    }

    return NextResponse.json(
      {
        success: true,
        data: updated,
        reward: rewardResult,
        appliedReward: result.rewardResult,
        generatedReward,
        paymentRecord: result.paymentRecord,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[RENTAL_REQUEST_PATCH]", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update rental request",
      },
      { status: error.status || 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAdmin();

    const resolvedParams = await params;
    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Rental request ID is required." },
        { status: 400 },
      );
    }

    await transaction(async (client) => {
      const rentalRows = await client.query(
        'SELECT "rewardId", "rewardDiscount", "requestId" FROM "RentalRequest" WHERE "id" = $1 LIMIT 1 FOR UPDATE',
        [id],
      );
      const rental = rentalRows.rows[0];
      if (!rental) return;

      const generatedRewardRows = await client.query(
        'SELECT "id" FROM "Reward" WHERE "rentalRequestId" = $1 LIMIT 1',
        [rental.requestId],
      );

      if (
        rental.rewardId ||
        Number(rental.rewardDiscount || 0) > 0 ||
        generatedRewardRows.rows.length
      ) {
        const error = new Error(
          "Reward-linked rentals cannot be deleted. Cancel or reject the rental to preserve its history and release the reward.",
        );
        error.status = 409;
        throw error;
      }

      const paymentRows = await client.query(
        'SELECT "id" FROM "RentalPayment" WHERE "rentalRequestId" = $1 LIMIT 1',
        [rental.requestId],
      );
      if (paymentRows.rows.length) {
        const error = new Error(
          "Rental requests with recorded payments cannot be deleted. Cancel the request to preserve its payment history.",
        );
        error.status = 409;
        throw error;
      }

      await client.query('DELETE FROM "RentalRequest" WHERE "id" = $1', [id]);
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[RENTAL_REQUEST_DELETE]", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete rental request",
      },
      { status: error.status || 500 },
    );
  }
}
