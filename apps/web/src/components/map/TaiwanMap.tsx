import { useLayoutEffect, useRef, useState } from "react";
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
/** Maximum relative zoom; pinch may overshoot it slightly with resistance. */
const MAX_ZOOM = 2;
/** How much of the overshoot pinch is allowed to show (rubber band). */
const ZOOM_OVERSHOOT = 0.5;
/** Fraction of an over-drag shown while past the pan bounds (rubber band). */
const PAN_OVERSHOOT = 0.35;
/** Hard library cap so pinch overshoot stays bounded. */
const LIB_MAX_ZOOM = MAX_ZOOM * (1 + ZOOM_OVERSHOOT);
/** Pixels of pointer travel that turn a click into a drag. */
const DRAG_THRESHOLD_PX = 6;
/** Tailwind lg breakpoint; above it the side panel replaces the bottom bar. */
const LG_BREAKPOINT_PX = 1024;
/** Screen space reserved for floating chrome, in px: right on lg+, bottom below. */
const CHROME_INSET_LG_PX = 368;
const CHROME_INSET_SM_PX = 80;
/** Height changes smaller than this are ignored — iOS URL bar show/hide. */
const RESIZE_IGNORE_PX = 120;

type PanPoint = { x: number; y: number };

/** Legal pan range keeping the content bounds covering the viewport. */
function clampPan(inst: SvgPanZoom.Instance, pan: PanPoint): PanPoint {
  const sizes = inst.getSizes();
  const vb = sizes.viewBox;
  const rz = sizes.realZoom;
  // Content screen rect: vb.x * rz + pan.x .. (vb.x + vb.width) * rz + pan.x
  const minX = sizes.width - (vb.x + vb.width) * rz;
  const maxX = -vb.x * rz;
  const minY = sizes.height - (vb.y + vb.height) * rz;
  const maxY = -vb.y * rz;
  const axis = (min: number, max: number, v: number) =>
    min <= max ? Math.min(max, Math.max(min, v)) : (min + max) / 2;
  return { x: axis(minX, maxX, pan.x), y: axis(minY, maxY, pan.y) };
}

