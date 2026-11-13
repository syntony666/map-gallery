export type MapBox = { x: number; y: number; w: number; h: number };

/** Content width within this factor of the viewport counts as "fits" — shrink instead of scrolling. */
const SNAP_RATIO = 1.2;
/** The canvas may exceed the viewport width by at most this factor. */
const MAX_SCROLL_RATIO = 1.5;

/**
 * Canvas is always height-bound. If the resulting content width stays near
 * the viewport width it shrinks to fit (no scroll); genuinely wide content
 * scrolls horizontally, bounded by MAX_SCROLL_RATIO.
 */
export function computeCanvasSize(
  boxW: number,
  boxH: number,
  viewportW: number,
  viewportH: number,
): { width: number; height: number } {
  const heightBoundW = (viewportH * boxW) / boxH;
  const width =
    heightBoundW <= viewportW * SNAP_RATIO
      ? Math.min(heightBoundW, viewportW)
      : Math.min(heightBoundW, viewportW * MAX_SCROLL_RATIO);
  return { width, height: (width * boxH) / boxW };
}
