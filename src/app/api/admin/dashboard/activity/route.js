import { NextResponse } from "next/server";
import { query } from "@/db/query";
import { requireAdmin } from "@/lib/adminAuth";
import { buildRecentActivities } from "@/lib/adminActivity";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ACTIVITY_LIMIT = 10;

export async function GET() {
  try {
    await requireAdmin();

    const [rentals, testimonials, sellRequests, soldProducts] =
      await Promise.all([
        query(
          `SELECT "id", "requestId", "fullName", "productName", "createdAt"
           FROM "RentalRequest"
           ORDER BY "createdAt" DESC, "id" DESC
           LIMIT $1`,
          [ACTIVITY_LIMIT],
        ),
        query(
          `SELECT "id", "name", "status", "createdAt"
           FROM "Testimonial"
           WHERE LOWER(BTRIM("status")) = 'pending'
           ORDER BY "createdAt" DESC, "id" DESC
           LIMIT $1`,
          [ACTIVITY_LIMIT],
        ),
        query(
          `SELECT "id", "fullName", "brand", "model", "category", "createdAt"
           FROM "SellRequest"
           ORDER BY "createdAt" DESC, "id" DESC
           LIMIT $1`,
          [ACTIVITY_LIMIT],
        ),
        query(
          `SELECT "id", "productId", "productName", "occurredAt"
           FROM "BuyProductSoldEvent"
           ORDER BY "occurredAt" DESC, "id" DESC
           LIMIT $1`,
          [ACTIVITY_LIMIT],
        ),
      ]);

    return NextResponse.json({
      success: true,
      activities: buildRecentActivities({
        rentals,
        testimonials,
        sellRequests,
        soldProducts,
      }),
    });
  } catch (error) {
    if (error.status === 401) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    console.error("[ADMIN_DASHBOARD_ACTIVITY_GET]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch recent activity" },
      { status: 500 },
    );
  }
}
