import { NextResponse } from "next/server";
import { query, transaction } from "@/db/query";
import { createId } from "@/lib/createId";
import { requireAdmin } from "@/lib/adminAuth";
import {
  getFinalRentalAmount,
  withRentalPaymentSummary,
} from "@/lib/rentalPayments";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_request, { params }) {
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

    const rentalRows = await query(
      'SELECT * FROM "RentalRequest" WHERE "id" = $1 LIMIT 1',
      [id],
    );
    const rental = rentalRows[0];
    if (!rental) {
      return NextResponse.json(
        { success: false, message: "Rental request not found." },
        { status: 404 },
      );
    }

    const extraCharges = await query(
      `SELECT * FROM "RentalExtraCharge"
       WHERE "rentalRequestId" = $1
       ORDER BY "createdAt" ASC, "id" ASC`,
      [rental.requestId],
    );

    return NextResponse.json({ success: true, data: extraCharges });
  } catch (error) {
    console.error("[RENTAL_EXTRA_CHARGES_GET]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load extra charges." },
      { status: error.status || 500 },
    );
  }
}

export async function POST(request, { params }) {
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

    const body = await request.json();
    const extraHours = Number(body.extraHours);
    const extraAmount = Number(body.extraAmount);
    const note = typeof body.note === "string" ? body.note.trim() : "";

    if (!Number.isFinite(extraHours) || extraHours <= 0) {
      return NextResponse.json(
        { success: false, message: "Extra hours must be a positive number." },
        { status: 400 },
      );
    }

    if (!Number.isFinite(extraAmount) || extraAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "Extra amount must be a positive number." },
        { status: 400 },
      );
    }

    if (note.length > 500) {
      return NextResponse.json(
        { success: false, message: "Note must be shorter than 500 characters." },
        { status: 400 },
      );
    }

    const result = await transaction(async (client) => {
      const rentalRows = await client.query(
        'SELECT * FROM "RentalRequest" WHERE "id" = $1 LIMIT 1 FOR UPDATE',
        [id],
      );
      const rental = rentalRows.rows[0];
      if (!rental) {
        const error = new Error("Rental request not found.");
        error.status = 404;
        throw error;
      }

      const duplicateRows = await client.query(
        `SELECT "id" FROM "RentalExtraCharge"
         WHERE "rentalRequestId" = $1
           AND "extraHours" = $2
           AND "extraAmount" = $3
           AND COALESCE("note", '') = COALESCE($4, '')
           AND "createdAt" >= NOW() - INTERVAL '5 minutes'
         LIMIT 1`,
        [rental.requestId, extraHours, extraAmount, note || null],
      );
      if (duplicateRows.rows.length) {
        const error = new Error(
          "This extra charge was already recorded recently.",
        );
        error.status = 409;
        throw error;
      }

      const existingExtraCharges = await client.query(
        `SELECT * FROM "RentalExtraCharge"
         WHERE "rentalRequestId" = $1
         ORDER BY "createdAt" ASC, "id" ASC`,
        [rental.requestId],
      );
      const insertedRows = await client.query(
        `INSERT INTO "RentalExtraCharge" (
          "id", "rentalRequestId", "extraHours", "extraAmount", "note", "createdAt"
        ) VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING *`,
        [createId(), rental.requestId, extraHours, extraAmount, note || null],
      );
      const updatedExtraCharges = [
        ...existingExtraCharges.rows,
        insertedRows.rows[0],
      ];
      const updatedRentalRows = await client.query(
        `UPDATE "RentalRequest"
         SET "totalAmount" = $1, "updatedAt" = NOW()
         WHERE "id" = $2
         RETURNING *`,
        [getFinalRentalAmount(rental, updatedExtraCharges), rental.id],
      );
      const paymentRows = await client.query(
        `SELECT * FROM "RentalPayment"
         WHERE "rentalRequestId" = $1
         ORDER BY "createdAt" ASC, "id" ASC`,
        [rental.requestId],
      );

      const updatedRental = withRentalPaymentSummary(
        updatedRentalRows.rows[0],
        paymentRows.rows,
        updatedExtraCharges,
      );

      return {
        extraCharge: insertedRows.rows[0],
        rental: updatedRental,
      };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[RENTAL_EXTRA_CHARGES_POST]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to add extra charge." },
      { status: error.status || 500 },
    );
  }
}
