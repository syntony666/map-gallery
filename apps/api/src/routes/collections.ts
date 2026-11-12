import { randomUUID } from "node:crypto";
import { and, asc, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db";
import { areas, collections, photoCollections, photos } from "../db/schema";
import { fail, readJsonObject } from "./errors";

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
    return fail(
      context,
      400,
      "AREA_ID_REQUIRED",
      "The areaId query parameter is required.",
    );
  }

  const area = db
    .select({ id: areas.id })
    .from(areas)
    .where(eq(areas.id, areaId))
    .get();

  if (!area) {
    return fail(context, 404, "AREA_NOT_FOUND", "Area not found.");
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
  const parsedBody = await readJsonObject(context);

  if (!parsedBody.ok) {
    return parsedBody.response;
  }

  const payload = parsedBody.payload;
  const areaId = payload.areaId;
  const name = payload.name;

  if (typeof areaId !== "string" || areaId.trim() === "") {
    return fail(
      context,
      400,
      "INVALID_BODY",
      "areaId must be a non-empty string.",
    );
  }

  if (typeof name !== "string" || name.trim() === "") {
    return fail(
      context,
      400,
      "INVALID_BODY",
      "name must be a non-empty string.",
    );
  }

  const area = db
    .select({ id: areas.id })
    .from(areas)
    .where(eq(areas.id, areaId))
    .get();

  if (!area) {
    return fail(context, 404, "AREA_NOT_FOUND", "Area not found.");
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
      return fail(
        context,
        409,
        "COLLECTION_NAME_CONFLICT",
        "A collection with this name already exists in the area.",
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
    return fail(context, 404, "COLLECTION_NOT_FOUND", "Collection not found.");
  }

  const parsedBody = await readJsonObject(context);

  if (!parsedBody.ok) {
    return parsedBody.response;
  }

  const payload = parsedBody.payload;
  const hasName = "name" in payload;
  const hasCoverPhotoId = "coverPhotoId" in payload;

  if (!hasName && !hasCoverPhotoId) {
    return fail(
      context,
      400,
      "INVALID_BODY",
      "At least one of name or coverPhotoId is required.",
    );
  }

  const name = payload.name;

  if (hasName && (typeof name !== "string" || name.trim() === "")) {
    return fail(
      context,
      400,
      "INVALID_BODY",
      "name must be a non-empty string.",
    );
  }

  const coverPhotoId = payload.coverPhotoId;
  let nextCoverPhotoId: string | null = null;

  if (hasCoverPhotoId) {
    if (coverPhotoId !== null && typeof coverPhotoId !== "string") {
      return fail(
        context,
        400,
        "INVALID_BODY",
        "coverPhotoId must be a string or null.",
      );
    }

    if (typeof coverPhotoId === "string") {
      const photo = db
        .select({ id: photos.id })
        .from(photos)
        .where(eq(photos.id, coverPhotoId))
        .get();

      if (!photo) {
        return fail(context, 404, "PHOTO_NOT_FOUND", "Photo not found.");
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
        return fail(
          context,
          422,
          "PHOTO_COLLECTION_NOT_FOUND",
          "Cover photo must belong to the collection.",
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
      return fail(
        context,
        409,
        "COLLECTION_NAME_CONFLICT",
        "A collection with this name already exists in the area.",
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
    return fail(context, 404, "COLLECTION_NOT_FOUND", "Collection not found.");
  }

  db.delete(collections).where(eq(collections.id, collectionId)).run();

  return context.body(null, 204);
});
