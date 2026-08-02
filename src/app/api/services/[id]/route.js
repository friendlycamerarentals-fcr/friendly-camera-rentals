import { NextResponse } from "next/server";
import { query } from "@/db/query";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const rows = await query(
      'SELECT * FROM "ServiceBooking" WHERE "id" = $1 LIMIT 1',
      [id],
    );
    const booking = rows[0];

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    console.error("[SERVICE_BOOKING_GET]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch booking" },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateParts = [];
    const values = [];

    if (body.status) {
      updateParts.push('"status" = $' + (values.length + 1));
      values.push(body.status);
    }

    if (body.notes !== undefined) {
      updateParts.push('"notes" = $' + (values.length + 1));
      values.push(body.notes);
    }

    if (!updateParts.length) {
      return NextResponse.json({ success: true, data: null });
    }

    values.push(id);
    const rows = await query(
      `UPDATE "ServiceBooking"
       SET ${updateParts.join(", ")}
       WHERE "id" = $${values.length}
       RETURNING *`,
      values,
    );

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("[SERVICE_BOOKING_UPDATE]", error);
    return NextResponse.json(
      { success: false, message: "Failed to update booking" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await query('DELETE FROM "ServiceBooking" WHERE "id" = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SERVICE_BOOKING_DELETE]", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete booking" },
      { status: 500 },
    );
  }
}
