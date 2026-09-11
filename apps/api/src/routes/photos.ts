import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db";
import { areas, collections, photoCollections, photos } from "../db/schema";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;

type SortDirection = "newest" | "oldest";

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

  if (value === "newest" || value === "oldest") {
    return value;
  }

  return null;
}

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
          message: 'The sort query parameter must be "newest" or "oldest".',
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

  const keywordCondition = keyword
    ? sql`(
        ${photos.title} LIKE ${`%${keyword}%`}
        OR COALESCE(${photos.summary}, '') LIKE ${`%${keyword}%`}
        OR COALESCE(${photos.description}, '') LIKE ${`%${keyword}%`}
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
  const orderBy = [
    sort === "newest" ? desc(photos.takenAt) : asc(photos.takenAt),
    asc(photos.id),
  ] as const;

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
  const photoId = context.req.param("photoId");

  const photo = db
    .select({
      id: photos.id,
      areaId: photos.areaId,
      title: photos.title,
      summary: photos.summary,
      description: photos.description,
      image: photos.image,
      takenAt: photos.takenAt,
      createdAt: photos.createdAt,
      updatedAt: photos.updatedAt,
    })
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

  const collectionIdsByPhotoId = getCollectionIdsByPhotoId([photo.id]);

  return context.json({
    ...photo,
    collectionIds: collectionIdsByPhotoId.get(photo.id) ?? [],
  });
});
