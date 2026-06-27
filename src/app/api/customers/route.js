import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

    const existingCustomer = await prisma.customer.findUnique({
      where: {
        email: body.email,
      },
    });

    if (existingCustomer) {
      // Sync customer details and preserve existing profile data
      const updatedCustomer = await prisma.customer.update({
        where: {
          email: body.email,
        },
        data: {
          name: body.name || existingCustomer.name,
          profileImage: body.profileImage || existingCustomer.profileImage,
        },
      });

      return NextResponse.json({
        success: true,
        data: updatedCustomer,
      });
    }

    // Determine the next sequential Customer ID to avoid collisions
    const lastCustomer = await prisma.customer.findFirst({
      orderBy: {
        createdAt: "desc",
      },
    });

    let nextNumber = 100001;
    if (lastCustomer && lastCustomer.customerId) {
      const match = lastCustomer.customerId.match(/RCR-C(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    const customerId = `RCR-C${nextNumber}`;

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
