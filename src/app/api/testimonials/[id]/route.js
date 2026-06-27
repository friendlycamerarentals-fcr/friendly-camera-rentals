import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const testimonial = await prisma.testimonial.findUnique({
      where: {
        id,
      },
    });

    if (!testimonial) {
      return NextResponse.json(
        {
          success: false,
          message: "Testimonial not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      data: testimonial,
    });
  } catch (error) {
    console.error("[TESTIMONIAL_GET]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch testimonial",
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

    // Validate status if provided
    if (
      body.status &&
      !["pending", "approved", "rejected"].includes(body.status)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid status. Must be 'pending', 'approved', or 'rejected'",
        },
        {
          status: 400,
        },
      );
    }

    // Find testimonial first
    const existingTestimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!existingTestimonial) {
      return NextResponse.json(
        {
          success: false,
          message: "Testimonial not found",
        },
        {
          status: 404,
        },
      );
    }

    const updateData = {};
    if (body.status) updateData.status = body.status;
    if (typeof body.featured === "boolean") updateData.featured = body.featured;

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: testimonial,
    });
  } catch (error) {
    console.error("[TESTIMONIAL_UPDATE]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update testimonial",
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

    // Check if testimonial exists before deleting
    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!testimonial) {
      return NextResponse.json(
        {
          success: false,
          message: "Testimonial not found",
        },
        {
          status: 404,
        },
      );
    }

    await prisma.testimonial.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Testimonial deleted successfully",
    });
  } catch (error) {
    console.error("[TESTIMONIAL_DELETE]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete testimonial",
      },
      {
        status: 500,
      },
    );
  }
}
