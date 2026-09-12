import { asc, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db";
import { areas, collections, photoCollections, photos } from "../db/schema";

export const collectionsRoute = new Hono();

collectionsRoute.get("/", (context) => {
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

  const items = db
    .select({
      id: collections.id,
      areaId: collections.areaId,
      name: collections.name,
      coverImage: sql<string | null>`
      (
        SELECT p.image
        FROM photo_collections AS pc
        INNER JOIN photos AS p
          ON p.id = pc.photo_id
        WHERE pc.collection_id = collections.id
        ORDER BY p.taken_at DESC, p.id ASC
        LIMIT 1
      )
    `,
      photoCount: sql<number>`
      (
        SELECT COUNT(*)
        FROM ${photoCollections}
        WHERE ${photoCollections.collectionId} = ${collections.id}
      )
    `,
      createdAt: collections.createdAt,
      updatedAt: collections.updatedAt,
    })
    .from(collections)
    .where(eq(collections.areaId, areaId))
    .orderBy(asc(collections.name))
    .all();

  return context.json({ items });
});
