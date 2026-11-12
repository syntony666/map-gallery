import { asc, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db";
import { areaContents, areas, photos } from "../db/schema";

export const areasRoute = new Hono();

export const areaListSelection = {
  id: areas.id,
  name: areas.name,
  coverImage: sql<string | null>`
  COALESCE(
    (
      SELECT p.image
      FROM photos AS p
      WHERE p.id = area_contents.cover_photo_id
        AND p.area_id = areas.id
      LIMIT 1
    ),
    (
      SELECT p.image
      FROM photos AS p
      WHERE p.area_id = areas.id
      ORDER BY p.taken_at DESC, p.id ASC
      LIMIT 1
    )
  )
`,
  coverPhotoId: areaContents.coverPhotoId,
  description: areaContents.description,
  photoCount: sql<number>`
  (
    SELECT COUNT(*)
    FROM photos
    WHERE photos.area_id = areas.id
  )
`,
};

areasRoute.get("/", (context) => {
  const items = db
    .select(areaListSelection)
    .from(areas)
    .leftJoin(areaContents, eq(areaContents.areaId, areas.id))
    .orderBy(asc(areas.id))
    .all();

  return context.json({ items });
});

areasRoute.get("/:areaId", (context) => {
  const areaId = context.req.param("areaId");

  const item = db
    .select(areaListSelection)
    .from(areas)
    .leftJoin(areaContents, eq(areaContents.areaId, areas.id))
    .where(eq(areas.id, areaId))
    .get();

  if (!item) {
    return context.json(
      {
        error: {
          code: "AREA_NOT_FOUND",
          message: "Area not found.",
        },
      },
      404,
    );
  }

  return context.json(item);
});

areasRoute.patch("/:areaId/content", async (context) => {
  const areaId = context.req.param("areaId");

  const area = db
    .select({ id: areas.id })
    .from(areas)
    .where(eq(areas.id, areaId))
    .get();

  if (!area) {
    return context.json(
      {
        error: {
          code: "AREA_NOT_FOUND",
          message: "Area not found.",
        },
      },
      404,
    );
  }

  let body: unknown;

  try {
    body = await context.req.json();
  } catch {
    return context.json(
      {
        error: {
          code: "INVALID_JSON",
          message: "Request body must be valid JSON.",
        },
      },
      400,
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return context.json(
      {
        error: {
          code: "INVALID_BODY",
          message: "Request body must be a JSON object.",
        },
      },
      400,
    );
  }

  const payload = body as Record<string, unknown>;
  const hasCoverPhotoId = Object.hasOwn(payload, "coverPhotoId");
  const hasDescription = Object.hasOwn(payload, "description");

  if (!hasCoverPhotoId && !hasDescription) {
    return context.json(
      {
        error: {
          code: "INVALID_BODY",
          message: "Provide at least one of coverPhotoId or description.",
        },
      },
      400,
    );
  }

  const coverPhotoId = payload.coverPhotoId;
  const description = payload.description;

  if (
    hasCoverPhotoId &&
    coverPhotoId !== null &&
    typeof coverPhotoId !== "string"
  ) {
    return context.json(
      {
        error: {
          code: "INVALID_BODY",
          message: "coverPhotoId must be a string or null.",
        },
      },
      400,
    );
  }

  if (typeof coverPhotoId === "string") {
    const photo = db
      .select({ id: photos.id, areaId: photos.areaId })
      .from(photos)
      .where(eq(photos.id, coverPhotoId))
      .get();

    if (!photo) {
      return context.json(
        {
          error: {
            code: "PHOTO_NOT_FOUND",
            message: "Photo not found.",
          },
        },
        404,
      );
    }

    if (photo.areaId !== areaId) {
      return context.json(
        {
          error: {
            code: "PHOTO_AREA_MISMATCH",
            message: "Cover photo must belong to the area.",
          },
        },
        422,
      );
    }
  }

  if (
    hasDescription &&
    description !== null &&
    typeof description !== "string"
  ) {
    return context.json(
      {
        error: {
          code: "INVALID_BODY",
          message: "description must be a string or null.",
        },
      },
      400,
    );
  }

  const now = new Date().toISOString();

  db.insert(areaContents)
    .values({
      areaId,
      coverPhotoId: hasCoverPhotoId ? (coverPhotoId as string | null) : null,
      description:
        hasDescription && typeof description === "string" ? description : null,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: areaContents.areaId,
      set: {
        ...(hasCoverPhotoId
          ? { coverPhotoId: coverPhotoId as string | null }
          : {}),
        ...(hasDescription
          ? {
              description:
                description === null ? null : (description as string),
            }
          : {}),
        updatedAt: sql`excluded.updated_at`,
      },
    })
    .run();

  const item = db
    .select(areaListSelection)
    .from(areas)
    .leftJoin(areaContents, eq(areaContents.areaId, areas.id))
    .where(eq(areas.id, areaId))
    .get();

  return context.json(item);
});
