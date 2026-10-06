import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, inArray, notInArray, sql } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db";
import { areas, collections, photoCollections, photos } from "../db/schema";

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
  | { ok: true; photoIds: string[] }
  | { ok: false; message: string };

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

  const sort = parseSort(context.req.query("sort"));

  if (!sort) {
    return context.json(
      {
        error: {
          code: "INVALID_QUERY",
          message:
            'The sort query parameter must be "newest", "oldest", or "title".',
        },
      },
      400,
    );
  }

  const page = parsePositiveInteger(context.req.query("page"), DEFAULT_PAGE);

  if (!page) {
    return context.json(
      {
        error: {
          code: "INVALID_QUERY",
          message: "The page query parameter must be a positive integer.",
        },
      },
      400,
    );
  }

  const limit = parsePositiveInteger(context.req.query("limit"), DEFAULT_LIMIT);

  if (!limit || limit > MAX_LIMIT) {
    return context.json(
      {
        error: {
          code: "INVALID_QUERY",
          message: `The limit query parameter must be a positive integer not greater than ${MAX_LIMIT}.`,
        },
      },
      400,
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

  db.delete(photos).where(eq(photos.id, photoId)).run();

  return context.body(null, 204);
});

photosRoute.post("/batch-delete", async (context) => {
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

  const parsed = parsePhotoIdsBody(body);

  if (!parsed.ok) {
    return context.json(
      {
        error: {
          code: "INVALID_BODY",
          message: parsed.message,
        },
      },
      400,
    );
  }

  const existing = db
    .select({ id: photos.id })
    .from(photos)
    .where(inArray(photos.id, parsed.photoIds))
    .all();

  if (existing.length !== parsed.photoIds.length) {
    return context.json(
      {
        error: {
          code: "PHOTO_NOT_FOUND",
          message: "One or more photos were not found.",
        },
      },
      404,
    );
  }

  db.delete(photos).where(inArray(photos.id, parsed.photoIds)).run();

  return context.body(null, 204);
});

photosRoute.post("/", async (context) => {
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
  const { areaId, title, image, takenAt, summary, description } = payload;

  if (!isNonEmptyString(areaId)) {
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

  if (!isNonEmptyString(title)) {
    return context.json(
      {
        error: {
          code: "INVALID_BODY",
          message: "title must be a non-empty string.",
        },
      },
      400,
    );
  }

  if (!isNonEmptyString(image)) {
    return context.json(
      {
        error: {
          code: "INVALID_BODY",
          message: "image must be a non-empty string.",
        },
      },
      400,
    );
  }

  if (!isNonEmptyString(takenAt) || !isValidDateString(takenAt)) {
    return context.json(
      {
        error: {
          code: "INVALID_BODY",
          message: "takenAt must be a valid date string.",
        },
      },
      400,
    );
  }

  if (summary !== undefined && !isNullableString(summary)) {
    return context.json(
      {
        error: {
          code: "INVALID_BODY",
          message: "summary must be a string or null.",
        },
      },
      400,
    );
  }

  if (description !== undefined && !isNullableString(description)) {
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

  let collectionIds: string[] | undefined;

  if (payload.collectionIds !== undefined) {
    if (
      !Array.isArray(payload.collectionIds) ||
      payload.collectionIds.some((id) => !isNonEmptyString(id))
    ) {
      return context.json(
        {
          error: {
            code: "INVALID_BODY",
            message: "collectionIds must be an array of strings.",
          },
        },
        400,
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

  if (collectionIds) {
    const collectionCheck = checkCollectionsInArea(collectionIds, areaId);

    if (collectionCheck === "not_found") {
      return context.json(
        {
          error: {
            code: "COLLECTION_NOT_FOUND",
            message: "One or more collections were not found.",
          },
        },
        404,
      );
    }

    if (collectionCheck === "mismatch") {
      return context.json(
        {
          error: {
            code: "PHOTO_AREA_MISMATCH",
            message: "Collections must belong to the same area as the photo.",
          },
        },
        422,
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
  const updates: Partial<typeof photos.$inferInsert> = {};

  if (payload.title !== undefined) {
    if (!isNonEmptyString(payload.title)) {
      return context.json(
        {
          error: {
            code: "INVALID_BODY",
            message: "title must be a non-empty string.",
          },
        },
        400,
      );
    }

    updates.title = payload.title.trim();
  }

  if (payload.image !== undefined) {
    if (!isNonEmptyString(payload.image)) {
      return context.json(
        {
          error: {
            code: "INVALID_BODY",
            message: "image must be a non-empty string.",
          },
        },
        400,
      );
    }

    updates.image = payload.image.trim();
  }

  if (payload.takenAt !== undefined) {
    if (
      !isNonEmptyString(payload.takenAt) ||
      !isValidDateString(payload.takenAt)
    ) {
      return context.json(
        {
          error: {
            code: "INVALID_BODY",
            message: "takenAt must be a valid date string.",
          },
        },
        400,
      );
    }

    updates.takenAt = new Date(payload.takenAt).toISOString();
  }

  if (payload.summary !== undefined) {
    if (!isNullableString(payload.summary)) {
      return context.json(
        {
          error: {
            code: "INVALID_BODY",
            message: "summary must be a string or null.",
          },
        },
        400,
      );
    }

    updates.summary = payload.summary;
  }

  if (payload.description !== undefined) {
    if (!isNullableString(payload.description)) {
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

    updates.description = payload.description;
  }

  let collectionIds: string[] | undefined;

  if (payload.collectionIds !== undefined) {
    if (
      !Array.isArray(payload.collectionIds) ||
      payload.collectionIds.some((id) => !isNonEmptyString(id))
    ) {
      return context.json(
        {
          error: {
            code: "INVALID_BODY",
            message: "collectionIds must be an array of strings.",
          },
        },
        400,
      );
    }

    collectionIds = [...new Set(payload.collectionIds as string[])];
  }

  if (Object.keys(updates).length === 0 && collectionIds === undefined) {
    return context.json(
      {
        error: {
          code: "INVALID_BODY",
          message: "At least one updatable field is required.",
        },
      },
      400,
    );
  }

  if (collectionIds) {
    const collectionCheck = checkCollectionsInArea(
      collectionIds,
      photo.areaId,
    );

    if (collectionCheck === "not_found") {
      return context.json(
        {
          error: {
            code: "COLLECTION_NOT_FOUND",
            message: "One or more collections were not found.",
          },
        },
        404,
      );
    }

    if (collectionCheck === "mismatch") {
      return context.json(
        {
          error: {
            code: "PHOTO_AREA_MISMATCH",
            message: "Collections must belong to the same area as the photo.",
          },
        },
        422,
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
