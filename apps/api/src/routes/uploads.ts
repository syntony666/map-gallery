import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { Hono } from "hono";
import { fail } from "./errors";

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

const uploadsDir = path.resolve(import.meta.dirname, "../../data/uploads");

export const uploadsRoute = new Hono();

uploadsRoute.post("/", async (context) => {
  const contentLength = Number(context.req.header("content-length") ?? 0);

  if (contentLength > MAX_UPLOAD_BYTES) {
    return fail(
      context,
      400,
      "UPLOAD_TOO_LARGE",
      "Upload must be 25 MB or smaller.",
    );
  }

  const body = await context.req.parseBody();
  const file = body["file"];

  if (!(file instanceof File)) {
    return fail(
      context,
      400,
      "INVALID_BODY",
      "The file field must be an image file.",
    );
  }

  const extension = EXTENSION_BY_MIME[file.type];

  if (!extension) {
    return fail(
      context,
      400,
      "INVALID_BODY",
      "Only JPEG, PNG, WebP, GIF, or AVIF images are accepted.",
    );
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return fail(
      context,
      400,
      "UPLOAD_TOO_LARGE",
      "Upload must be 25 MB or smaller.",
    );
  }

  const name = `${randomUUID()}${extension}`;

  await mkdir(uploadsDir, { recursive: true });
  await writeFile(
    path.join(uploadsDir, name),
    Buffer.from(await file.arrayBuffer()),
  );

  return context.json({ image: `/uploads/${name}` }, 201);
});

/** Removes the file behind an /uploads/ path; other URLs are left alone. */
export async function removeUploadedImage(image: string): Promise<void> {
  if (!image.startsWith("/uploads/")) {
    return;
  }

  try {
    await unlink(path.join(uploadsDir, path.basename(image)));
  } catch {
    // Already gone — file cleanup stays best-effort.
  }
}
