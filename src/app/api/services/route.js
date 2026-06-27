import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const bookings = await prisma.serviceBooking.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("[SERVICE_BOOKINGS_GET]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch bookings",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const booking = await prisma.serviceBooking.create({
      data: {
        fullName: body.fullName || body.name,
        phone: body.phone || body.phoneNumber,

        shootType: body.shootType || body.service,

        eventDate: body.eventDate || body.date,
        eventTime: body.eventTime || null,

        location: body.location || body.eventLocation,
        description: body.description || body.message || "",

        message: body.message || "",

        status: "pending",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: booking,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("[SERVICE_BOOKINGS_POST]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create booking",
      },
      {
        status: 500,
      },
    );
  }
}
