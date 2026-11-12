import type { SortDirection } from "../data/photos";
import { isNonEmptyString } from "./validators";

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
