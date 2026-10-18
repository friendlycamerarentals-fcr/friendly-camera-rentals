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
} from "@/constants/rentalStatus";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Rental request ID is required." },
        { status: 400 },
      );
    }

    await rewardService.expireRewards();

    const body = await request.json();

    const hasField = (field) =>
      Object.prototype.hasOwnProperty.call(body, field);
    const hasPaymentUpdate = ["totalAmount", "discount", "advanceAmount"].some(
      hasField,
    );
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

    for (const field of ["totalAmount", "discount", "advanceAmount"]) {
      if (hasField(field) && typeof body[field] !== "number") {
        return NextResponse.json(
          { success: false, message: `${field} must be a number.` },
          { status: 400 },
        );
      }
    }

    if (!Object.keys(payload).length && !hasPaymentUpdate) {
      return NextResponse.json(
        { success: false, message: "No valid fields to update" },
        { status: 400 },
      );
    }

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
        payload.status &&
        !canTransitionRentalStatus(existing.status, payload.status)
      ) {
        const error = new Error(
          `Rental cannot transition from ${existing.status} to ${payload.status}.`,
        );
        error.status = 409;
        throw error;
      }

      const updateParts = [];
      const values = [];
      Object.entries(payload).forEach(([key, value]) => {
        updateParts.push(`"${key}" = $${values.length + 1}`);
        values.push(value);
      });

      let originalAmount = Number(
        existing.originalAmount ??
          Number(existing.totalAmount || 0) +
            Number(existing.rewardDiscount || 0),
      );
      let otherDiscount = Number(existing.discount || 0);
      let advanceAmount = Number(existing.advanceAmount || 0);
      const rewardDiscount = Number(existing.rewardDiscount || 0);

      if (hasPaymentUpdate) {
        if (hasField("totalAmount")) originalAmount = body.totalAmount;
        if (hasField("discount")) otherDiscount = body.discount;
        if (hasField("advanceAmount")) advanceAmount = body.advanceAmount;

        if (
          ![originalAmount, otherDiscount, advanceAmount].every(
            Number.isFinite,
          ) ||
          originalAmount < 0 ||
          otherDiscount < 0 ||
          advanceAmount < 0
        ) {
          const error = new Error(
            "Payment amounts must be non-negative numbers.",
          );
          error.status = 400;
          throw error;
        }

        const finalAmount = originalAmount - rewardDiscount - otherDiscount;
        if (finalAmount < 0) {
          const error = new Error(
            "Other discount cannot exceed the amount remaining after the reward discount.",
          );
          error.status = 400;
          throw error;
        }
        if (advanceAmount > finalAmount) {
          const error = new Error("Advance paid cannot exceed the final rent.");
          error.status = 400;
          throw error;
        }

        updateParts.push(
          '"originalAmount" = $' + (values.length + 1),
          '"discount" = $' + (values.length + 2),
          '"advanceAmount" = $' + (values.length + 3),
          '"totalAmount" = $' + (values.length + 4),
        );
        values.push(originalAmount, otherDiscount, advanceAmount, finalAmount);
      }

      values.push(id);
      const updatedRows = await client.query(
        `UPDATE "RentalRequest" SET ${updateParts.join(", ")}, "updatedAt" = NOW() WHERE "id" = $${values.length} RETURNING *`,
        values,
      );
      let updated = updatedRows.rows[0];
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
      return { updated, rewardResult };
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
