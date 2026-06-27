import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const total = await prisma.serviceBooking.count();

    const pending = await prisma.serviceBooking.count({
      where: { status: "pending" },
    });

    const confirmed = await prisma.serviceBooking.count({
      where: { status: "confirmed" },
    });

    const completed = await prisma.serviceBooking.count({
      where: { status: "completed" },
    });

    const cancelled = await prisma.serviceBooking.count({
      where: { status: "cancelled" },
    });

    return NextResponse.json({
      success: true,
      data: {
        total,
        pending,
        confirmed,
        completed,
        cancelled,
      },
    });
  } catch (error) {
    console.error("[SERVICE_BOOKINGS_STATS]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch statistics",
      },
      {
        status: 500,
      },
    );
  }
}
