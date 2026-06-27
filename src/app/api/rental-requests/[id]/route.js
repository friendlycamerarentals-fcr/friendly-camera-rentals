import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
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

    const updated = await prisma.rentalRequest.update({
      where: { id },
      data: payload,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[RENTAL_REQUEST_PATCH]", error);
    return NextResponse.json(
      { success: false, message: "Failed to update rental request" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.rentalRequest.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[RENTAL_REQUEST_DELETE]", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete rental request" },
      { status: 500 },
    );
  }
}
