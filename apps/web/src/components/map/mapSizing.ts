export type MapBox = { x: number; y: number; w: number; h: number };

/** Content width within this factor of the viewport counts as "fits" — shrink instead of scrolling. */
const SNAP_RATIO = 1.2;
/** Below this rendered width the map is too narrow — switch to width-bound so it scrolls vertically. */
const MIN_CANVAS_PX = 360;
/** The overflowing axis may exceed the viewport by at most this factor. */
const MAX_SCROLL_RATIO = 1.5;

/**
 * Canvas is height-bound by default. Genuinely wide content scrolls
 * horizontally; content too narrow at full height switches to width-bound
 * and scrolls vertically. Overflow is capped by MAX_SCROLL_RATIO.
 */
export function computeCanvasSize(
  boxW: number,
  boxH: number,
  viewportW: number,
  viewportH: number,
): { width: number; height: number } {
  const heightBoundW = (viewportH * boxW) / boxH;

  let width: number;
  if (heightBoundW >= viewportW * SNAP_RATIO) {
    width = Math.min(heightBoundW, viewportW * MAX_SCROLL_RATIO);
  } else if (heightBoundW >= MIN_CANVAS_PX) {
    width = Math.min(heightBoundW, viewportW);
  } else {
    width = Math.min(viewportW, (viewportH * MAX_SCROLL_RATIO * boxW) / boxH);
  }
  return { width, height: (width * boxH) / boxW };
}
