import type { ErrorCode } from "@map-gallery/shared";
import { GalleryStoreError } from "../stores/gallery.store";

/** Shows an alert, preferring a per-code message, then error.message, then a fallback. */
export function alertError(
  reason: unknown,
  fallback: string,
  codeMessages?: Partial<Record<ErrorCode, string>>,
): void {
  const message =
    reason instanceof GalleryStoreError &&
    reason.code !== undefined &&
    codeMessages?.[reason.code] !== undefined
      ? codeMessages[reason.code]
      : reason instanceof Error
        ? reason.message
        : fallback;

  window.alert(message);
}
