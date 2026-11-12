import { Hono } from "hono";
import {
  addPhotosToCollection,
  collectionHasPhoto,
  findCollectionPhotoIds,
  getCollectionArea,
  getCollectionById,
  removePhotoFromCollection,
  removePhotosFromCollection,
} from "../data/collections";
import { getPhotosByIds } from "../data/photos";
import { fail, readJsonObject } from "./errors";
import { isNonEmptyString } from "./validators";

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

  if (!isNonEmptyString(collectionId)) {
    return { ok: false, message: "collectionId must be a non-empty string." };
  }

  if (
    !Array.isArray(photoIds) ||
    photoIds.length === 0 ||
    photoIds.some((id) => !isNonEmptyString(id))
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

  const collection = getCollectionArea(collectionId);

  if (!collection) {
    return fail(context, 404, "COLLECTION_NOT_FOUND", "Collection not found.");
  }

  const foundPhotos = getPhotosByIds(photoIds);

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

  addPhotosToCollection(collectionId, photoIds);

  return context.json(getCollectionById(collectionId));
});

collectionPhotosRoute.delete("/:collectionId/:photoId", (context) => {
  const collectionId = context.req.param("collectionId");
  const photoId = context.req.param("photoId");

  if (!getCollectionArea(collectionId)) {
    return fail(context, 404, "COLLECTION_NOT_FOUND", "Collection not found.");
  }

  if (!collectionHasPhoto(collectionId, photoId)) {
    return fail(
      context,
      404,
      "PHOTO_COLLECTION_NOT_FOUND",
      "Photo is not in the collection.",
    );
  }

  removePhotoFromCollection(collectionId, photoId);

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

  if (!getCollectionArea(collectionId)) {
    return fail(context, 404, "COLLECTION_NOT_FOUND", "Collection not found.");
  }

  const existing = findCollectionPhotoIds(collectionId, photoIds);

  if (existing.length !== photoIds.length) {
    return fail(
      context,
      404,
      "PHOTO_COLLECTION_NOT_FOUND",
      "One or more photos are not in the collection.",
    );
  }

  removePhotosFromCollection(collectionId, photoIds);

  return context.json(getCollectionById(collectionId));
});
