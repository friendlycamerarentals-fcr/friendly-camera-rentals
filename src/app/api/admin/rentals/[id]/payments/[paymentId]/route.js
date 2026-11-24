import { NextResponse } from "next/server";
import { transaction } from "@/db/query";
import { requireAdmin } from "@/lib/adminAuth";
import { createRentalPaymentDeleteHandler } from "@/lib/rentalPaymentDelete";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const handleDelete = createRentalPaymentDeleteHandler({
  requireAdmin,
  transaction,
});

export async function DELETE(request, context) {
  const result = await handleDelete(request, context);
  if (result.status >= 500) {
    console.error("[RENTAL_PAYMENT_DELETE]", result.body.message);
  }
  return NextResponse.json(result.body, { status: result.status });
}
