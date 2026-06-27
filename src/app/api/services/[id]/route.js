import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const booking = await prisma.serviceBooking.findUnique({
      where: {
        id,
      },
    });

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("[SERVICE_BOOKING_GET]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch booking",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;

    const body = await request.json();

    const updateData = {};
    if (body.status) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const booking = await prisma.serviceBooking.update({
      where: {
        id,
      },

      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("[SERVICE_BOOKING_UPDATE]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update booking",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    await prisma.serviceBooking.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("[SERVICE_BOOKING_DELETE]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete booking",
      },
      {
        status: 500,
      },
    );
  }
}
