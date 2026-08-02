import { NextResponse } from "next/server";
import { query } from "@/db/query";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const [
      totalRows,
      pendingRows,
      confirmedRows,
      completedRows,
      cancelledRows,
    ] = await Promise.all([
      query('SELECT COUNT(*)::int AS count FROM "ServiceBooking"'),
      query(
        'SELECT COUNT(*)::int AS count FROM "ServiceBooking" WHERE "status" = $1',
        ["pending"],
      ),
      query(
        'SELECT COUNT(*)::int AS count FROM "ServiceBooking" WHERE "status" = $1',
        ["confirmed"],
      ),
      query(
        'SELECT COUNT(*)::int AS count FROM "ServiceBooking" WHERE "status" = $1',
        ["completed"],
      ),
      query(
        'SELECT COUNT(*)::int AS count FROM "ServiceBooking" WHERE "status" = $1',
        ["cancelled"],
      ),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        total: Number(totalRows[0]?.count || 0),
        pending: Number(pendingRows[0]?.count || 0),
        confirmed: Number(confirmedRows[0]?.count || 0),
        completed: Number(completedRows[0]?.count || 0),
        cancelled: Number(cancelledRows[0]?.count || 0),
      },
    });
  } catch (error) {
    console.error("[SERVICE_BOOKINGS_STATS]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch statistics" },
      { status: 500 },
    );
  }
}
