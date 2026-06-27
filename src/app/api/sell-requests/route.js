import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/*
|--------------------------------------------------------------------------
| GET ALL SELL REQUESTS
|--------------------------------------------------------------------------
*/
export async function GET() {
  try {
    const requests = await prisma.sellRequest.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("[SELL_REQUESTS_GET]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch sell requests",
      },
      {
        status: 500,
      },
    );
  }
}

/*
|--------------------------------------------------------------------------
| CREATE SELL REQUEST
|--------------------------------------------------------------------------
*/
export async function POST(request) {
  try {
    const body = await request.json();

    const sellRequest = await prisma.sellRequest.create({
      data: {
        fullName: body.fullName,
        mobile: body.mobile,
        email: body.email || "",

        city: body.city,

        category: body.category,

        brand: body.brand,
        model: body.model,

        purchaseYear: body.purchaseYear || "",

        warrantyStatus: body.warrantyStatus || "",

        expectedPrice: Number(body.expectedPrice || 0),

        condition: body.condition,

        accessories: body.accessories || "",

        description: body.description || "",

        images: body.images || [],

        status: "pending",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Sell request submitted successfully",
        data: sellRequest,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("[SELL_REQUEST_POST]", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to submit sell request",
      },
      {
        status: 500,
      },
    );
  }
}
