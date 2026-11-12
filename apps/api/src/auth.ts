import type { Context, Next } from "hono";
import { fail } from "./routes/errors";

/** When ADMIN_TOKEN is unset the API is in open dev mode and writes pass through. */
export function isAdminAuthorized(context: Context): boolean {
  const token = process.env.ADMIN_TOKEN;

  if (!token) {
    return true;
  }

  return context.req.header("Authorization") === `Bearer ${token}`;
}

export async function requireAdmin(context: Context, next: Next) {
  if (isAdminAuthorized(context)) {
    return next();
  }

  return fail(context, 401, "UNAUTHORIZED", "Admin token required.");
}
