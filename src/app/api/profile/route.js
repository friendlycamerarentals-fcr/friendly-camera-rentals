import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  try {
    const email = request.headers.get("x-user-email");
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Missing user email" },
        { status: 400 },
      );
    }

    const customer = await prisma.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    console.error("[PROFILE_GET]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const email = request.headers.get("x-user-email");
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Missing user email" },
        { status: 400 },
      );
    }

    const body = await request.json();
    if (!body.fullName || !body.phoneNumber || !body.address) {
      return NextResponse.json(
        { success: false, message: "Missing required profile fields" },
        { status: 400 },
      );
    }

    // Ensure new customers get sequential RCR-C IDs matching customers route
    const lastCustomer = await prisma.customer.findFirst({
      orderBy: { createdAt: "desc" },
    });

    let nextNumber = 100001;
    if (lastCustomer && lastCustomer.customerId) {
      const match = lastCustomer.customerId.match(/RCR-C(\d+)/);
      if (match) nextNumber = parseInt(match[1], 10) + 1;
    }

    const customerId = `RCR-C${nextNumber}`;

    const customer = await prisma.customer.upsert({
      where: { email },
      create: {
        name: body.fullName,
        email,
        phoneNumber: body.phoneNumber,
        address: body.address,
        profileImage: body.profileImage || "",
        customerId,
      },
      update: {
        name: body.fullName,
        phoneNumber: body.phoneNumber,
        address: body.address,
      },
    });

    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    console.error("[PROFILE_PUT]", error);
    return NextResponse.json(
      { success: false, message: "Failed to update profile" },
      { status: 500 },
    );
  }
}
