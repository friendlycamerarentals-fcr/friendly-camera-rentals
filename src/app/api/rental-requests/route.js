import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function buildRequestId() {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
  return `FCR-RQ-${stamp}`;
}

export async function GET() {
  try {
    const requests = await prisma.rentalRequest.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: requests });
  } catch (error) {
    console.error("[RENTAL_REQUESTS_GET]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch rental requests" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (
      !body.productId ||
      !body.productName ||
      !body.phone ||
      !body.fullName ||
      !body.bookingDate ||
      !body.customerId ||
      !body.rentalDuration ||
      body.quantity == null ||
      body.rentalPrice == null ||
      body.totalAmount == null
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required booking fields" },
        { status: 400 },
      );
    }

    const quantity = Number(body.quantity);
    const rentalPrice = Number(body.rentalPrice);
    const totalAmount = Number(body.totalAmount);

    if (
      Number.isNaN(quantity) ||
      Number.isNaN(rentalPrice) ||
      Number.isNaN(totalAmount)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid numeric booking fields" },
        { status: 400 },
      );
    }

    const existing = await prisma.rentalRequest.findFirst({
      where: {
        productId: body.productId,
        phone: body.phone,
        bookingDate: body.bookingDate,
        pickupTime: body.pickupTime || null,
        rentalDuration: body.rentalDuration,
        status: { in: ["Pending", "Approved", "Completed"] },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "A similar booking request already exists" },
        { status: 409 },
      );
    }

    const requestId = buildRequestId();

    const rentalRequest = await prisma.rentalRequest.create({
      data: {
        requestId,
        customerId: body.customerId,
        userId: body.userId || null,
        fullName: body.fullName,
        email: body.email || null,
        phone: body.phone,
        address: body.address || null,
        productId: body.productId,
        productName: body.productName,
        productImage: body.productImage || null,
        rentalDuration: body.rentalDuration,
        quantity,
        rentalPrice,
        totalAmount,
        bookingDate: body.bookingDate,
        pickupTime: body.pickupTime || null,
        notes: body.notes || null,
        status: "Pending",
        paymentStatus: "Pending",
      },
    });

    return NextResponse.json(
      { success: true, data: rentalRequest },
      { status: 201 },
    );
  } catch (error) {
    console.error("[RENTAL_REQUESTS_POST]", error);
    return NextResponse.json(
      { success: false, message: "Failed to create rental request" },
      { status: 500 },
    );
  }
}
