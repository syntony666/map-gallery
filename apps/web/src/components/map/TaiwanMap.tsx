import { useEffect, useRef, useState } from "react";
import { galleryStore } from "../../stores/gallery.store";
import type { Area } from "../../types/gallery.type";
import { parseRegionsSvg, type RegionShapes } from "./regions";
import { TaiwanRegions } from "./TaiwanRegions";

type TaiwanMapProps = {
  selectedAreaId: string | null;
  onSelectArea: (areaId: string | null) => void;
};

export function TaiwanMap({ selectedAreaId, onSelectArea }: TaiwanMapProps) {
  const [areas, setAreas] = useState<Area[] | null>(null);
  const [shapes, setShapes] = useState<RegionShapes | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      galleryStore.getAreas(),
      fetch("/maps/taiwan-regions.svg").then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.text();
      }),
    ])
      .then(([areaList, svgText]) => {
        if (cancelled) {
          return;
        }
        setAreas(areaList);
        setShapes(parseRegionsSvg(svgText));
      })
      .catch((reason: unknown) => {
        if (cancelled) {
          return;
        }
        setError(
          reason instanceof Error ? reason.message : "無法載入地圖資料",
        );
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!shapes) {
      return;
    }

    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }

    const center = () => {
      scroller.scrollLeft = Math.max(
        0,
        (scroller.scrollWidth - scroller.clientWidth) / 2,
      );
    };

    center();
    const frame = requestAnimationFrame(center);
    return () => cancelAnimationFrame(frame);
  }, [shapes]);

  return (
    <div className="map-viewport">
      <div className="map-scroller" ref={scrollerRef}>
        <div className="map-canvas">
          <svg
            className="map-canvas__underlay"
            viewBox="0 0 1600 1600"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            {shapes && (
              <g transform={shapes.transform || undefined}>
                <defs>
                  <clipPath
                    id="map-land-clip"
                    clipPathUnits="userSpaceOnUse"
                  >
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
          <img
            className="map-canvas__land"
            src="/maps/taiwan-land.png"
            alt="台灣行政區地圖"
            width={1600}
            height={1600}
            draggable={false}
          />
          <svg
            className="map-canvas__overlay"
            viewBox="0 0 1600 1600"
            preserveAspectRatio="xMidYMid meet"
            role="group"
            aria-label="選擇行政區"
          >
            {shapes && (
              <TaiwanRegions
                shapes={shapes}
                areas={areas}
                selectedAreaId={selectedAreaId}
                onSelectArea={onSelectArea}
              />
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
