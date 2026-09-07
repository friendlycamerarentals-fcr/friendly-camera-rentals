import { NextResponse } from "next/server";
import { query, transaction } from "@/db/query";
import rewardService from "@/services/rewardService";

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

    const payload = {};
    if (typeof body.status === "string") payload.status = body.status;
    if (typeof body.paymentStatus === "string")
      payload.paymentStatus = body.paymentStatus;
    if (typeof body.advanceAmount === "number")
      payload.advanceAmount = body.advanceAmount;
    if (typeof body.totalAmount === "number")
      payload.totalAmount = body.totalAmount;

    if (!Object.keys(payload).length) {
      return NextResponse.json(
        { success: false, message: "No valid fields to update" },
        { status: 400 },
      );
    }

    const existingRows = await query(
      'SELECT * FROM "RentalRequest" WHERE "id" = $1 LIMIT 1',
      [id],
    );
    const existing = existingRows[0];

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Rental request not found." },
        { status: 404 },
      );
    }

    const result = await transaction(async (client) => {
      const updateParts = [];
      const values = [];
      Object.entries(payload).forEach(([key, value]) => {
        updateParts.push(`"${key}" = $${values.length + 1}`);
        values.push(value);
      });
      values.push(id);
      const updatedRows = await client.query(
        `UPDATE "RentalRequest" SET ${updateParts.join(", ")}, "updatedAt" = NOW() WHERE "id" = $${values.length} RETURNING *`,
        values,
      );
      let updated = updatedRows.rows[0];
      let rewardResult = null;

      if (payload.status === "Confirmed" && !updated.rewardId) {
        await client.query(
          'UPDATE "Reward" SET "status" = $1, "expiredDate" = NOW() WHERE "customerId" = $2 AND "status" = $3 AND "expireDate" < NOW()',
          ["Expired", updated.customerId, "Active"],
        );
        const rewardRows = await client.query(
          'SELECT * FROM "Reward" WHERE "customerId" = $1 AND "status" = $2 AND "expireDate" >= NOW() ORDER BY "createdAt" ASC LIMIT 1 FOR UPDATE',
          [updated.customerId, "Active"],
        );
        const reward = rewardRows.rows[0];
        if (reward) {
          const originalAmount = Number(updated.totalAmount || 0);
          const discount = Math.min(
            Number(reward.rewardAmount || 0),
            originalAmount,
          );
          const finalAmount = Math.max(originalAmount - discount, 0);
          await client.query(
            'UPDATE "Reward" SET "status" = $1, "appliedRentalId" = $2, "appliedDate" = NOW(), "usedDate" = NOW() WHERE "id" = $3 AND "status" = $4',
            ["Used", updated.requestId, reward.id, "Active"],
          );
          const rentalRows = await client.query(
            'UPDATE "RentalRequest" SET "rewardId" = $1, "rewardDiscount" = $2, "totalAmount" = $3, "updatedAt" = NOW() WHERE "id" = $4 RETURNING *',
            [reward.rewardId, discount, finalAmount, id],
          );
          updated = rentalRows.rows[0];
          rewardResult = {
            rewardApplied: true,
            reward: { ...reward, status: "Used" },
            rewardDiscount: discount,
            finalAmount,
          };
        }
      }
      return { updated, rewardResult };
    });
    const updated = result.updated;
    let rewardResult = result.rewardResult;
    if (payload.status === "Completed") {
      rewardResult = await rewardService.generateReward(updated.requestId);
    }

    return NextResponse.json(
      { success: true, data: updated, reward: rewardResult },
      { status: 200 },
    );
  } catch (error) {
    console.error("[RENTAL_REQUEST_PATCH]", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update rental request",
      },
      { status: 500 },
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

    await query('DELETE FROM "RentalRequest" WHERE "id" = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[RENTAL_REQUEST_DELETE]", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete rental request" },
      { status: 500 },
    );
  }
}
