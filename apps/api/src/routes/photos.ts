import { randomUUID } from "node:crypto";
import { Hono } from "hono";
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
import type { photos } from "../db/schema";
import { fail, readJsonObject } from "./errors";
import {
  escapeLikeKeyword,
  parsePhotoIdsBody,
  parsePositiveInteger,
  parseSort,
} from "./photos-request";
import {
  isNonEmptyString,
  isNullableString,
  isValidDateString,
} from "./validators";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;

export const photosRoute = new Hono();

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

photosRoute.delete("/:photoId", (context) => {
  const photoId = context.req.param("photoId");

  if (!getPhoto(photoId)) {
    return fail(context, 404, "PHOTO_NOT_FOUND", "Photo not found.");
  }

  deletePhoto(photoId);

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

  return context.body(null, 204);
});

photosRoute.post("/", async (context) => {
  const parsedBody = await readJsonObject(context);

  if (!parsedBody.ok) {
    return parsedBody.response;
  }

  const payload = parsedBody.payload;
  const { areaId, title, image, takenAt, summary, description } = payload;

  if (!isNonEmptyString(areaId)) {
    return fail(
      context,
      400,
      "INVALID_BODY",
      "areaId must be a non-empty string.",
    );
  }

  if (!isNonEmptyString(title)) {
    return fail(
      context,
      400,
      "INVALID_BODY",
      "title must be a non-empty string.",
    );
  }

  if (!isNonEmptyString(image)) {
    return fail(
      context,
      400,
      "INVALID_BODY",
      "image must be a non-empty string.",
    );
  }

  if (!isNonEmptyString(takenAt) || !isValidDateString(takenAt)) {
    return fail(
      context,
      400,
      "INVALID_BODY",
      "takenAt must be a valid date string.",
    );
  }

  if (summary !== undefined && !isNullableString(summary)) {
    return fail(
      context,
      400,
      "INVALID_BODY",
      "summary must be a string or null.",
    );
  }

  if (description !== undefined && !isNullableString(description)) {
    return fail(
      context,
      400,
      "INVALID_BODY",
      "description must be a string or null.",
    );
  }

  let collectionIds: string[] | undefined;

  if (payload.collectionIds !== undefined) {
    if (
      !Array.isArray(payload.collectionIds) ||
      payload.collectionIds.some((id) => !isNonEmptyString(id))
    ) {
      return fail(
        context,
        400,
        "INVALID_BODY",
        "collectionIds must be an array of strings.",
      );
    }

    collectionIds = [...new Set(payload.collectionIds as string[])];
  }

  if (!areaExists(areaId)) {
    return fail(context, 404, "AREA_NOT_FOUND", "Area not found.");
  }

  if (collectionIds) {
    const collectionCheck = checkCollectionsInArea(collectionIds, areaId);

    if (collectionCheck === "not_found") {
      return fail(
        context,
        404,
        "COLLECTION_NOT_FOUND",
        "One or more collections were not found.",
      );
    }

    if (collectionCheck === "mismatch") {
      return fail(
        context,
        422,
        "PHOTO_AREA_MISMATCH",
        "Collections must belong to the same area as the photo.",
      );
    }
  }

  const id = randomUUID();
  const now = new Date().toISOString();

  createPhotoWithCollections(
    {
      id,
      areaId,
      title: title.trim(),
      image: image.trim(),
      takenAt: new Date(takenAt).toISOString(),
      summary: summary ?? null,
      description: description ?? null,
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

  const payload = parsedBody.payload;
  const updates: Partial<typeof photos.$inferInsert> = {};

  if (payload.title !== undefined) {
    if (!isNonEmptyString(payload.title)) {
      return fail(
        context,
        400,
        "INVALID_BODY",
        "title must be a non-empty string.",
      );
    }

    updates.title = payload.title.trim();
  }

  if (payload.image !== undefined) {
    if (!isNonEmptyString(payload.image)) {
      return fail(
        context,
        400,
        "INVALID_BODY",
        "image must be a non-empty string.",
      );
    }

    updates.image = payload.image.trim();
  }

  if (payload.takenAt !== undefined) {
    if (
      !isNonEmptyString(payload.takenAt) ||
      !isValidDateString(payload.takenAt)
    ) {
      return fail(
        context,
        400,
        "INVALID_BODY",
        "takenAt must be a valid date string.",
      );
    }

    updates.takenAt = new Date(payload.takenAt).toISOString();
  }

  if (payload.summary !== undefined) {
    if (!isNullableString(payload.summary)) {
      return fail(
        context,
        400,
        "INVALID_BODY",
        "summary must be a string or null.",
      );
    }

    updates.summary = payload.summary;
  }

  if (payload.description !== undefined) {
    if (!isNullableString(payload.description)) {
      return fail(
        context,
        400,
        "INVALID_BODY",
        "description must be a string or null.",
      );
    }

    updates.description = payload.description;
  }

  let collectionIds: string[] | undefined;

  if (payload.collectionIds !== undefined) {
    if (
      !Array.isArray(payload.collectionIds) ||
      payload.collectionIds.some((id) => !isNonEmptyString(id))
    ) {
      return fail(
        context,
        400,
        "INVALID_BODY",
        "collectionIds must be an array of strings.",
      );
    }

    collectionIds = [...new Set(payload.collectionIds as string[])];
  }

  if (Object.keys(updates).length === 0 && collectionIds === undefined) {
    return fail(
      context,
      400,
      "INVALID_BODY",
      "At least one updatable field is required.",
    );
  }

  if (collectionIds) {
    const collectionCheck = checkCollectionsInArea(collectionIds, photo.areaId);

    if (collectionCheck === "not_found") {
      return fail(
        context,
        404,
        "COLLECTION_NOT_FOUND",
        "One or more collections were not found.",
      );
    }

    if (collectionCheck === "mismatch") {
      return fail(
        context,
        422,
        "PHOTO_AREA_MISMATCH",
        "Collections must belong to the same area as the photo.",
      );
    }
  }

  updatePhotoWithCollections(photoId, updates, collectionIds);

  return context.json(getPhotoDetail(photoId));
});
