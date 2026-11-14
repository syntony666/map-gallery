import type { SortDirection } from "../data/photos";
import {
  isNonEmptyString,
  isNullableString,
  isValidDateString,
} from "./validators";

export type { SortDirection };

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

export type PhotoUpdateValues = {
  title?: string;
  image?: string;
  takenAt?: string;
  summary?: string | null;
  description?: string | null;
};

export type PhotoCreateValues = Required<
  Pick<PhotoUpdateValues, "title" | "image" | "takenAt">
> &
  Pick<PhotoUpdateValues, "summary" | "description">;

export type ParsedPhotoFields<T> =
  | { ok: true; values: T; collectionIds: string[] | undefined }
  | { ok: false; message: string };

export function parsePhotoFields(
  payload: Record<string, unknown>,
  mode: "create",
): ParsedPhotoFields<PhotoCreateValues>;
export function parsePhotoFields(
  payload: Record<string, unknown>,
  mode: "update",
): ParsedPhotoFields<PhotoUpdateValues>;
export function parsePhotoFields(
  payload: Record<string, unknown>,
  mode: "create" | "update",
): ParsedPhotoFields<PhotoUpdateValues> {
  const required = mode === "create";
  const values: PhotoUpdateValues = {};

  for (const key of ["title", "image"] as const) {
    const value = payload[key];

    if (value === undefined) {
      if (required) {
        return { ok: false, message: `${key} must be a non-empty string.` };
      }

      continue;
    }

    if (!isNonEmptyString(value)) {
      return { ok: false, message: `${key} must be a non-empty string.` };
    }

    values[key] = value.trim();
  }

  if (payload.takenAt === undefined) {
    if (required) {
      return { ok: false, message: "takenAt must be a valid date string." };
    }
  } else {
    if (
      !isNonEmptyString(payload.takenAt) ||
      !isValidDateString(payload.takenAt)
    ) {
      return { ok: false, message: "takenAt must be a valid date string." };
    }

    values.takenAt = new Date(payload.takenAt).toISOString();
  }

  for (const key of ["summary", "description"] as const) {
    const value = payload[key];

    if (value === undefined) {
      continue;
    }

    if (!isNullableString(value)) {
      return { ok: false, message: `${key} must be a string or null.` };
    }

    values[key] = value;
  }

  let collectionIds: string[] | undefined;

  if (payload.collectionIds !== undefined) {
    if (
      !Array.isArray(payload.collectionIds) ||
      payload.collectionIds.some((id) => !isNonEmptyString(id))
    ) {
      return {
        ok: false,
        message: "collectionIds must be an array of strings.",
      };
    }

    collectionIds = [...new Set(payload.collectionIds as string[])];
  }

  return { ok: true, values, collectionIds };
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
