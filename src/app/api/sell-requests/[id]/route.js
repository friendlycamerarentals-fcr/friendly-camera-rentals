import { NextResponse } from "next/server";
import { query } from "@/db/query";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const rows = await query(
      'SELECT * FROM "SellRequest" WHERE "id" = $1 LIMIT 1',
      [id],
    );
    const sellRequest = rows[0];

    if (!sellRequest) {
      return NextResponse.json(
        { success: false, message: "Request not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: sellRequest });
  } catch (error) {
    console.error("[SELL_REQUEST_GET]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch request" },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const rows = await query(
      `UPDATE "SellRequest" SET "status" = $1 WHERE "id" = $2 RETURNING *`,
      [body.status || "pending", id],
    );

    return NextResponse.json({
      success: true,
      message: "Request updated successfully",
      data: rows[0],
    });
  } catch (error) {
    console.error("[SELL_REQUEST_UPDATE]", error);
    return NextResponse.json(
      { success: false, message: "Failed to update request" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await query('DELETE FROM "SellRequest" WHERE "id" = $1', [id]);
    return NextResponse.json({
      success: true,
      message: "Request deleted successfully",
    });
  } catch (error) {
    console.error("[SELL_REQUEST_DELETE]", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete request" },
      { status: 500 },
    );
  }
}
