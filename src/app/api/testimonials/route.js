import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where = {};
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      where.status = status;
    }

    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: testimonials,
    });
  } catch (error) {
    console.error("[TESTIMONIALS_GET]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch testimonials",
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

    // Validate required fields
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Name is required",
        },
        {
          status: 400,
        },
      );
    }

    if (!body.review && !body.text) {
      return NextResponse.json(
        {
          success: false,
          message: "Review text is required",
        },
        {
          status: 400,
        },
      );
    }

    const review = (body.review || body.text).trim();
    if (review.length < 10) {
      return NextResponse.json(
        {
          success: false,
          message: "Review must be at least 10 characters long",
        },
        {
          status: 400,
        },
      );
    }

    const rating = parseInt(body.rating) || 5;
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          success: false,
          message: "Rating must be between 1 and 5",
        },
        {
          status: 400,
        },
      );
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        name: body.name.trim(),
        designation: (body.designation || body.role || "").trim(),
        image: body.image || null,
        rating,
        review,
        featured: body.featured || false,
        status: "pending", // Always default to pending
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: testimonial,
        message:
          "Testimonial submitted successfully. It will appear after admin approval.",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("[TESTIMONIAL_CREATE]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create testimonial",
      },
      {
        status: 500,
      },
    );
  }
}
