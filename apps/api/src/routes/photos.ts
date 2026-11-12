import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, inArray, notInArray, sql } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db";
import { areas, collections, photoCollections, photos } from "../db/schema";
import { fail, readJsonObject } from "./errors";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;

type SortDirection = "newest" | "oldest" | "title";

const photoListSelection = {
  id: photos.id,
  areaId: photos.areaId,
  title: photos.title,
  summary: photos.summary,
  image: photos.image,
  takenAt: photos.takenAt,
  createdAt: photos.createdAt,
  updatedAt: photos.updatedAt,
};

const photoDetailSelection = {
  ...photoListSelection,
  description: photos.description,
};

function parsePositiveInteger(
  value: string | undefined,
  fallback: number,
): number | null {
  if (value === undefined) {
    return fallback;
  }

  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }

  return Number(value);
}

function parseSort(value: string | undefined): SortDirection | null {
  if (value === undefined) {
    return "newest";
  }

  if (value === "newest" || value === "oldest" || value === "title") {
    return value;
  }

  return null;
}

function escapeLikeKeyword(keyword: string): string {
  return `%${keyword.replace(/[\\%_]/g, (match) => `\\${match}`)}%`;
}

const orderByBySort = {
  newest: [desc(photos.takenAt), asc(photos.id)],
  oldest: [asc(photos.takenAt), asc(photos.id)],
  title: [asc(photos.title), asc(photos.id)],
} satisfies Record<SortDirection, unknown>;

function getCollectionIdsByPhotoId(photoIds: readonly string[]) {
  if (photoIds.length === 0) {
    return new Map<string, string[]>();
  }

  const relations = db
    .select({
      photoId: photoCollections.photoId,
      collectionId: photoCollections.collectionId,
    })
    .from(photoCollections)
    .where(inArray(photoCollections.photoId, photoIds))
    .all();

  const collectionIdsByPhotoId = new Map<string, string[]>();

  for (const relation of relations) {
    const collectionIds = collectionIdsByPhotoId.get(relation.photoId) ?? [];

    collectionIds.push(relation.collectionId);
    collectionIdsByPhotoId.set(relation.photoId, collectionIds);
  }

  return collectionIdsByPhotoId;
}

type ParsedPhotoIds =
  { ok: true; photoIds: string[] } | { ok: false; message: string };

function parsePhotoIdsBody(body: unknown): ParsedPhotoIds {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, message: "Request body must be a JSON object." };
  }

  const photoIds = (body as Record<string, unknown>).photoIds;

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

  return { ok: true, photoIds: [...new Set(photoIds)] };
}

