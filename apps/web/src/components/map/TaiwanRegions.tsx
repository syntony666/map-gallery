import { useMemo } from "react";
import type { CSSProperties } from "react";
import type { Area } from "../../types/gallery.type";
import { REGION_COLORS } from "./region-colors";
import type { RegionShapes } from "./regions";

type TaiwanRegionsProps = {
  shapes: RegionShapes;
  areas: Area[] | null;
  selectedAreaId: string | null;
  onSelectArea: (areaId: string | null) => void;
};

export function TaiwanRegions({
  shapes,
  areas,
  selectedAreaId,
  onSelectArea,
}: TaiwanRegionsProps) {
  const areaById = useMemo(
    () => new Map(areas?.map((area) => [area.id, area]) ?? []),
    [areas],
  );

  return (
    <g transform={shapes.transform || undefined}>
      <defs>
        {shapes.regions.map((region) => (
          <clipPath
            key={region.id}
            id={`map-region-clip-${region.id}`}
            clipPathUnits="userSpaceOnUse"
          >
            {region.paths.map((d) => (
              <path key={d} d={d} />
            ))}
          </clipPath>
        ))}
        {shapes.regions
          .filter((region) => region.holes.length > 0)
          .map((region) => (
            <mask
              key={region.id}
              id={`map-region-mask-${region.id}`}
              maskUnits="userSpaceOnUse"
            >
              <rect
                x={-1000}
                y={-1000}
                width={4000}
                height={4000}
                fill="white"
              />
              {region.holes.map((d) => (
                <path key={d} d={d} fill="black" />
              ))}
            </mask>
          ))}
      </defs>
      {shapes.regions.map((region) => {
        const area = areaById.get(region.id);
        const mask =
          region.holes.length > 0
            ? `url(#map-region-mask-${region.id})`
            : undefined;
        const color = REGION_COLORS[region.id];

        return (
          <g
            key={region.id}
            id={region.id}
            style={
              color ? ({ "--region-color": color } as CSSProperties) : undefined
            }
            className={
              selectedAreaId === region.id
                ? "map-region is-active"
                : "map-region"
            }
            role="button"
            tabIndex={0}
            aria-label={area ? `查看${area.name}內容` : `查看${region.id}內容`}
            onClick={(event) => {
              event.stopPropagation();
              onSelectArea(selectedAreaId === region.id ? null : region.id);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelectArea(region.id);
              }
            }}
          >
            <g clipPath={`url(#map-region-clip-${region.id})`}>
              {region.paths.map((d) => (
                <path key={d} d={d} className="map-region__fill" mask={mask} />
              ))}
            </g>
            {[...region.paths, ...region.holes].map((d) => (
              <path key={d} d={d} className="map-region__stroke" mask={mask} />
            ))}
          </g>
        );
      })}
    </g>
  );
}
