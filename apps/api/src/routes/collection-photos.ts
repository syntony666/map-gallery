import { and, eq, inArray } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db";
import { collections, photoCollections, photos } from "../db/schema";
import { collectionListSelection } from "./collections";
import { fail, readJsonObject } from "./errors";

export const collectionPhotosRoute = new Hono();

type CollectionPhotosPayload = {
  collectionId: string;
  photoIds: string[];
};

type ParsedBody =
  | { ok: true; payload: CollectionPhotosPayload }
  | { ok: false; message: string };

function parseCollectionPhotosPayload(body: unknown): ParsedBody {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, message: "Request body must be a JSON object." };
  }

  const payload = body as Record<string, unknown>;
  const collectionId = payload.collectionId;
  const photoIds = payload.photoIds;

  if (typeof collectionId !== "string" || collectionId.trim() === "") {
    return { ok: false, message: "collectionId must be a non-empty string." };
  }

  if (
    !Array.isArray(photoIds) ||
    photoIds.length === 0 ||
    photoIds.some((id) => typeof id !== "string" || id.trim() === "")
  ) {
    return {
      ok: false,
      message: "photoIds must be a non-empty array of strings.",
    };
  }

  return {
    ok: true,
    payload: { collectionId, photoIds: [...new Set(photoIds)] },
  };
}

collectionPhotosRoute.post("/", async (context) => {
  const parsedBody = await readJsonObject(context);

  if (!parsedBody.ok) {
    return parsedBody.response;
  }

  const parsed = parseCollectionPhotosPayload(parsedBody.payload);

  if (!parsed.ok) {
    return fail(context, 400, "INVALID_BODY", parsed.message);
  }

  const { collectionId, photoIds } = parsed.payload;

  const collection = db
    .select({ id: collections.id, areaId: collections.areaId })
    .from(collections)
    .where(eq(collections.id, collectionId))
    .get();

  if (!collection) {
    return fail(context, 404, "COLLECTION_NOT_FOUND", "Collection not found.");
  }

  const foundPhotos = db
    .select({ id: photos.id, areaId: photos.areaId })
    .from(photos)
    .where(inArray(photos.id, photoIds))
    .all();

  if (foundPhotos.length !== photoIds.length) {
    return fail(
      context,
      404,
      "PHOTO_NOT_FOUND",
      "One or more photos were not found.",
    );
  }

  if (foundPhotos.some((photo) => photo.areaId !== collection.areaId)) {
    return fail(
      context,
      422,
      "PHOTO_AREA_MISMATCH",
      "Photos must belong to the same area as the collection.",
    );
  }

  const createdAt = new Date().toISOString();

  db.insert(photoCollections)
    .values(photoIds.map((photoId) => ({ photoId, collectionId, createdAt })))
    .onConflictDoNothing()
    .run();

  const item = db
    .select(collectionListSelection)
    .from(collections)
    .where(eq(collections.id, collectionId))
    .get();

  return context.json(item);
});

collectionPhotosRoute.delete("/:collectionId/:photoId", (context) => {
  const collectionId = context.req.param("collectionId");
  const photoId = context.req.param("photoId");

  const collection = db
    .select({ id: collections.id })
    .from(collections)
    .where(eq(collections.id, collectionId))
    .get();

  if (!collection) {
    return fail(context, 404, "COLLECTION_NOT_FOUND", "Collection not found.");
  }

  const relationFilter = and(
    eq(photoCollections.collectionId, collectionId),
    eq(photoCollections.photoId, photoId),
  );

  const relation = db
    .select({ photoId: photoCollections.photoId })
    .from(photoCollections)
    .where(relationFilter)
    .get();

  if (!relation) {
    return fail(
      context,
      404,
      "PHOTO_COLLECTION_NOT_FOUND",
      "Photo is not in the collection.",
    );
  }

  db.delete(photoCollections).where(relationFilter).run();

  return context.body(null, 204);
});

collectionPhotosRoute.post("/batch-delete", async (context) => {
  const parsedBody = await readJsonObject(context);

  if (!parsedBody.ok) {
    return parsedBody.response;
  }

  const parsed = parseCollectionPhotosPayload(parsedBody.payload);

  if (!parsed.ok) {
    return fail(context, 400, "INVALID_BODY", parsed.message);
  }

  const { collectionId, photoIds } = parsed.payload;

  const collection = db
    .select({ id: collections.id })
    .from(collections)
    .where(eq(collections.id, collectionId))
    .get();

  if (!collection) {
    return fail(context, 404, "COLLECTION_NOT_FOUND", "Collection not found.");
  }

  const relationFilter = and(
    eq(photoCollections.collectionId, collectionId),
    inArray(photoCollections.photoId, photoIds),
  );

  const existing = db
    .select({ photoId: photoCollections.photoId })
    .from(photoCollections)
    .where(relationFilter)
    .all();

  if (existing.length !== photoIds.length) {
    return fail(
      context,
      404,
      "PHOTO_COLLECTION_NOT_FOUND",
      "One or more photos are not in the collection.",
    );
  }

  db.delete(photoCollections).where(relationFilter).run();

  const item = db
    .select(collectionListSelection)
    .from(collections)
    .where(eq(collections.id, collectionId))
    .get();

  return context.json(item);
});
