import { asc, eq, sql } from "drizzle-orm";
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
      photoCount: sql<number>`
      (
        SELECT COUNT(*)
        FROM photos
        WHERE photos.area_id = areas.id
      )
      `,
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
      photoCount: sql<number>`
      (
        SELECT COUNT(*)
        FROM photos
        WHERE photos.area_id = areas.id
      )
      `,
    })
    .from(areas)
    .leftJoin(areaContents, eq(areaContents.areaId, areas.id))
    .where(eq(areas.id, areaId))
    .get();

  if (!item) {
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

  return context.json(item);
});

areasRoute.patch("/:areaId/content", async (context) => {
  const areaId = context.req.param("areaId");

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
  const hasCoverImage = Object.hasOwn(payload, "coverImage");
  const hasDescription = Object.hasOwn(payload, "description");

  if (!hasCoverImage && !hasDescription) {
    return context.json(
      {
        error: {
          code: "INVALID_BODY",
          message: "Provide at least one of coverImage or description.",
        },
      },
      400,
    );
  }

  const coverImage = payload.coverImage;
  const description = payload.description;

  if (
    hasCoverImage &&
    coverImage !== null &&
    (typeof coverImage !== "string" || coverImage.trim() === "")
  ) {
    return context.json(
      {
        error: {
          code: "INVALID_BODY",
          message: "coverImage must be a non-empty string or null.",
        },
      },
      400,
    );
  }

  if (
    hasDescription &&
    description !== null &&
    typeof description !== "string"
  ) {
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

  const now = new Date().toISOString();

  db.insert(areaContents)
    .values({
      areaId,
      coverImage:
        hasCoverImage && typeof coverImage === "string"
          ? coverImage.trim()
          : null,
      description:
        hasDescription && typeof description === "string" ? description : null,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: areaContents.areaId,
      set: {
        ...(hasCoverImage
          ? {
              coverImage:
                coverImage === null ? null : (coverImage as string).trim(),
            }
          : {}),
        ...(hasDescription
          ? {
              description:
                description === null ? null : (description as string),
            }
          : {}),
        updatedAt: sql`excluded.updated_at`,
      },
    })
    .run();

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

  return context.json(item);
});
