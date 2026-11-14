import { useLayoutEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import svgPanZoom from "svg-pan-zoom";
import { useAsyncData } from "../../hooks/useAsyncData";
import { useDelayedUnmount } from "../../hooks/useDelayedUnmount";
import type { Area } from "../../types/gallery.type";
import type { MapBox } from "./mapSizing";
import { parseRegionsSvg } from "./regions";
import { TaiwanRegions } from "./TaiwanRegions";
import {
  allowZoom,
  bindGestures,
  constrainPan,
  createGestureContext,
  HALTED_TOUCH_EVENTS,
  LIB_MAX_ZOOM,
  LIB_MIN_ZOOM,
  snapBackIfUndershot,
  stopAllMotion,
  ZOOM_SENSITIVITY,
} from "./mapGestures";

type TaiwanMapProps = {
  areas: Area[] | null;
  selectedAreaId: string | null;
  onSelectArea: (areaId: string | null) => void;
};

/** Extra space around the measured content bounds, in viewBox units. */
const CROP_PADDING = 20;
/** Pixels of pointer travel that turn a click into a drag. */
const DRAG_THRESHOLD_PX = 6;
/** Tailwind lg breakpoint; above it the side panel replaces the bottom bar. */
const LG_BREAKPOINT_PX = 1024;
/** Screen space reserved for floating chrome, in px: right on lg+, bottom below. */
const CHROME_INSET_LG_PX = 368;
const CHROME_INSET_SM_PX = 80;
/** Height changes smaller than this are ignored — iOS URL bar show/hide. */
const RESIZE_IGNORE_PX = 120;

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
  const toastError = useDelayedUnmount(error);
  const stageRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const viewportRef = useRef<SVGGElement>(null);
  const measureRef = useRef<SVGGElement>(null);
  const instanceRef = useRef<SvgPanZoom.Instance | null>(null);
  const pointerDownAt = useRef<{ x: number; y: number } | null>(null);
  const prevSize = useRef({ w: 0, h: 0 });
  const [crop, setCrop] = useState<MapBox | null>(parseCropParam);
  const [viewportSize, setViewportSize] = useState({ w: 0, h: 0 });
  const [mapReady, setMapReady] = useState(false);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      setViewportSize({
        w: entry.contentRect.width,
        h: entry.contentRect.height,
      });
    });
    observer.observe(stage);
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

  // An invisible rect extends the content bounds toward the floating chrome
  // (side panel on lg+, bottom bar below) so fit, centering and the pan clamp
  // all treat that screen space as part of the map: the island rests clear of
  // the chrome and may slide under it, but never out of view.
  const bounds =
    crop && viewportSize.w > 0
      ? (() => {
          const unitsPerPx = Math.max(
            crop.w / viewportSize.w,
            crop.h / viewportSize.h,
          );
          const insetR =
            viewportSize.w >= LG_BREAKPOINT_PX ? CHROME_INSET_LG_PX : 0;
          const insetB =
            viewportSize.w >= LG_BREAKPOINT_PX ? 0 : CHROME_INSET_SM_PX;
          return {
            x: crop.x,
            y: crop.y,
            w: crop.w + insetR * unitsPerPx,
            h: crop.h + insetB * unitsPerPx,
          };
        })()
      : null;

  const boundsReady = bounds !== null;
  useLayoutEffect(() => {
    const svg = svgRef.current;
    const viewport = viewportRef.current;
    if (!svg || !viewport || !boundsReady || instanceRef.current) {
      return;
    }

    let inst: SvgPanZoom.Instance | null = null;
    let hammerManager: HammerManager | null = null;
    // Shared with the gesture handlers: guard flags and animation frames, so
    // the svg-pan-zoom callbacks below and the Hammer wiring see one state.
    const motion = createGestureContext();

    inst = svgPanZoom(svg, {
      viewportSelector: viewport,
      fit: true,
      center: true,
      minZoom: LIB_MIN_ZOOM,
      maxZoom: LIB_MAX_ZOOM,
      zoomScaleSensitivity: ZOOM_SENSITIVITY,
      preventMouseEventsDefault: true,
      // getZoom() returns the zoom relative to the fitted state (1 = fit).
      beforePan: (_oldPan, newPan) =>
        !inst || constrainPan(inst, motion.guards, newPan),
      beforeZoom: (_oldScale, newScale) =>
        !inst || allowZoom(inst, motion.guards, newScale),
      onZoom: (newZoom) => {
        if (inst) {
          snapBackIfUndershot(inst, motion.guards, newZoom);
        }
      },
      customEventsHandler: {
        haltEventListeners: HALTED_TOUCH_EVENTS,
        init: (options) => {
          hammerManager = bindGestures(options, motion);
        },
        destroy: () => {
          stopAllMotion(motion);
          hammerManager?.destroy();
          hammerManager = null;
        },
      },
    });
    instanceRef.current = inst;
    // The library applies the initial transform on the next animation frame;
    // reveal the map in that same frame to avoid a 1:1-scale flash.
    requestAnimationFrame(() => setMapReady(true));

    return () => {
      inst?.destroy();
      instanceRef.current = null;
    };
  }, [boundsReady]);

  useLayoutEffect(() => {
    const inst = instanceRef.current;
    const prev = prevSize.current;
    prevSize.current = viewportSize;
    if (!inst || viewportSize.w === 0) {
      return;
    }
    const dw = Math.abs(viewportSize.w - prev.w);
    const dh = Math.abs(viewportSize.h - prev.h);
    if (dw === 0 && dh < RESIZE_IGNORE_PX) {
      return;
    }
    inst.updateBBox();
    inst.resize();
  }, [viewportSize]);

  const isDragClick = (e: ReactMouseEvent) => {
    const down = pointerDownAt.current;
    return (
      down !== null &&
      Math.hypot(e.clientX - down.x, e.clientY - down.y) > DRAG_THRESHOLD_PX
    );
  };

  return (
    <div className="map-viewport">
      <div
        className="map-stage"
        ref={stageRef}
        onPointerDown={(e) => {
          pointerDownAt.current = { x: e.clientX, y: e.clientY };
        }}
        onClickCapture={(e) => {
          if (isDragClick(e)) {
            e.stopPropagation();
          }
        }}
        onClick={(e) => {
          if (!isDragClick(e)) {
            onSelectArea(null);
          }
        }}
      >
        <svg
          ref={svgRef}
          className="map-svg"
          role="group"
          aria-label="選擇行政區"
          style={{ visibility: mapReady ? "visible" : "hidden" }}
        >
          <defs>
            <clipPath id="map-land-clip" clipPathUnits="userSpaceOnUse">
              {shapes?.regions.map((region) =>
                region.paths.map((d) => <path key={d} d={d} />),
              )}
            </clipPath>
          </defs>
          {/* svg-pan-zoom adopts this group as its transform viewport; it must
              stay the only non-defs child and carry no transform attribute. */}
          <g ref={viewportRef} className="svg-pan-zoom_viewport">
            {bounds && (
              <rect
                x={bounds.x}
                y={bounds.y}
                width={bounds.w}
                height={bounds.h}
                fill="none"
                pointerEvents="none"
              />
            )}
            {shapes && (
              <>
                <g transform={shapes.transform || undefined} aria-hidden="true">
                  <g clipPath="url(#map-land-clip)">
                    {shapes.regions.map((region) =>
                      region.paths.map((d) => (
                        <path key={d} d={d} className="map-canvas__land-fill" />
                      )),
                    )}
                  </g>
                </g>
                <g ref={measureRef}>
                  <TaiwanRegions
                    shapes={shapes}
                    areas={areas}
                    selectedAreaId={selectedAreaId}
                    onSelectArea={onSelectArea}
                  />
                </g>
              </>
            )}
          </g>
        </svg>
      </div>

      {toastError && (
        <div
          className={`overlay-enter ${error ? "" : "overlay-exit"} pointer-events-none absolute left-4 top-4 z-10 rounded bg-surface/70 px-3 py-2 text-sm text-danger shadow-lg backdrop-blur`}
        >
          {toastError}
        </div>
      )}
    </div>
  );
}
