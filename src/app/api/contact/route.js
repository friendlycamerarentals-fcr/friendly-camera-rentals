import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.name || !body.phone || !body.message) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 },
      );
    }

    // Optionally add persistence or email integration here.
    console.log("Contact form submitted:", {
      name: body.name,
      phone: body.phone,
      message: body.message,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Message received",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[CONTACT_POST]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit contact request",
      },
      { status: 500 },
    );
  }
}
