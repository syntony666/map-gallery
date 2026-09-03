import { asc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db";
import { areas, collections } from "../db/schema";

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
      createdAt: collections.createdAt,
      updatedAt: collections.updatedAt,
    })
    .from(collections)
    .where(eq(collections.areaId, areaId))
    .orderBy(asc(collections.name))
    .all();

  return context.json({ items });
});
