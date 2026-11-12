import { asc, eq, sql } from "drizzle-orm";
import { db } from "../db";
import { areaContents, areas, photos } from "../db/schema";

export const areaListSelection = {
  id: areas.id,
  name: areas.name,
  coverImage: sql<string | null>`
  COALESCE(
    (
      SELECT p.image
      FROM photos AS p
      WHERE p.id = area_contents.cover_photo_id
        AND p.area_id = areas.id
      LIMIT 1
    ),
    (
      SELECT p.image
      FROM photos AS p
      WHERE p.area_id = areas.id
      ORDER BY p.taken_at DESC, p.id ASC
      LIMIT 1
    )
  )
`,
  coverPhotoId: areaContents.coverPhotoId,
  description: areaContents.description,
  photoCount: sql<number>`
  (
    SELECT COUNT(*)
    FROM photos
    WHERE photos.area_id = areas.id
  )
`,
};

export function listAreas() {
  return db
    .select(areaListSelection)
    .from(areas)
    .leftJoin(areaContents, eq(areaContents.areaId, areas.id))
    .orderBy(asc(areas.id))
    .all();
}

export function getAreaById(areaId: string) {
  return db
    .select(areaListSelection)
    .from(areas)
    .leftJoin(areaContents, eq(areaContents.areaId, areas.id))
    .where(eq(areas.id, areaId))
    .get();
}

export function areaExists(areaId: string): boolean {
  return (
    db
      .select({ id: areas.id })
      .from(areas)
      .where(eq(areas.id, areaId))
      .get() !== undefined
  );
}

export function upsertAreaContent(
  areaId: string,
  fields: { coverPhotoId?: string | null; description?: string | null },
) {
  const hasCoverPhotoId = "coverPhotoId" in fields;
  const hasDescription = "description" in fields;
  const coverPhotoId = fields.coverPhotoId;
  const description = fields.description;
  const now = new Date().toISOString();

  db.insert(areaContents)
    .values({
      areaId,
      coverPhotoId: hasCoverPhotoId ? (coverPhotoId ?? null) : null,
      description: hasDescription ? (description ?? null) : null,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: areaContents.areaId,
      set: {
        ...(hasCoverPhotoId ? { coverPhotoId: coverPhotoId ?? null } : {}),
        ...(hasDescription ? { description: description ?? null } : {}),
        updatedAt: sql`excluded.updated_at`,
      },
    })
    .run();
}
