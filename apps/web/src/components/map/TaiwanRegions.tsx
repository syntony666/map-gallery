import { useMemo } from "react";
import type { Area } from "../../types/gallery.type";
import type { RegionShapes } from "./regions";

type TaiwanRegionsProps = {
  shapes: RegionShapes;
  areas: Area[] | null;
  selectedAreaId: string | null;
  onSelectArea: (areaId: string) => void;
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
      {shapes.regions.map((region) => {
        const area = areaById.get(region.id);
        const isActive = selectedAreaId === region.id;

        return (
          <g
            key={region.id}
            id={region.id}
            className={isActive ? "map-region is-active" : "map-region"}
            role="button"
            tabIndex={0}
            aria-label={
              area ? `查看${area.name}內容` : `查看${region.id}內容`
            }
            onClick={() => onSelectArea(region.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelectArea(region.id);
              }
            }}
          >
            {region.paths.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
        );
      })}
    </g>
  );
}
