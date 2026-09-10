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

  // 4. Sell Requests API protection: GET/PUT/DELETE are admin-only, POST (submission) is public
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

  // 5. Rental Requests API protection: GET/PUT/DELETE are admin-only
  //    (admin rental management), POST (customer booking submission) is public.
  if (pathname.startsWith("/api/rental-requests")) {
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

  // 6. Catalog APIs: GET is public, POST/PUT/DELETE are admin-only.
  //    Exception: POST /api/rental-products/availability is a read-only
  //    availability check used by the customer cart ("Book Rent via WhatsApp")
  //    and must stay public — it never writes or exposes admin data.
  const isCatalogPath = [
    "/api/rental-products",
    "/api/buy-products",
    "/api/testimonials",
  ].some((apiPath) => pathname.startsWith(apiPath));
  const isPublicAvailabilityCheck =
    pathname === "/api/rental-products/availability" && method === "POST";

  if (isCatalogPath && method !== "GET" && !isPublicAvailabilityCheck) {
    const cookie = request.cookies.get("admin_auth");
    const payload = await verifyToken(cookie?.value);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/customers/:path*",
    "/api/sell-requests/:path*",
    "/api/rental-products/:path*",
    "/api/buy-products/:path*",
    "/api/testimonials/:path*",
    "/api/rental-requests/:path*",
  ],
};
