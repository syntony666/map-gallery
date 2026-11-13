import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import svgPanZoom from "svg-pan-zoom";
import Hammer from "hammerjs";
import { useAsyncData } from "../../hooks/useAsyncData";
import type { Area } from "../../types/gallery.type";
import type { MapBox } from "./mapSizing";
import { parseRegionsSvg } from "./regions";
import { TaiwanRegions } from "./TaiwanRegions";

type TaiwanMapProps = {
  areas: Area[] | null;
  selectedAreaId: string | null;
  onSelectArea: (areaId: string | null) => void;
};

/** Extra space around the measured content bounds, in viewBox units. */
const CROP_PADDING = 20;
/** Relative zoom (1 = fitted) above which panning unlocks. */
const PAN_UNLOCK_ZOOM = 1.02;
/** Pixels of pointer travel that turn a click into a drag. */
const DRAG_THRESHOLD_PX = 6;

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
  const svgRef = useRef<SVGSVGElement>(null);
  const viewportRef = useRef<SVGGElement>(null);
  const measureRef = useRef<SVGGElement>(null);
  const pointerDownAt = useRef<{ x: number; y: number } | null>(null);
  const [crop, setCrop] = useState<MapBox | null>(parseCropParam);

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

  useEffect(() => {
    const svg = svgRef.current;
    const viewport = viewportRef.current;
    const scroller = scrollerRef.current;
    if (!svg || !viewport || !scroller || !crop) {
      return;
    }

    let inst: SvgPanZoom.Instance | null = null;
    let unlocking = false;
    let hammerManager: HammerManager | null = null;

    inst = svgPanZoom(svg, {
      viewportSelector: viewport,
      fit: true,
      center: true,
      minZoom: 1,
      maxZoom: 6,
      zoomScaleSensitivity: 0.3,
      preventMouseEventsDefault: true,
      // getZoom() returns the zoom relative to the fitted state (1 = fit).
      // Panning is refused while fitted so the map stays locked in place.
      beforePan: () =>
        unlocking || (inst !== null && inst.getZoom() > PAN_UNLOCK_ZOOM),
      // Zooming out past the fit snaps back to the centered fitted state,
      // since pan offsets cannot be undone while panning is locked.
      onZoom: (newZoom) => {
        if (inst && !unlocking && newZoom <= PAN_UNLOCK_ZOOM) {
          unlocking = true;
          inst.reset();
          unlocking = false;
        }
      },
      customEventsHandler: {
        haltEventListeners: [
          "touchstart",
          "touchend",
          "touchmove",
          "touchleave",
          "touchcancel",
        ],
        init: (options) => {
          const instance = options.instance;
          const svgElement = options.svgElement;
          let initialScale = 1;
          let pannedX = 0;
          let pannedY = 0;

          hammerManager = new Hammer(svgElement, {
            inputClass: Hammer.SUPPORT_POINTER_EVENTS
              ? Hammer.PointerEventInput
              : Hammer.TouchInput,
            touchAction: "none",
          });
          hammerManager.get("pinch").set({ enable: true });
          hammerManager.on("doubletap", () => instance.zoomIn());
          hammerManager.on("panstart panmove", (ev) => {
            if (ev.type === "panstart") {
              pannedX = 0;
              pannedY = 0;
            }
            instance.panBy({ x: ev.deltaX - pannedX, y: ev.deltaY - pannedY });
            pannedX = ev.deltaX;
            pannedY = ev.deltaY;
          });
          hammerManager.on("pinchstart pinchmove", (ev) => {
            if (ev.type === "pinchstart") {
              initialScale = instance.getZoom();
            }
            const screenCTM = svgElement.getScreenCTM();
            if (!screenCTM) {
              return;
            }
            const point = new DOMPoint(
              ev.center.x,
              ev.center.y,
            ).matrixTransform(screenCTM.inverse());
            instance.zoomAtPoint(initialScale * ev.scale, {
              x: point.x,
              y: point.y,
            });
          });
        },
        destroy: () => {
          hammerManager?.destroy();
          hammerManager = null;
        },
      },
    });

    const observer = new ResizeObserver(() => inst?.resize());
    observer.observe(scroller);

    return () => {
      observer.disconnect();
      inst?.destroy();
      inst = null;
    };
  }, [crop, shapes]);

  const viewBox = crop
    ? `${crop.x} ${crop.y} ${crop.w} ${crop.h}`
    : (shapes?.viewBox ?? undefined);

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
        className="map-scroller lg:pr-92 max-lg:pb-20"
        ref={scrollerRef}
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
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
          role="group"
          aria-label="選擇行政區"
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

      {error && (
        <div className="pointer-events-none absolute left-4 top-4 z-10 rounded bg-white px-3 py-2 text-sm text-red-600 shadow">
          {error}
        </div>
      )}
    </div>
  );
}
