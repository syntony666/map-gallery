import { asc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db";
import { areaContents, areas } from "../db/schema";

export const areasRoute = new Hono();

areasRoute.get("/", (context) => {
  const items = db
    .select({
      id: areas.id,
      name: areas.name,
      coverImage: areaContents.coverImage,
      description: areaContents.description,
    })
    .from(areas)
    .leftJoin(areaContents, eq(areaContents.areaId, areas.id))
    .orderBy(asc(areas.id))
    .all();

  return context.json({ items });
});

areasRoute.get("/:areaId", (context) => {
  const areaId = context.req.param("areaId");

  const item = db
    .select({
      id: areas.id,
      name: areas.name,
      coverImage: areaContents.coverImage,
      description: areaContents.description,
    })
    .from(areas)
    .leftJoin(areaContents, eq(areaContents.areaId, areas.id))
    .where(eq(areas.id, areaId))
    .get();

  if (!item) {
    return context.json(
      {
        error: {
          code: 404,
          message: "Area not found.",
        },
      },
      404,
    );
  }

  return context.json(item);
});
