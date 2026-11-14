import type { ErrorCode } from "@map-gallery/shared";
import { GalleryStoreError } from "../stores/gallery.store";

/** Resolves the message for an error dialog: per-code message, then
    error.message, then a fallback. */
export function alertMessage(
  reason: unknown,
  fallback: string,
  codeMessages?: Partial<Record<ErrorCode, string>>,
): string {
  const codeMessage =
    reason instanceof GalleryStoreError && reason.code !== undefined
      ? codeMessages?.[reason.code]
      : undefined;
  if (codeMessage !== undefined) return codeMessage;
  return reason instanceof Error ? reason.message : fallback;
}
