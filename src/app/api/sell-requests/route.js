import { NextResponse } from "next/server";
import { createId } from "@/lib/createId";
import { query } from "@/db/query";
import { createAdminNotification } from "@/lib/adminNotificationService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const requests = await query(
      'SELECT * FROM "SellRequest" ORDER BY "createdAt" DESC',
    );
    return NextResponse.json({ success: true, data: requests });
  } catch (error) {
    console.error("[SELL_REQUESTS_GET]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch sell requests" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const id = createId();
    const rows = await query(
      `INSERT INTO "SellRequest" (
        "id", "fullName", "mobile", "email", "city", "category",
        "brand", "model", "purchaseYear", "warrantyStatus",
        "expectedPrice", "condition", "accessories", "description",
        "images", "status"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        id,
        body.fullName,
        body.mobile,
        body.email || "",
        body.city,
        body.category,
        body.brand,
        body.model,
        body.purchaseYear || "",
        body.warrantyStatus || "",
        Number(body.expectedPrice || 0),
        body.condition,
        body.accessories || "",
        body.description || "",
        body.images || [],
        "pending",
      ],
    );

    const sellRequest = rows[0];

    // Create admin notification for new sell request
    await createAdminNotification({
      type: "sell_request",
      title: "New Sell Request",
      message: `${body.fullName} submitted a sell request for ${body.brand} ${body.model}`,
      relatedId: sellRequest.id,
      relatedType: "SellRequest",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Sell request submitted successfully",
        data: sellRequest,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[SELL_REQUEST_POST]", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to submit sell request",
      },
      { status: 500 },
    );
  }
}
