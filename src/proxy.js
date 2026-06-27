import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // 1. Pages under /admin (except /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const cookie = request.cookies.get("admin_auth");
    const payload = await verifyToken(cookie?.value);
    if (!payload || payload.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // 2. Admin APIs under /api/admin/... (except /api/admin/login)
  if (pathname.startsWith("/api/admin") && pathname !== "/api/admin/login") {
    const cookie = request.cookies.get("admin_auth");
    const payload = await verifyToken(cookie?.value);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }
  }

  // 3. Customers API protection: GET/PUT/DELETE are admin-only, POST (login sync) is public
  if (pathname.startsWith("/api/customers")) {
    if (method !== "POST") {
      const cookie = request.cookies.get("admin_auth");
      const payload = await verifyToken(cookie?.value);
      if (!payload || payload.role !== "admin") {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 },
        );
      }
    }
  }

  // 4. Services (Bookings) API protection: GET/PUT/DELETE are admin-only, POST (booking submission) is public
  if (pathname.startsWith("/api/services")) {
    if (method !== "POST") {
      const cookie = request.cookies.get("admin_auth");
      const payload = await verifyToken(cookie?.value);
      if (!payload || payload.role !== "admin") {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 },
        );
      }
    }
  }

  // 5. Sell Requests API protection: GET/PUT/DELETE are admin-only, POST (submission) is public
  if (pathname.startsWith("/api/sell-requests")) {
    if (method !== "POST") {
      const cookie = request.cookies.get("admin_auth");
      const payload = await verifyToken(cookie?.value);
      if (!payload || payload.role !== "admin") {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 },
        );
      }
    }
  }

  // 6. Products & Testimonials: POST/PUT/DELETE are admin-only, GET is public
  const publicGetApis = [
    "/api/rental-products",
    "/api/buy-products",
    "/api/testimonials",
  ];
  const isPublicGetApi = publicGetApis.some((apiPath) =>
    pathname.startsWith(apiPath),
  );
  if (isPublicGetApi) {
    if (method !== "GET") {
      const cookie = request.cookies.get("admin_auth");
      const payload = await verifyToken(cookie?.value);
      if (!payload || payload.role !== "admin") {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 },
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/customers/:path*",
    "/api/services/:path*",
    "/api/sell-requests/:path*",
    "/api/rental-products/:path*",
    "/api/buy-products/:path*",
    "/api/testimonials/:path*",
  ],
};
