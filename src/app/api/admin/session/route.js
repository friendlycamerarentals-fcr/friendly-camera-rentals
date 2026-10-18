import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_auth")?.value;
    const session = await verifyToken(token);

    if (
      session?.role !== "admin" ||
      typeof session.email !== "string" ||
      !session.email.trim()
    ) {
      return NextResponse.json(
        { success: false, message: "Authenticated admin email unavailable." },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { success: true, email: session.email },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[ADMIN_SESSION_GET]", error);
    return NextResponse.json(
      { success: false, message: "Unable to read admin session." },
      { status: 500 },
    );
  }
}
