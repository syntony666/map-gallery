import { randomUUID } from "node:crypto";
import { Hono } from "hono";
import { areaExists } from "../data/areas";
import {
  collectionHasPhoto,
  createCollection,
  deleteCollection,
  getCollectionArea,
  getCollectionById,
  listCollectionsByArea,
  updateCollection,
} from "../data/collections";
import { getPhoto } from "../data/photos";
import { fail, readJsonObject } from "./errors";
import { isNonEmptyString, isNullableString } from "./validators";

export const collectionsRoute = new Hono();

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

  if (!areaExists(areaId)) {
    return fail(context, 404, "AREA_NOT_FOUND", "Area not found.");
  }

  return context.json({ items: listCollectionsByArea(areaId) });
});

collectionsRoute.post("/", async (context) => {
  const parsedBody = await readJsonObject(context);

  if (!parsedBody.ok) {
    return parsedBody.response;
  }

  const payload = parsedBody.payload;
  const areaId = payload.areaId;
  const name = payload.name;

  if (!isNonEmptyString(areaId)) {
    return fail(
      context,
      400,
      "INVALID_BODY",
      "areaId must be a non-empty string.",
    );
  }

  if (!isNonEmptyString(name)) {
    return fail(
      context,
      400,
      "INVALID_BODY",
      "name must be a non-empty string.",
    );
  }

  if (!areaExists(areaId)) {
    return fail(context, 404, "AREA_NOT_FOUND", "Area not found.");
  }

  const id = randomUUID();
  const now = new Date().toISOString();

  try {
    createCollection({
      id,
      areaId,
      name: name.trim(),
      createdAt: now,
      updatedAt: now,
    });
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

  return context.json(getCollectionById(id), 201);
});

collectionsRoute.patch("/:collectionId", async (context) => {
  const collectionId = context.req.param("collectionId");

  if (!getCollectionArea(collectionId)) {
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

  if (hasName && !isNonEmptyString(name)) {
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
    if (!isNullableString(coverPhotoId)) {
      return fail(
        context,
        400,
        "INVALID_BODY",
        "coverPhotoId must be a string or null.",
      );
    }

    if (typeof coverPhotoId === "string") {
      const photo = getPhoto(coverPhotoId);

      if (!photo) {
        return fail(context, 404, "PHOTO_NOT_FOUND", "Photo not found.");
      }

      if (!collectionHasPhoto(collectionId, coverPhotoId)) {
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
    updateCollection(collectionId, {
      ...(hasName ? { name: (name as string).trim() } : {}),
      ...(hasCoverPhotoId ? { coverPhotoId: nextCoverPhotoId } : {}),
    });
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

  return context.json(getCollectionById(collectionId));
});

collectionsRoute.delete("/:collectionId", (context) => {
  const collectionId = context.req.param("collectionId");

  if (!getCollectionArea(collectionId)) {
    return fail(context, 404, "COLLECTION_NOT_FOUND", "Collection not found.");
  }

  deleteCollection(collectionId);

  return context.body(null, 204);
});