function getPhotoDetail(photoId: string) {
  const photo = db
    .select(photoDetailSelection)
    .from(photos)
    .where(eq(photos.id, photoId))
    .get();

  if (!photo) {
    return undefined;
  }

  const photoCollectionRows = db
    .select({ id: collections.id, name: collections.name })
    .from(photoCollections)
    .innerJoin(collections, eq(collections.id, photoCollections.collectionId))
    .where(eq(photoCollections.photoId, photo.id))
    .all();

  return {
    ...photo,
    collections: photoCollectionRows,
  };
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isValidDateString(value: string): boolean {
  return !Number.isNaN(new Date(value).getTime());
}

function checkCollectionsInArea(
  collectionIds: string[],
  areaId: string,
): "ok" | "not_found" | "mismatch" {
  const found = db
    .select({ id: collections.id, areaId: collections.areaId })
    .from(collections)
    .where(inArray(collections.id, collectionIds))
    .all();

  if (found.length !== collectionIds.length) {
    return "not_found";
  }

  return found.every((collection) => collection.areaId === areaId)
    ? "ok"
    : "mismatch";
}

function replacePhotoCollections(photoId: string, collectionIds: string[]) {
  db.delete(photoCollections)
    .where(
      and(
        eq(photoCollections.photoId, photoId),
        collectionIds.length > 0
          ? notInArray(photoCollections.collectionId, collectionIds)
          : undefined,
      ),
    )
    .run();

  if (collectionIds.length === 0) {
    return;
  }

  const createdAt = new Date().toISOString();

  db.insert(photoCollections)
    .values(
      collectionIds.map((collectionId) => ({
        photoId,
        collectionId,
        createdAt,
      })),
    )
    .onConflictDoNothing()
    .run();
}

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
    const collection = db
      .select({ id: collections.id })
      .from(collections)
      .where(
        and(eq(collections.id, collectionId), eq(collections.areaId, areaId)),
      )
      .get();

    if (!collection) {
      return fail(
        context,
        404,
        "COLLECTION_NOT_FOUND",
        "Collection not found.",
      );
    }
  }

  const keywordPattern = keyword ? escapeLikeKeyword(keyword) : null;

  const keywordCondition = keywordPattern
    ? sql`(
        ${photos.title} LIKE ${keywordPattern} ESCAPE '\\'
        OR COALESCE(${photos.summary}, '') LIKE ${keywordPattern} ESCAPE '\\'
        OR COALESCE(${photos.description}, '') LIKE ${keywordPattern} ESCAPE '\\'
      )`
    : undefined;

  const whereClause = collectionId
    ? and(
        eq(photos.areaId, areaId),
        eq(photoCollections.collectionId, collectionId),
        keywordCondition,
      )
    : and(eq(photos.areaId, areaId), keywordCondition);

  const totalResult = collectionId
    ? db
        .select({ count: sql<number>`count(*)` })
        .from(photos)
        .innerJoin(photoCollections, eq(photoCollections.photoId, photos.id))
        .where(whereClause)
        .get()
    : db
        .select({ count: sql<number>`count(*)` })
        .from(photos)
        .where(whereClause)
        .get();

  const total = totalResult?.count ?? 0;
  const offset = (page - 1) * limit;
  const orderBy = orderByBySort[sort];

  const items = collectionId
    ? db
        .select(photoListSelection)
        .from(photos)
        .innerJoin(photoCollections, eq(photoCollections.photoId, photos.id))
        .where(whereClause)
        .orderBy(...orderBy)
        .limit(limit)
        .offset(offset)
        .all()
    : db
        .select(photoListSelection)
        .from(photos)
        .where(whereClause)
        .orderBy(...orderBy)
        .limit(limit)
        .offset(offset)
        .all();

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

  const photo = db
    .select({ id: photos.id })
    .from(photos)
    .where(eq(photos.id, photoId))
    .get();

  if (!photo) {
    return fail(context, 404, "PHOTO_NOT_FOUND", "Photo not found.");
  }

  db.delete(photos).where(eq(photos.id, photoId)).run();

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

  const existing = db
    .select({ id: photos.id })
    .from(photos)
    .where(inArray(photos.id, parsed.photoIds))
    .all();

  if (existing.length !== parsed.photoIds.length) {
    return fail(
      context,
      404,
      "PHOTO_NOT_FOUND",
      "One or more photos were not found.",
    );
  }

  db.delete(photos).where(inArray(photos.id, parsed.photoIds)).run();

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

  const area = db
    .select({ id: areas.id })
    .from(areas)
    .where(eq(areas.id, areaId))
    .get();

  if (!area) {
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

  db.transaction(() => {
    db.insert(photos)
      .values({
        id,
        areaId,
        title: title.trim(),
        image: image.trim(),
        takenAt: new Date(takenAt).toISOString(),
        summary: summary ?? null,
        description: description ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    if (collectionIds) {
      replacePhotoCollections(id, collectionIds);
    }
  });

  return context.json(getPhotoDetail(id), 201);
});

photosRoute.patch("/:photoId", async (context) => {
  const photoId = context.req.param("photoId");

  const photo = db
    .select({ id: photos.id, areaId: photos.areaId })
    .from(photos)
    .where(eq(photos.id, photoId))
    .get();

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

  db.transaction(() => {
    if (Object.keys(updates).length > 0) {
      updates.updatedAt = new Date().toISOString();
      db.update(photos).set(updates).where(eq(photos.id, photoId)).run();
    }

    if (collectionIds) {
      replacePhotoCollections(photoId, collectionIds);
    }
  });

  return context.json(getPhotoDetail(photoId));
});
