import { NextResponse } from "next/server";
import { query, transaction } from "@/db/query";
import rewardService from "@/services/rewardService";
import {
  completeAppliedRewardInTransaction,
  releaseAppliedRewardInTransaction,
} from "@/lib/rewards/applyReward";
import { isRewardEligible } from "@/lib/rewards/rewardValidation";
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
import {
  getAdjustedRewardDiscount,
  getFinalRentalAmount,
  withRentalPaymentSummary,
} from "@/lib/rentalPayments";
import {
  CUSTOM_DURATION_KEY,
  getRentalBookingOriginalAmount,
  MAX_RENTAL_ITEMS,
  getRentalItemsTotal,
  resolveConfiguredRentalPrice,
  resolveCustomRentalItemPrice,
} from "@/lib/rentalItems";
import {
  RENTAL_REQUEST_COLUMNS,
  RENTAL_REQUEST_ITEM_COLUMNS,
  ACTIVE_RENTAL_REQUEST_FILTER,
} from "@/lib/rentalDbColumns";
import { createRentalRequestDeleteHandler } from "@/lib/rentalRequestDelete";
import {
  formatDuration,
  getDurationListingPrice,
  getStandardDurationOptions,
  parsePricingKey,
  toPaise,
} from "@/lib/rentalDuration";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const handleDelete = createRentalRequestDeleteHandler({
  requireAdmin,
  transaction,
  releaseAppliedReward: releaseAppliedRewardInTransaction,
});

