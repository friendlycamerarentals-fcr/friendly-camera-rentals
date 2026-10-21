import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

/**
 * Verify the admin session cookie for admin-only API routes.
 *
 * Returns { email } for a valid admin session, or throws an error with
 * `status` 401 that route handlers can convert into a JSON response.
 */
export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_auth")?.value;
  const session = await verifyToken(token);

  if (
    session?.role !== "admin" ||
    typeof session.email !== "string" ||
    !session.email.trim()
  ) {
    const error = new Error("Admin authentication required.");
    error.status = 401;
    throw error;
  }

  return { email: session.email.trim() };
}
