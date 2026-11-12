import { and, asc, desc, eq, inArray, notInArray } from "drizzle-orm";
import { db } from "../db";
import { collections, photoCollections, photos } from "../db/schema";
import { isNonEmptyString } from "./validators";

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

export function parsePositiveInteger(
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

export function parseSort(value: string | undefined): SortDirection | null {
  if (value === undefined) {
    return "newest";
  }

  if (value === "newest" || value === "oldest" || value === "title") {
    return value;
  }

  return null;
}

export function escapeLikeKeyword(keyword: string): string {
  return `%${keyword.replace(/[\\%_]/g, (match) => `\\${match}`)}%`;
}

export const orderByBySort = {
  newest: [desc(photos.takenAt), asc(photos.id)],
  oldest: [asc(photos.takenAt), asc(photos.id)],
  title: [asc(photos.title), asc(photos.id)],
} satisfies Record<SortDirection, unknown>;

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

export type ParsedPhotoIds =
  { ok: true; photoIds: string[] } | { ok: false; message: string };

export function parsePhotoIdsBody(body: unknown): ParsedPhotoIds {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, message: "Request body must be a JSON object." };
  }

  const photoIds = (body as Record<string, unknown>).photoIds;

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

  return { ok: true, photoIds: [...new Set(photoIds)] };
}

export function getPhotoDetail(photoId: string) {
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

export function replacePhotoCollections(
  photoId: string,
  collectionIds: string[],
) {
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