const resolveRentalItemPrice = (product, payload) =>
  payload.durationKey.trim() === CUSTOM_DURATION_KEY
    ? resolveCustomRentalItemPrice(
        payload.customDuration,
        payload.agreedPrice,
      )
    : resolveConfiguredRentalPrice(
        product,
        payload.durationKey.trim(),
        payload.agreedPrice,
      );

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
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "A valid rental update is required." },
        { status: 400 },
      );
    }

    const hasField = (field) =>
      Object.prototype.hasOwnProperty.call(body, field);
    const hasPaymentUpdate = ["totalAmount", "discount"].some(hasField);
    const hasPaymentRecord = Boolean(body.payment);
    const hasPaymentStatusUpdate = typeof body.paymentStatus === "string";
    const hasDurationUpdate = hasField("durationUpdate");
    const hasRentalItemUpdate = hasField("rentalItemUpdate");
    const hasRentalItemAddition = hasField("addRentalItem");
    const hasRentalItemMutation =
      hasRentalItemUpdate || hasRentalItemAddition;
    const hasPaymentOperation =
      hasPaymentUpdate || hasPaymentRecord || hasPaymentStatusUpdate;
    const rentalItemPayload = hasRentalItemUpdate
      ? body.rentalItemUpdate
      : body.addRentalItem;

    if (hasRentalItemUpdate && hasRentalItemAddition) {
      return NextResponse.json(
        {
          success: false,
          message: "Add or edit one rental product per request.",
        },
        { status: 400 },
      );
    }

    if (
      hasRentalItemMutation &&
      (!rentalItemPayload ||
        typeof rentalItemPayload !== "object" ||
        Array.isArray(rentalItemPayload) ||
        typeof rentalItemPayload.productId !== "string" ||
        !rentalItemPayload.productId.trim() ||
        typeof rentalItemPayload.durationKey !== "string" ||
        (rentalItemPayload.durationKey.trim() === CUSTOM_DURATION_KEY
          ? !rentalItemPayload.customDuration ||
            typeof rentalItemPayload.customDuration !== "object" ||
            Array.isArray(rentalItemPayload.customDuration)
          : !rentalItemPayload.durationKey.trim() ||
            rentalItemPayload.customDuration != null) ||
        (hasRentalItemUpdate &&
          rentalItemPayload.itemId != null &&
          typeof rentalItemPayload.itemId !== "string") ||
        (hasRentalItemAddition &&
          (typeof rentalItemPayload.submissionKey !== "string" ||
            !rentalItemPayload.submissionKey.trim() ||
            rentalItemPayload.submissionKey.length > 128)) ||
        (rentalItemPayload.agreedPrice != null &&
          !["number", "string"].includes(typeof rentalItemPayload.agreedPrice)))
    ) {
      return NextResponse.json(
        { success: false, message: "A valid rental product update is required." },
        { status: 400 },
      );
    }

    if (
      hasRentalItemMutation &&
      (hasPaymentOperation || hasDurationUpdate || hasField("status"))
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Update rental products separately from status or payment details.",
        },
        { status: 400 },
      );
    }

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
        `SELECT "status" FROM "RentalRequest"
         WHERE "id" = $1 AND ${ACTIVE_RENTAL_REQUEST_FILTER}
         LIMIT 1`,
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
        `SELECT "status" FROM "RentalRequest"
         WHERE "id" = $1 AND ${ACTIVE_RENTAL_REQUEST_FILTER}
         LIMIT 1`,
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
      !hasDurationUpdate &&
      !hasRentalItemMutation
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
        `SELECT ${RENTAL_REQUEST_COLUMNS} FROM "RentalRequest"
         WHERE "id" = $1 AND ${ACTIVE_RENTAL_REQUEST_FILTER}
         LIMIT 1 FOR UPDATE`,
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

      if (
        hasRentalItemMutation &&
        RENTAL_STATUSES_WITHOUT_EXTRA_CHARGES.includes(existing.status)
      ) {
        const error = new Error(
          "Rental products cannot be changed for this rental status.",
        );
        error.status = 409;
        throw error;
      }

      const persistedPayments = (
        await client.query(
          `SELECT * FROM "RentalPayment"
           WHERE "rentalRequestId" = $1
             AND "deletedAt" IS NULL
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
      let rentalItems = [];
      let itemMutationApplied = false;
      let idempotentRentalItemAddition = false;
      let finalAmount =
        originalAmount + totalExtraCharges - rewardDiscount - otherDiscount;

      if (hasRentalItemMutation) {
        const itemRows = await client.query(
          `SELECT ${RENTAL_REQUEST_ITEM_COLUMNS} FROM "RentalRequestItem"
           WHERE "rentalRequestId" = $1
           ORDER BY "itemOrder" ASC, "id" ASC
           FOR UPDATE`,
          [existing.requestId],
        );
        rentalItems = itemRows.rows;

        const insertPrimaryRentalItem = async () => {
          const primaryProductRows = await client.query(
            'SELECT "category", "pricing" FROM "RentalProduct" WHERE "id" = $1 LIMIT 1',
            [existing.productId],
          );
          const primaryProduct = primaryProductRows.rows[0];
          const parsedDuration = parsePricingKey(existing.rentalDuration);
          const configuredOption = getStandardDurationOptions(
            primaryProduct,
          ).find(
            (option) =>
              option.value === parsedDuration?.value &&
              option.unit === parsedDuration?.unit,
          );
          const rentalPrice = getRentalBookingOriginalAmount(existing);
          const insertedRows = await client.query(
            `INSERT INTO "RentalRequestItem" (
               "id", "rentalRequestId", "productId", "productName", "productImage",
               "category", "durationValue", "durationUnit", "durationDisplay",
               "rentalPrice", "isCustomDuration", "isCustomPrice",
               "itemOrder", "submissionKey", "createdAt", "updatedAt"
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 0, NULL, NOW(), NOW())
             RETURNING ${RENTAL_REQUEST_ITEM_COLUMNS}`,
            [
              createId(),
              existing.requestId,
              existing.productId,
              existing.productName,
              existing.productImage || null,
              primaryProduct?.category || null,
              parsedDuration?.value ?? null,
              parsedDuration?.unit ?? null,
              existing.rentalDuration || "—",
              rentalPrice,
              !parsedDuration,
              !configuredOption ||
                toPaise(configuredOption.price) !== toPaise(rentalPrice),
            ],
          );
          return insertedRows.rows[0];
        };

        if (hasRentalItemAddition) {
          const matchingSubmission = rentalItems.find(
            (item) => item.submissionKey === rentalItemPayload.submissionKey,
          );
          if (matchingSubmission) {
            const requestedPrice =
              rentalItemPayload.agreedPrice == null ||
              rentalItemPayload.agreedPrice === ""
                ? null
                : Number(rentalItemPayload.agreedPrice);
            const customDurationSelected =
              rentalItemPayload.durationKey.trim() === CUSTOM_DURATION_KEY;
            const customResolution = customDurationSelected
              ? resolveCustomRentalItemPrice(
                  rentalItemPayload.customDuration,
                  requestedPrice ?? matchingSubmission.rentalPrice,
                )
              : null;
            const requestedDuration = customDurationSelected
              ? customResolution?.duration
              : parsePricingKey(rentalItemPayload.durationKey.trim());
            if (
              matchingSubmission.productId !== rentalItemPayload.productId.trim() ||
              matchingSubmission.durationDisplay !==
                (requestedDuration ? formatDuration(requestedDuration) : "") ||
              matchingSubmission.isCustomDuration !== customDurationSelected ||
              (customDurationSelected && !customResolution?.ok) ||
              (requestedPrice != null &&
                (!Number.isFinite(requestedPrice) ||
                  toPaise(requestedPrice) !==
                    toPaise(matchingSubmission.rentalPrice)))
            ) {
              const error = new Error(
                "This submission key was already used for a different rental product.",
              );
              error.status = 409;
              throw error;
            }
            idempotentRentalItemAddition = true;
          } else {
            const currentItemCount = rentalItems.length || 1;
            if (currentItemCount >= MAX_RENTAL_ITEMS) {
              const error = new Error(
                `A booking can contain at most ${MAX_RENTAL_ITEMS} rental items.`,
              );
              error.status = 400;
              throw error;
            }

            const productRows = await client.query(
              `SELECT "id", "name", "image", "available", "category", "pricing"
               FROM "RentalProduct" WHERE "id" = $1 LIMIT 1 FOR SHARE`,
              [rentalItemPayload.productId.trim()],
            );
            const product = productRows.rows[0];
            if (!product || product.available === false) {
              const error = new Error(
                product
                  ? `${product.name} is currently unavailable for rent.`
                  : "The selected rental product was not found.",
              );
              error.status = product ? 409 : 404;
              throw error;
            }

            const resolvedPrice = resolveRentalItemPrice(
              product,
              rentalItemPayload,
            );
            if (!resolvedPrice.ok) {
              const error = new Error(resolvedPrice.message);
              error.status = 400;
              throw error;
            }

            if (!rentalItems.length) {
              rentalItems.push(await insertPrimaryRentalItem());
            }
            const nextOrder =
              Math.max(...rentalItems.map((item) => Number(item.itemOrder || 0))) +
              1;
            const insertedRows = await client.query(
              `INSERT INTO "RentalRequestItem" (
                 "id", "rentalRequestId", "productId", "productName", "productImage",
                 "category", "durationValue", "durationUnit", "durationDisplay",
                 "rentalPrice", "isCustomDuration", "isCustomPrice",
                 "itemOrder", "submissionKey", "createdAt", "updatedAt"
               ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
               RETURNING ${RENTAL_REQUEST_ITEM_COLUMNS}`,
              [
                createId(),
                existing.requestId,
                product.id,
                product.name,
                product.image || null,
                product.category || null,
                resolvedPrice.duration.value,
                resolvedPrice.duration.unit,
                formatDuration(resolvedPrice.duration),
                resolvedPrice.rentalPrice,
                resolvedPrice.isCustomDuration === true,
                resolvedPrice.isCustomPrice,
                nextOrder,
                rentalItemPayload.submissionKey.trim(),
              ],
            );
            rentalItems.push(insertedRows.rows[0]);
            itemMutationApplied = true;
          }
        } else {
          let targetItemId = rentalItemPayload.itemId;
          if (!rentalItems.length) {
            if (rentalItemPayload.itemId != null) {
              const error = new Error("Rental item not found on this booking.");
              error.status = 404;
              throw error;
            }
            const primaryItem = await insertPrimaryRentalItem();
            rentalItems.push(primaryItem);
            targetItemId = primaryItem.id;
          } else if (rentalItemPayload.itemId == null) {
            const error = new Error(
              "Select a rental item before editing its product.",
            );
            error.status = 400;
            throw error;
          }

          const targetItem = rentalItems.find(
            (item) => item.id === targetItemId,
          );
          if (!targetItem) {
            const error = new Error("Rental item not found on this booking.");
            error.status = 404;
            throw error;
          }
          const productRows = await client.query(
            `SELECT "id", "name", "image", "available", "category", "pricing"
             FROM "RentalProduct" WHERE "id" = $1 LIMIT 1 FOR SHARE`,
            [rentalItemPayload.productId.trim()],
          );
          const product = productRows.rows[0];
          if (!product) {
            const error = new Error("The selected rental product was not found.");
            error.status = 404;
            throw error;
          }
          if (product.available === false) {
            const error = new Error(
              `${product.name} is currently unavailable for rent.`,
            );
            error.status = 409;
            throw error;
          }
          const isPrimaryItem = rentalItems[0]?.id === targetItem.id;
          if (
            existing.rewardId &&
            isPrimaryItem &&
            product.id !== targetItem.productId &&
            !isRewardEligible(product.category)
          ) {
            const error = new Error(
              "The primary product on a reward-linked rental must remain a camera.",
            );
            error.status = 409;
            throw error;
          }

          const resolvedPrice = resolveRentalItemPrice(
            product,
            rentalItemPayload,
          );
          if (!resolvedPrice.ok) {
            const error = new Error(resolvedPrice.message);
            error.status = 400;
            throw error;
          }
          await client.query(
            `UPDATE "RentalRequestItem"
             SET "productId" = $1, "productName" = $2, "productImage" = $3,
                 "category" = $4, "durationValue" = $5, "durationUnit" = $6,
                 "durationDisplay" = $7, "rentalPrice" = $8,
                 "isCustomDuration" = $9, "isCustomPrice" = $10,
                 "updatedAt" = NOW()
             WHERE "id" = $11`,
            [
              product.id,
              product.name,
              product.image || null,
              product.category || null,
              resolvedPrice.duration.value,
              resolvedPrice.duration.unit,
              formatDuration(resolvedPrice.duration),
              resolvedPrice.rentalPrice,
              resolvedPrice.isCustomDuration === true,
              resolvedPrice.isCustomPrice,
              targetItem.id,
            ],
          );
          if (rentalItems[0]?.id === targetItem.id) {
            pushUpdate("productId", product.id);
            pushUpdate("productName", product.name);
            pushUpdate("productImage", product.image || null);
            pushUpdate("rentalDuration", formatDuration(resolvedPrice.duration));
            pushUpdate("rentalPrice", resolvedPrice.rentalPrice);
          }
          itemMutationApplied = true;
        }

        if (itemMutationApplied) {
          rentalItems = (
            await client.query(
              `SELECT ${RENTAL_REQUEST_ITEM_COLUMNS} FROM "RentalRequestItem"
               WHERE "rentalRequestId" = $1
               ORDER BY "itemOrder" ASC, "id" ASC`,
              [existing.requestId],
            )
          ).rows;
          originalAmount = getRentalItemsTotal(rentalItems);
          if (existing.rewardId) {
            const adjustedRewardDiscount = getAdjustedRewardDiscount({
              originalAmount,
              rewardDiscount,
              otherDiscount,
              advanceAmount,
            });
            if (adjustedRewardDiscount !== rewardDiscount) {
              rewardDiscount = adjustedRewardDiscount;
              pushUpdate("rewardDiscount", rewardDiscount);
            }
          }
          const rawFinalAmount =
            originalAmount + totalExtraCharges - rewardDiscount - otherDiscount;
          if (rawFinalAmount < 0) {
            const error = new Error(
              "The configured reward and discount exceed the new rental amount.",
            );
            error.status = 400;
            throw error;
          }
          finalAmount = getFinalRentalAmount(
            {
              ...existing,
              originalAmount,
              rewardDiscount,
              discount: otherDiscount,
            },
            extraCharges,
          );
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
      }

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
            `SELECT ${RENTAL_REQUEST_ITEM_COLUMNS} FROM "RentalRequestItem"
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
          originalAmount = getRentalItemsTotal(
            rentalItems.map((item) => ({
              ...item,
              rentalPrice:
                item.id === targetItem.id ? rentalPrice : item.rentalPrice,
            })),
          );
          if (rentalItems[0]?.id === targetItem.id) {
            pushUpdate("rentalDuration", formatDuration(parsedDuration));
            pushUpdate("rentalPrice", rentalPrice);
          }
        } else {
          originalAmount = getRentalBookingOriginalAmount(existing);
          pushUpdate("rentalDuration", formatDuration(parsedDuration));
          pushUpdate("rentalPrice", rentalPrice);
        }

        if (existing.rewardId) {
          const adjustedRewardDiscount = getAdjustedRewardDiscount({
            originalAmount,
            rewardDiscount,
            otherDiscount,
            advanceAmount,
          });
          if (adjustedRewardDiscount !== rewardDiscount) {
            rewardDiscount = adjustedRewardDiscount;
            pushUpdate("rewardDiscount", rewardDiscount);
          }
        }
      }

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
        const rawFinalAmount =
          originalAmount + totalExtraCharges - rewardDiscount - otherDiscount;
        if (rawFinalAmount < 0) {
          const error = new Error(
            "The configured reward and discount exceed the new rental amount.",
          );
          error.status = 400;
          throw error;
        }
        finalAmount = getFinalRentalAmount(
          {
            ...existing,
            originalAmount,
            rewardDiscount,
            discount: otherDiscount,
          },
          extraCharges,
        );
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
        if (!duplicatePayment) {
          const deletedDuplicateRows = await client.query(
            `SELECT "id" FROM "RentalPayment"
             WHERE "rentalRequestId" = $1
               AND "idempotencyKey" = $2
               AND "deletedAt" IS NOT NULL
             LIMIT 1`,
            [existing.requestId, idempotencyKey],
          );
          if (deletedDuplicateRows.rows.length) {
            const error = new Error(
              "This payment submission was already deleted. Submit a new payment record.",
            );
            error.status = 409;
            throw error;
          }
        }
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

      if (
        !updateParts.length &&
        !paymentRecord &&
        !idempotentRentalItemAddition
      ) {
        const error = new Error("No valid fields to update");
        error.status = 400;
        throw error;
      }

      let updated = existing;
      if (updateParts.length) {
        values.push(id);
        const updatedRows = await client.query(
          `UPDATE "RentalRequest" SET ${updateParts.join(", ")}, "updatedAt" = NOW() WHERE "id" = $${values.length} RETURNING ${RENTAL_REQUEST_COLUMNS}`,
          values,
        );
        updated = updatedRows.rows[0];
      }
      const updatedPayments = (
        await client.query(
          `SELECT * FROM "RentalPayment"
           WHERE "rentalRequestId" = $1
             AND "deletedAt" IS NULL
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
          `SELECT ${RENTAL_REQUEST_ITEM_COLUMNS} FROM "RentalRequestItem"
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

export async function DELETE(request, context) {
  const result = await handleDelete(request, context);
  if (result.status >= 500) {
    console.error("[RENTAL_REQUEST_DELETE]", result.body.message);
  }
  return NextResponse.json(result.body, { status: result.status });
}
