import type { Context } from "hono";
import type { ErrorCode } from "@map-gallery/shared";

type ErrorStatus = 400 | 401 | 404 | 409 | 422 | 500;

export function fail(
  context: Context,
  status: ErrorStatus,
  code: ErrorCode,
  message: string,
) {
  return context.json({ error: { code, message } }, status);
}

type JsonObjectResult =
  | { ok: true; payload: Record<string, unknown> }
  | { ok: false; response: Response };

/** Reads the request body as a JSON object, or produces the 400 response. */
export async function readJsonObject(
  context: Context,
): Promise<JsonObjectResult> {
  let body: unknown;

  try {
    body = await context.req.json();
  } catch {
    return {
      ok: false,
      response: fail(
        context,
        400,
        "INVALID_JSON",
        "Request body must be valid JSON.",
      ),
    };
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      ok: false,
      response: fail(
        context,
        400,
        "INVALID_BODY",
        "Request body must be a JSON object.",
      ),
    };
  }

  return { ok: true, payload: body as Record<string, unknown> };
}
