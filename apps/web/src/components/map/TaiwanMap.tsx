import { useLayoutEffect, useRef, useState } from "react";
import { useAsyncData } from "../../hooks/useAsyncData";
import type { Area } from "../../types/gallery.type";
import { computeCanvasSize, type MapBox } from "./mapSizing";
import { parseRegionsSvg } from "./regions";
import { TaiwanRegions } from "./TaiwanRegions";

type TaiwanMapProps = {
  areas: Area[] | null;
  selectedAreaId: string | null;
  onSelectArea: (areaId: string | null) => void;
};

/** Extra space around the measured content bounds, in viewBox units. */
const CROP_PADDING = 20;

/** Dev/test hook: ?crop=x,y,w,h fakes the content bounding box. */
function parseCropParam(): MapBox | null {
  const raw = new URLSearchParams(window.location.search).get("crop");
  if (!raw) {
    return null;
  }
  const [x, y, w, h] = raw.split(",").map(Number);
  return [x, y, w, h].every(Number.isFinite) && w > 0 && h > 0
    ? { x, y, w, h }
    : null;
}

export function TaiwanMap({
  areas,
  selectedAreaId,
  onSelectArea,
}: TaiwanMapProps) {
  const { data: shapes, error } = useAsyncData(
    () =>
      fetch("/maps/taiwan-regions.svg")
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          return res.text();
        })
        .then(parseRegionsSvg),
    [],
    { errorMessage: "無法載入地圖資料" },
  );
  const scrollerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<SVGGElement>(null);
  const [crop, setCrop] = useState<MapBox | null>(parseCropParam);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      setViewport({
        w: entry.contentRect.width,
        h: entry.contentRect.height,
      });
    });
    observer.observe(scroller);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const g = measureRef.current;
    if (!g || crop) {
      return;
    }
    const bb = g.getBBox();
    setCrop({
      x: bb.x - CROP_PADDING,
      y: bb.y - CROP_PADDING,
      w: bb.width + CROP_PADDING * 2,
      h: bb.height + CROP_PADDING * 2,
    });
  }, [shapes, crop]);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !crop) {
      return;
    }
    scroller.scrollLeft = Math.max(
      0,
      (scroller.scrollWidth - scroller.clientWidth) / 2,
    );
    // Vertically overflowing maps start at the top; the bottom end-padding
    // lets the tail scroll clear of the bottom card.
    scroller.scrollTop = 0;
  }, [crop, viewport]);

  const viewBox = crop
    ? `${crop.x} ${crop.y} ${crop.w} ${crop.h}`
    : (shapes?.viewBox ?? undefined);
  const size =
    crop && viewport.w > 0
      ? computeCanvasSize(crop.w, crop.h, viewport.w, viewport.h)
      : null;

  return (
    <div className="map-viewport">
      {/* Scrollable end-padding mirrors the floating cards' classes:
          lg side panel (w-80 + right-6 + gap), below-lg bottom bar. */}
      <div
        className="map-scroller lg:pr-92 max-lg:pb-20"
        ref={scrollerRef}
        onClick={() => onSelectArea(null)}
      >
        <div
          className="map-canvas"
          style={size ? { width: size.width, height: size.height } : undefined}
        >
          <svg
            className="map-canvas__underlay"
            viewBox={viewBox}
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            {shapes && (
              <g transform={shapes.transform || undefined}>
                <defs>
                  <clipPath id="map-land-clip" clipPathUnits="userSpaceOnUse">
                    {shapes.regions.map((region) =>
                      region.paths.map((d) => <path key={d} d={d} />),
                    )}
                  </clipPath>
                </defs>
                <g clipPath="url(#map-land-clip)">
                  {shapes.regions.map((region) =>
                    region.paths.map((d) => (
                      <path key={d} d={d} className="map-canvas__land-fill" />
                    )),
                  )}
                </g>
              </g>
            )}
          </svg>
          <svg
            className="map-canvas__overlay"
            viewBox={viewBox}
            preserveAspectRatio="xMidYMid meet"
            role="group"
            aria-label="選擇行政區"
          >
            {shapes && (
              <g ref={measureRef}>
                <TaiwanRegions
                  shapes={shapes}
                  areas={areas}
                  selectedAreaId={selectedAreaId}
                  onSelectArea={onSelectArea}
                />
              </g>
            )}
          </svg>
        </div>
      </div>

      {error && (
        <div className="pointer-events-none absolute left-4 top-4 z-10 rounded bg-white px-3 py-2 text-sm text-red-600 shadow">
          {error}
        </div>
      )}
    </div>
  );
}
