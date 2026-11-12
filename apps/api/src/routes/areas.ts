import { Hono } from "hono";
import {
  areaExists,
  getAreaById,
  listAreas,
  upsertAreaContent,
} from "../data/areas";
import { getPhoto } from "../data/photos";
import { fail, readJsonObject } from "./errors";
import { isNullableString } from "./validators";

export const areasRoute = new Hono();

areasRoute.get("/", (context) => {
  return context.json({ items: listAreas() });
});

areasRoute.get("/:areaId", (context) => {
  const item = getAreaById(context.req.param("areaId"));

  if (!item) {
    return fail(context, 404, "AREA_NOT_FOUND", "Area not found.");
  }

  return context.json(item);
});

areasRoute.patch("/:areaId/content", async (context) => {
  const areaId = context.req.param("areaId");

  if (!areaExists(areaId)) {
    return fail(context, 404, "AREA_NOT_FOUND", "Area not found.");
  }

  const parsedBody = await readJsonObject(context);

  if (!parsedBody.ok) {
    return parsedBody.response;
  }

  const payload = parsedBody.payload;
  const hasCoverPhotoId = Object.hasOwn(payload, "coverPhotoId");
  const hasDescription = Object.hasOwn(payload, "description");

  if (!hasCoverPhotoId && !hasDescription) {
    return fail(
      context,
      400,
      "INVALID_BODY",
      "Provide at least one of coverPhotoId or description.",
    );
  }

  const coverPhotoId = payload.coverPhotoId;
  const description = payload.description;

  if (hasCoverPhotoId && !isNullableString(coverPhotoId)) {
    return fail(
      context,
      400,
      "INVALID_BODY",
      "coverPhotoId must be a string or null.",
    );
  }

  if (typeof coverPhotoId === "string") {
    const photo = getPhoto(coverPhotoId);

    if (!photo) {
      return fail(context, 404, "PHOTO_NOT_FOUND", "Photo not found.");
    }

    if (photo.areaId !== areaId) {
      return fail(
        context,
        422,
        "PHOTO_AREA_MISMATCH",
        "Cover photo must belong to the area.",
      );
    }
  }

  if (hasDescription && !isNullableString(description)) {
    return fail(
      context,
      400,
      "INVALID_BODY",
      "description must be a string or null.",
    );
  }

  upsertAreaContent(areaId, {
    ...(hasCoverPhotoId ? { coverPhotoId: coverPhotoId as string | null } : {}),
    ...(hasDescription ? { description: description as string | null } : {}),
  });

  return context.json(getAreaById(areaId));
});
