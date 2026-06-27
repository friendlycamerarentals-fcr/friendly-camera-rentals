import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/*
|--------------------------------------------------------------------------
| GET SINGLE REQUEST
|--------------------------------------------------------------------------
*/
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const sellRequest = await prisma.sellRequest.findUnique({
      where: {
        id,
      },
    });

    if (!sellRequest) {
      return NextResponse.json(
        {
          success: false,
          message: "Request not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      data: sellRequest,
    });
  } catch (error) {
    console.error("[SELL_REQUEST_GET]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch request",
      },
      {
        status: 500,
      },
    );
  }
}

/*
|--------------------------------------------------------------------------
| UPDATE REQUEST
|--------------------------------------------------------------------------
*/
export async function PUT(request, { params }) {
  try {
    const { id } = await params;

    const body = await request.json();

    const existingRequest = await prisma.sellRequest.findUnique({
      where: {
        id,
      },
    });

    if (!existingRequest) {
      return NextResponse.json(
        {
          success: false,
          message: "Request not found",
        },
        {
          status: 404,
        },
      );
    }

    const updatedRequest = await prisma.sellRequest.update({
      where: {
        id,
      },
      data: {
        status: body.status || existingRequest.status,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Request updated successfully",
      data: updatedRequest,
    });
  } catch (error) {
    console.error("[SELL_REQUEST_UPDATE]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update request",
      },
      {
        status: 500,
      },
    );
  }
}

/*
|--------------------------------------------------------------------------
| DELETE REQUEST
|--------------------------------------------------------------------------
*/
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const existingRequest = await prisma.sellRequest.findUnique({
      where: {
        id,
      },
    });

    if (!existingRequest) {
      return NextResponse.json(
        {
          success: false,
          message: "Request not found",
        },
        {
          status: 404,
        },
      );
    }

    await prisma.sellRequest.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Request deleted successfully",
    });
  } catch (error) {
    console.error("[SELL_REQUEST_DELETE]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete request",
      },
      {
        status: 500,
      },
    );
  }
}
