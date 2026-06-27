import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const customer = await prisma.customer.findUnique({
      where: {
        id,
      },
    });

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("[CUSTOMER_GET]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch customer",
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

    const customer = await prisma.customer.update({
      where: {
        id,
      },

      data: {
        phoneNumber: body.phoneNumber,

        address: body.address,

        name: body.name,
      },
    });

    return NextResponse.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("[CUSTOMER_UPDATE]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update customer",
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

    await prisma.customer.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("[CUSTOMER_DELETE]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete customer",
      },
      {
        status: 500,
      },
    );
  }
}
