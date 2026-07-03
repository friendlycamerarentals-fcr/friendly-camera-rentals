import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getNextCustomerId } from "@/lib/customerId";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: customers,
    });
  } catch (error) {
    console.error("[CUSTOMERS_GET]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch customers",
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

    if (!body?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required",
        },
        {
          status: 400,
        },
      );
    }

    const existingCustomer = await prisma.customer.findUnique({
      where: {
        email: body.email,
      },
    });

    if (existingCustomer) {
      const updatedCustomer = await prisma.customer.update({
        where: {
          email: body.email,
        },
        data: {
          name: body.name || existingCustomer.name,
          profileImage: body.profileImage || existingCustomer.profileImage,
          phoneNumber: body.phoneNumber || existingCustomer.phoneNumber || "",
          address: body.address || existingCustomer.address || "",
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: updatedCustomer,
        },
        {
          status: 200,
        },
      );
    }

    const customerId = await getNextCustomerId(prisma);

    const customer = await prisma.customer.create({
      data: {
        customerId,
        name: body.name || "Customer",
        email: body.email,
        profileImage: body.profileImage || "",
        phoneNumber: body.phoneNumber || "",
        address: body.address || "",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: customer,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("[CUSTOMER_CREATE]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create customer",
      },
      {
        status: 500,
      },
    );
  }
}