const easeOutCubic = (k: number) => 1 - Math.pow(1 - k, 3);

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
    let unlocking = false;
    let gesturing = false;
    let hammerManager: HammerManager | null = null;
    let inertiaFrame = 0;
    let settleFrame = 0;
    let zoomSettleFrame = 0;
    const stopMotion = () => {
      if (inertiaFrame) {
        cancelAnimationFrame(inertiaFrame);
        inertiaFrame = 0;
      }
      if (settleFrame) {
        cancelAnimationFrame(settleFrame);
        settleFrame = 0;
      }
      if (zoomSettleFrame) {
        cancelAnimationFrame(zoomSettleFrame);
        zoomSettleFrame = 0;
      }
    };

    inst = svgPanZoom(svg, {
      viewportSelector: viewport,
      fit: true,
      center: true,
      minZoom: 1,
      maxZoom: LIB_MAX_ZOOM,
      zoomScaleSensitivity: 0.3,
      preventMouseEventsDefault: true,
      // getZoom() returns the zoom relative to the fitted state (1 = fit).
      // Panning is refused while fitted so the map stays locked in place;
      // while zoomed, the bounds rubber-band: a fraction of any over-drag is
      // shown, and the pan eases back once the gesture ends.
      beforePan: (_oldPan, newPan) => {
        if (!inst) {
          return true;
        }
        if (!unlocking && inst.getZoom() <= PAN_UNLOCK_ZOOM) {
          return false;
        }
        const clamped = clampPan(inst, newPan);
        return {
          x: clamped.x + (newPan.x - clamped.x) * PAN_OVERSHOOT,
          y: clamped.y + (newPan.y - clamped.y) * PAN_OVERSHOOT,
        };
      },
      // Outside a pinch gesture nothing may zoom past MAX_ZOOM (the library
      // cap is looser to allow rubber-band overshoot); zooming out is free.
      beforeZoom: (_oldScale, newScale) =>
        gesturing || !inst || newScale <= MAX_ZOOM || newScale < inst.getZoom(),
      // Zooming out past the fit snaps back to the centered fitted state,
      // since pan offsets cannot be undone while panning is locked. During a
      // pinch the snap is deferred to pinchend so the gesture isn't jarred.
      onZoom: (newZoom) => {
        if (inst && !unlocking && !gesturing && newZoom <= PAN_UNLOCK_ZOOM) {
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
          let lastCenter: { x: number; y: number } | null = null;
          let pinchEndAt = 0;

          // Ease an out-of-bounds pan back inside — the rubber-band return.
          const settleToBounds = () => {
            if (settleFrame) {
              cancelAnimationFrame(settleFrame);
              settleFrame = 0;
            }
            const start = instance.getPan();
            const target = clampPan(instance, start);
            if (start.x === target.x && start.y === target.y) {
              return;
            }
            const t0 = performance.now();
            const tick = (now: number) => {
              const k = Math.min((now - t0) / 200, 1);
              const e = easeOutCubic(k);
              instance.pan({
                x: start.x + (target.x - start.x) * e,
                y: start.y + (target.y - start.y) * e,
              });
              settleFrame = k < 1 ? requestAnimationFrame(tick) : 0;
            };
            settleFrame = requestAnimationFrame(tick);
          };

          hammerManager = new Hammer(svgElement, {
            inputClass: Hammer.SUPPORT_POINTER_EVENTS
              ? Hammer.PointerEventInput
              : Hammer.TouchInput,
            touchAction: "none",
          });
          hammerManager.get("pinch").set({ enable: true });
          hammerManager.on("doubletap", () => instance.zoomIn());
          hammerManager.on("panstart pinchstart", stopMotion);
          hammerManager.on("panstart panmove", (ev) => {
            if (ev.type === "panstart") {
              pannedX = 0;
              pannedY = 0;
            }
            instance.panBy({ x: ev.deltaX - pannedX, y: ev.deltaY - pannedY });
            pannedX = ev.deltaX;
            pannedY = ev.deltaY;
          });
          // Fling inertia: decay the release velocity until it dies out,
          // then ease back inside if the pan ended past the bounds.
          hammerManager.on("panend", (ev) => {
            const pan = instance.getPan();
            const clamped = clampPan(instance, pan);
            if (pan.x !== clamped.x || pan.y !== clamped.y) {
              settleToBounds();
              return;
            }
            // A pinch release also fires panend; leftover pinch velocity
            // must not fling the map.
            if (performance.now() - pinchEndAt < 50) {
              return;
            }
            let vx = ev.velocityX;
            let vy = ev.velocityY;
            if (Math.hypot(vx, vy) < 0.1) {
              return;
            }
            let last = performance.now();
            const step = (now: number) => {
              const dt = Math.min(now - last, 50);
              last = now;
              instance.panBy({ x: vx * dt, y: vy * dt });
              const after = instance.getPan();
              const damp = Math.exp(-dt * 0.004);
              vx *= damp;
              vy *= damp;
              const legal = clampPan(instance, after);
              const outside = legal.x !== after.x || legal.y !== after.y;
              if (outside || Math.hypot(vx, vy) < 0.02) {
                inertiaFrame = 0;
                settleToBounds();
                return;
              }
              inertiaFrame = requestAnimationFrame(step);
            };
            inertiaFrame = requestAnimationFrame(step);
          });
          hammerManager.on("pinchstart pinchmove", (ev) => {
            if (ev.type === "pinchstart") {
              gesturing = true;
              initialScale = instance.getZoom();
              lastCenter = null;
            }
            const screenCTM = svgElement.getScreenCTM();
            if (!screenCTM) {
              return;
            }
            const point = new DOMPoint(
              ev.center.x,
              ev.center.y,
            ).matrixTransform(screenCTM.inverse());
            // Rubber band at the cap: beyond MAX_ZOOM only a fraction of the
            // requested zoom is applied, so the map keeps responding.
            const requested = initialScale * ev.scale;
            const target =
              requested <= MAX_ZOOM
                ? requested
                : Math.min(
                    MAX_ZOOM + (requested - MAX_ZOOM) * ZOOM_OVERSHOOT,
                    LIB_MAX_ZOOM,
                  );
            instance.zoomAtPoint(target, { x: point.x, y: point.y });
            // Two-finger translate pans the map alongside the zoom.
            if (lastCenter) {
              instance.panBy({
                x: ev.center.x - lastCenter.x,
                y: ev.center.y - lastCenter.y,
              });
            }
            lastCenter = ev.center;
          });
          hammerManager.on("pinchend", () => {
            gesturing = false;
            pinchEndAt = performance.now();
            const zoom = instance.getZoom();
            if (zoom <= PAN_UNLOCK_ZOOM) {
              unlocking = true;
              instance.reset();
              unlocking = false;
              return;
            }
            settleToBounds();
            // Ease an overshot pinch back to the cap.
            if (zoom > MAX_ZOOM) {
              const from = zoom;
              const t0 = performance.now();
              const tick = (now: number) => {
                const k = Math.min((now - t0) / 220, 1);
                instance.zoom(from + (MAX_ZOOM - from) * easeOutCubic(k));
                zoomSettleFrame = k < 1 ? requestAnimationFrame(tick) : 0;
              };
              zoomSettleFrame = requestAnimationFrame(tick);
            }
          });
        },
        destroy: () => {
          stopMotion();
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

      {error && (
        <div className="pointer-events-none absolute left-4 top-4 z-10 rounded bg-white px-3 py-2 text-sm text-red-600 shadow">
          {error}
        </div>
      )}
    </div>
  );
}
