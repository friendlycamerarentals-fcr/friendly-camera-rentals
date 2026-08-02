import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
  });

  response.cookies.set("admin_auth", "", {
    expires: new Date(0),
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return response;
}
