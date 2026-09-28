import { NextResponse } from "next/server";
import { ADMIN_SESSION_MILLISECONDS, signToken } from "@/lib/jwt";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminEmail2 = process.env.ADMIN_EMAIL_2;
    const adminPassword2 = process.env.ADMIN_PASSWORD_2;
    const isSecondAccountConfigured = Boolean(
      adminEmail2?.trim() || adminPassword2?.trim(),
    );

    if (
      !adminEmail?.trim() ||
      !adminPassword?.trim() ||
      (isSecondAccountConfigured &&
        (!adminEmail2?.trim() || !adminPassword2?.trim()))
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin credentials are not configured",
        },
        { status: 500 },
      );
    }

    const credentialsMatch =
      (email === adminEmail && password === adminPassword) ||
      (email === adminEmail2 && password === adminPassword2);

    if (!credentialsMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 },
      );
    }

    const token = await signToken({ role: "admin" });

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
    });

    response.cookies.set("admin_auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      // Next.js expects maxAge in seconds; convert the shared millisecond lifetime.
      maxAge: ADMIN_SESSION_MILLISECONDS / 1000,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 },
    );
  }
}
