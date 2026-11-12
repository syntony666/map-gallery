import { and, asc, desc, eq, inArray, notInArray, sql } from "drizzle-orm";
import { db } from "../db";
import { collections, photoCollections, photos } from "../db/schema";

export type SortDirection = "newest" | "oldest" | "title";

export const photoListSelection = {
  id: photos.id,
  areaId: photos.areaId,
  title: photos.title,
  summary: photos.summary,
  image: photos.image,
  takenAt: photos.takenAt,
  createdAt: photos.createdAt,
  updatedAt: photos.updatedAt,
};

export const photoDetailSelection = {
  ...photoListSelection,
  description: photos.description,
};

export const orderByBySort = {
  newest: [desc(photos.takenAt), asc(photos.id)],
  oldest: [asc(photos.takenAt), asc(photos.id)],
  title: [asc(photos.title), asc(photos.id)],
} satisfies Record<SortDirection, unknown>;

export function getPhoto(photoId: string) {
  return db
    .select({ id: photos.id, areaId: photos.areaId })
    .from(photos)
    .where(eq(photos.id, photoId))
    .get();
}

export function getPhotoRow(photoId: string) {
  return db
    .select(photoDetailSelection)
    .from(photos)
    .where(eq(photos.id, photoId))
    .get();
}

export function getPhotoDetail(photoId: string) {
  const photo = getPhotoRow(photoId);

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

export function getPhotosByIds(photoIds: string[]) {
  return db
    .select({ id: photos.id, areaId: photos.areaId })
    .from(photos)
    .where(inArray(photos.id, photoIds))
    .all();
}

export function getCollectionIdsByPhotoId(photoIds: readonly string[]) {
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

export function checkCollectionsInArea(
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

export function listPhotos(params: {
  areaId: string;
  collectionId?: string;
  keywordPattern: string | null;
  sort: SortDirection;
  page: number;
  limit: number;
}) {
  const { areaId, collectionId, keywordPattern, sort, page, limit } = params;

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

  return { items, total };
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

export function createPhotoWithCollections(
  photo: typeof photos.$inferInsert,
  collectionIds: string[] | undefined,
) {
  db.transaction(() => {
    db.insert(photos).values(photo).run();

    if (collectionIds) {
      replacePhotoCollections(photo.id, collectionIds);
    }
  });
}

export function updatePhotoWithCollections(
  photoId: string,
  updates: Partial<typeof photos.$inferInsert>,
  collectionIds: string[] | undefined,
) {
  db.transaction(() => {
    if (Object.keys(updates).length > 0) {
      updates.updatedAt = new Date().toISOString();
      db.update(photos).set(updates).where(eq(photos.id, photoId)).run();
    }

    if (collectionIds) {
      replacePhotoCollections(photoId, collectionIds);
    }
  });
}

export function deletePhoto(photoId: string) {
  db.delete(photos).where(eq(photos.id, photoId)).run();
}

export function deletePhotos(photoIds: string[]) {
  db.delete(photos).where(inArray(photos.id, photoIds)).run();
}
