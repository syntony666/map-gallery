import { randomUUID } from "node:crypto";
import { Hono, type Context } from "hono";
import { areaExists } from "../data/areas";
import { getCollectionArea } from "../data/collections";
import {
  checkCollectionsInArea,
  createPhotoWithCollections,
  deletePhoto,
  deletePhotos,
  getCollectionIdsByPhotoId,
  getPhoto,
  getPhotoDetail,
  getPhotosByIds,
  listPhotos,
  updatePhotoWithCollections,
} from "../data/photos";
import { fail, readJsonObject } from "./errors";
import { removeUploadedImage } from "./uploads";
import {
  escapeLikeKeyword,
  parsePhotoFields,
  parsePhotoIdsBody,
  parsePositiveInteger,
  parseSort,
} from "./photos-request";
import { isNonEmptyString } from "./validators";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;

export const photosRoute = new Hono();

/** 404/422 response when collectionIds aren't usable in the photo's area. */
function collectionAreaError(
  context: Context,
  collectionIds: string[] | undefined,
  areaId: string,
) {
  if (!collectionIds) {
    return null;
  }

  const check = checkCollectionsInArea(collectionIds, areaId);

  if (check === "not_found") {
    return fail(
      context,
      404,
      "COLLECTION_NOT_FOUND",
      "One or more collections were not found.",
    );
  }

  if (check === "mismatch") {
    return fail(
      context,
      422,
      "PHOTO_AREA_MISMATCH",
      "Collections must belong to the same area as the photo.",
    );
  }

  return null;
}

photosRoute.get("/", (context) => {
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

  const sort = parseSort(context.req.query("sort"));

  if (!sort) {
    return fail(
      context,
      400,
      "INVALID_QUERY",
      'The sort query parameter must be "newest", "oldest", or "title".',
    );
  }

  const page = parsePositiveInteger(context.req.query("page"), DEFAULT_PAGE);

  if (!page) {
    return fail(
      context,
      400,
      "INVALID_QUERY",
      "The page query parameter must be a positive integer.",
    );
  }

  const limit = parsePositiveInteger(context.req.query("limit"), DEFAULT_LIMIT);

  if (!limit || limit > MAX_LIMIT) {
    return fail(
      context,
      400,
      "INVALID_QUERY",
      `The limit query parameter must be a positive integer not greater than ${MAX_LIMIT}.`,
    );
  }

  const keyword = context.req.query("keyword")?.trim();
  const collectionId = context.req.query("collectionId");

  if (collectionId) {
    const collection = getCollectionArea(collectionId);

    if (!collection || collection.areaId !== areaId) {
      return fail(
        context,
        404,
        "COLLECTION_NOT_FOUND",
        "Collection not found.",
      );
    }
  }

  const { items, total } = listPhotos({
    areaId,
    collectionId,
    keywordPattern: keyword ? escapeLikeKeyword(keyword) : null,
    sort,
    page,
    limit,
  });

  const collectionIdsByPhotoId = getCollectionIdsByPhotoId(
    items.map((photo) => photo.id),
  );

  return context.json({
    items: items.map((photo) => ({
      ...photo,
      collectionIds: collectionIdsByPhotoId.get(photo.id) ?? [],
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

photosRoute.get("/:photoId", (context) => {
  const photo = getPhotoDetail(context.req.param("photoId"));

  if (!photo) {
    return fail(context, 404, "PHOTO_NOT_FOUND", "Photo not found.");
  }

  return context.json(photo);
});

photosRoute.delete("/:photoId", async (context) => {
  const photoId = context.req.param("photoId");

  const photo = getPhoto(photoId);

  if (!photo) {
    return fail(context, 404, "PHOTO_NOT_FOUND", "Photo not found.");
  }

  deletePhoto(photoId);
  await removeUploadedImage(photo.image);

  return context.body(null, 204);
});

photosRoute.post("/batch-delete", async (context) => {
  const parsedBody = await readJsonObject(context);

  if (!parsedBody.ok) {
    return parsedBody.response;
  }

  const parsed = parsePhotoIdsBody(parsedBody.payload);

  if (!parsed.ok) {
    return fail(context, 400, "INVALID_BODY", parsed.message);
  }

  const existing = getPhotosByIds(parsed.photoIds);

  if (existing.length !== parsed.photoIds.length) {
    return fail(
      context,
      404,
      "PHOTO_NOT_FOUND",
      "One or more photos were not found.",
    );
  }

  deletePhotos(parsed.photoIds);
  await Promise.all(
    existing.map((photo) => removeUploadedImage(photo.image)),
  );

  return context.body(null, 204);
});

photosRoute.post("/", async (context) => {
  const parsedBody = await readJsonObject(context);

  if (!parsedBody.ok) {
    return parsedBody.response;
  }

  const payload = parsedBody.payload;
  const { areaId } = payload;

  if (!isNonEmptyString(areaId)) {
    return fail(
      context,
      400,
      "INVALID_BODY",
      "areaId must be a non-empty string.",
    );
  }

  const parsed = parsePhotoFields(payload, "create");

  if (!parsed.ok) {
    return fail(context, 400, "INVALID_BODY", parsed.message);
  }

  const { values, collectionIds } = parsed;

  if (!areaExists(areaId)) {
    return fail(context, 404, "AREA_NOT_FOUND", "Area not found.");
  }

  const collectionError = collectionAreaError(
    context,
    collectionIds,
    areaId,
  );

  if (collectionError) {
    return collectionError;
  }

  const id = randomUUID();
  const now = new Date().toISOString();

  createPhotoWithCollections(
    {
      id,
      areaId,
      title: values.title,
      image: values.image,
      takenAt: values.takenAt,
      summary: values.summary ?? null,
      description: values.description ?? null,
      createdAt: now,
      updatedAt: now,
    },
    collectionIds,
  );

  return context.json(getPhotoDetail(id), 201);
});

photosRoute.patch("/:photoId", async (context) => {
  const photoId = context.req.param("photoId");

  const photo = getPhoto(photoId);

  if (!photo) {
    return fail(context, 404, "PHOTO_NOT_FOUND", "Photo not found.");
  }

  const parsedBody = await readJsonObject(context);

  if (!parsedBody.ok) {
    return parsedBody.response;
  }

  const parsed = parsePhotoFields(parsedBody.payload, "update");

  if (!parsed.ok) {
    return fail(context, 400, "INVALID_BODY", parsed.message);
  }

  const { values: updates, collectionIds } = parsed;

  if (Object.keys(updates).length === 0 && collectionIds === undefined) {
    return fail(
      context,
      400,
      "INVALID_BODY",
      "At least one updatable field is required.",
    );
  }

  const collectionError = collectionAreaError(
    context,
    collectionIds,
    photo.areaId,
  );

  if (collectionError) {
    return collectionError;
  }

  updatePhotoWithCollections(photoId, updates, collectionIds);

  return context.json(getPhotoDetail(photoId));
});
