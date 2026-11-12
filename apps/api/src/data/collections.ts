import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { db } from "../db";
import { collections, photoCollections } from "../db/schema";

export const collectionListSelection = {
  id: collections.id,
  areaId: collections.areaId,
  name: collections.name,
  coverImage: sql<string | null>`
  COALESCE(
    (
      SELECT p.image
      FROM photo_collections AS pc
      INNER JOIN photos AS p
        ON p.id = pc.photo_id
      WHERE pc.collection_id = collections.id
        AND pc.photo_id = collections.cover_photo_id
      LIMIT 1
    ),
    (
      SELECT p.image
      FROM photo_collections AS pc
      INNER JOIN photos AS p
        ON p.id = pc.photo_id
      WHERE pc.collection_id = collections.id
      ORDER BY p.taken_at DESC, p.id ASC
      LIMIT 1
    )
  )
`,
  coverPhotoId: collections.coverPhotoId,
  photoCount: sql<number>`
  (
    SELECT COUNT(*)
    FROM ${photoCollections}
    WHERE ${photoCollections.collectionId} = ${collections.id}
  )
`,
  createdAt: collections.createdAt,
  updatedAt: collections.updatedAt,
};

export function listCollectionsByArea(areaId: string) {
  return db
    .select(collectionListSelection)
    .from(collections)
    .where(eq(collections.areaId, areaId))
    .orderBy(asc(collections.name))
    .all();
}

export function getCollectionById(collectionId: string) {
  return db
    .select(collectionListSelection)
    .from(collections)
    .where(eq(collections.id, collectionId))
    .get();
}

export function getCollectionArea(collectionId: string) {
  return db
    .select({ id: collections.id, areaId: collections.areaId })
    .from(collections)
    .where(eq(collections.id, collectionId))
    .get();
}

export function createCollection(collection: typeof collections.$inferInsert) {
  db.insert(collections).values(collection).run();
}

export function updateCollection(
  collectionId: string,
  fields: { name?: string; coverPhotoId?: string | null },
) {
  db.update(collections)
    .set({ ...fields, updatedAt: new Date().toISOString() })
    .where(eq(collections.id, collectionId))
    .run();
}

export function deleteCollection(collectionId: string) {
  db.delete(collections).where(eq(collections.id, collectionId)).run();
}

export function collectionHasPhoto(
  collectionId: string,
  photoId: string,
): boolean {
  return (
    db
      .select({ photoId: photoCollections.photoId })
      .from(photoCollections)
      .where(
        and(
          eq(photoCollections.collectionId, collectionId),
          eq(photoCollections.photoId, photoId),
        ),
      )
      .get() !== undefined
  );
}

export function findCollectionPhotoIds(
  collectionId: string,
  photoIds: string[],
): string[] {
  return db
    .select({ photoId: photoCollections.photoId })
    .from(photoCollections)
    .where(
      and(
        eq(photoCollections.collectionId, collectionId),
        inArray(photoCollections.photoId, photoIds),
      ),
    )
    .all()
    .map((row) => row.photoId);
}

export function addPhotosToCollection(
  collectionId: string,
  photoIds: string[],
) {
  const createdAt = new Date().toISOString();

  db.insert(photoCollections)
    .values(photoIds.map((photoId) => ({ photoId, collectionId, createdAt })))
    .onConflictDoNothing()
    .run();
}

export function removePhotoFromCollection(
  collectionId: string,
  photoId: string,
) {
  db.delete(photoCollections)
    .where(
      and(
        eq(photoCollections.collectionId, collectionId),
        eq(photoCollections.photoId, photoId),
      ),
    )
    .run();
}

export function removePhotosFromCollection(
  collectionId: string,
  photoIds: string[],
) {
  db.delete(photoCollections)
    .where(
      and(
        eq(photoCollections.collectionId, collectionId),
        inArray(photoCollections.photoId, photoIds),
      ),
    )
    .run();
}
