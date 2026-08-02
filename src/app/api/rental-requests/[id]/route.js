import { NextResponse } from "next/server";
import { query } from "@/db/query";
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

    const updateParts = [];
    const values = [];

    Object.entries(payload).forEach(([key, value]) => {
      updateParts.push(`"${key}" = $${values.length + 1}`);
      values.push(value);
    });

    values.push(id);

    const updatedRows = await query(
      `UPDATE "RentalRequest" SET ${updateParts.join(", ")} WHERE "id" = $${values.length} RETURNING *`,
      values,
    );
    const updated = updatedRows[0];

    let rewardResult = null;

    if (payload.status === "Completed") {
      await rewardService.completeReward(updated.requestId);
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
