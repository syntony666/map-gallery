import { randomUUID } from "node:crypto";
import { and, asc, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db";
import { areas, collections, photoCollections, photos } from "../db/schema";

export const collectionsRoute = new Hono();

export const collectionListSelection = {
  id: collections.id,
  areaId: collections.areaId,
  name: collections.name,
  coverImage: sql<string | null>`
  COALESCE(
    (
      SELECT p.image
      FROM photo_collections AS pc
      INNER JOIN photos AS p
        ON p.id = pc.photo_id
      WHERE pc.collection_id = collections.id
        AND pc.photo_id = collections.cover_photo_id
      LIMIT 1
    ),
    (
      SELECT p.image
      FROM photo_collections AS pc
      INNER JOIN photos AS p
        ON p.id = pc.photo_id
      WHERE pc.collection_id = collections.id
      ORDER BY p.taken_at DESC, p.id ASC
      LIMIT 1
    )
  )
`,
  coverPhotoId: collections.coverPhotoId,
  photoCount: sql<number>`
  (
    SELECT COUNT(*)
    FROM ${photoCollections}
    WHERE ${photoCollections.collectionId} = ${collections.id}
  )
`,
  createdAt: collections.createdAt,
  updatedAt: collections.updatedAt,
};

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "SQLITE_CONSTRAINT_UNIQUE"
  );
}

collectionsRoute.get("/", (context) => {
  const areaId = context.req.query("areaId");

  if (!areaId) {
    return context.json(
      {
        error: {
          code: "AREA_ID_REQUIRED",
          message: "The areaId query parameter is required.",
        },
      },
      400,
    );
  }

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

  const items = db
    .select(collectionListSelection)
    .from(collections)
    .where(eq(collections.areaId, areaId))
    .orderBy(asc(collections.name))
    .all();

  return context.json({ items });
});

collectionsRoute.post("/", async (context) => {
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
  const areaId = payload.areaId;
  const name = payload.name;

  if (typeof areaId !== "string" || areaId.trim() === "") {
    return context.json(
      {
        error: {
          code: "INVALID_BODY",
          message: "areaId must be a non-empty string.",
        },
      },
      400,
    );
  }

  if (typeof name !== "string" || name.trim() === "") {
    return context.json(
      {
        error: {
          code: "INVALID_BODY",
          message: "name must be a non-empty string.",
        },
      },
      400,
    );
  }

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

  const id = randomUUID();
  const now = new Date().toISOString();

  try {
    db.insert(collections)
      .values({
        id,
        areaId,
        name: name.trim(),
        createdAt: now,
        updatedAt: now,
      })
      .run();
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return context.json(
        {
          error: {
            code: "COLLECTION_NAME_CONFLICT",
            message: "A collection with this name already exists in the area.",
          },
        },
        409,
      );
    }

    throw error;
  }

  const item = db
    .select(collectionListSelection)
    .from(collections)
    .where(eq(collections.id, id))
    .get();

  return context.json(item, 201);
});

collectionsRoute.patch("/:collectionId", async (context) => {
  const collectionId = context.req.param("collectionId");

  const collection = db
    .select({ id: collections.id })
    .from(collections)
    .where(eq(collections.id, collectionId))
    .get();

  if (!collection) {
    return context.json(
      {
        error: {
          code: "COLLECTION_NOT_FOUND",
          message: "Collection not found.",
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
  const hasName = "name" in payload;
  const hasCoverPhotoId = "coverPhotoId" in payload;

  if (!hasName && !hasCoverPhotoId) {
    return context.json(
      {
        error: {
          code: "INVALID_BODY",
          message: "At least one of name or coverPhotoId is required.",
        },
      },
      400,
    );
  }

  const name = payload.name;

  if (hasName && (typeof name !== "string" || name.trim() === "")) {
    return context.json(
      {
        error: {
          code: "INVALID_BODY",
          message: "name must be a non-empty string.",
        },
      },
      400,
    );
  }

  const coverPhotoId = payload.coverPhotoId;
  let nextCoverPhotoId: string | null = null;

  if (hasCoverPhotoId) {
    if (coverPhotoId !== null && typeof coverPhotoId !== "string") {
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
        .select({ id: photos.id })
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

      const membership = db
        .select({ photoId: photoCollections.photoId })
        .from(photoCollections)
        .where(
          and(
            eq(photoCollections.collectionId, collectionId),
            eq(photoCollections.photoId, coverPhotoId),
          ),
        )
        .get();

      if (!membership) {
        return context.json(
          {
            error: {
              code: "PHOTO_COLLECTION_NOT_FOUND",
              message: "Cover photo must belong to the collection.",
            },
          },
          422,
        );
      }

      nextCoverPhotoId = coverPhotoId;
    }
  }

  try {
    db.update(collections)
      .set({
        ...(hasName ? { name: (name as string).trim() } : {}),
        ...(hasCoverPhotoId ? { coverPhotoId: nextCoverPhotoId } : {}),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(collections.id, collectionId))
      .run();
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return context.json(
        {
          error: {
            code: "COLLECTION_NAME_CONFLICT",
            message: "A collection with this name already exists in the area.",
          },
        },
        409,
      );
    }

    throw error;
  }

  const item = db
    .select(collectionListSelection)
    .from(collections)
    .where(eq(collections.id, collectionId))
    .get();

  return context.json(item);
});

collectionsRoute.delete("/:collectionId", (context) => {
  const collectionId = context.req.param("collectionId");

  const collection = db
    .select({ id: collections.id })
    .from(collections)
    .where(eq(collections.id, collectionId))
    .get();

  if (!collection) {
    return context.json(
      {
        error: {
          code: "COLLECTION_NOT_FOUND",
          message: "Collection not found.",
        },
      },
      404,
    );
  }

  db.delete(collections).where(eq(collections.id, collectionId)).run();

  return context.body(null, 204);
});
