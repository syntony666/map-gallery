import { useEffect, useState } from "react";
import { ReadonlyToggle } from "../components/common/ReadonlyToggle";
import { DistrictBottomBar } from "../components/map/DistrictBottomBar";
import { DistrictPanel } from "../components/map/DistrictPanel";
import { TaiwanMap } from "../components/map/TaiwanMap";
import { galleryStore } from "../stores/gallery.store";
import type { Area } from "../types/gallery.type";

export function HomePage() {
  const [areas, setAreas] = useState<Area[] | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    galleryStore
      .getAreas()
      .then((areaList) => {
        if (!cancelled) {
          setAreas(areaList);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAreas([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedArea =
    areas?.find((area) => area.id === selectedAreaId) ?? null;

  return (
    <main className="map-page">
      <div className="relative h-full">
        <TaiwanMap
          areas={areas}
          selectedAreaId={selectedAreaId}
          onSelectArea={setSelectedAreaId}
        />
        <DistrictPanel
          area={selectedArea}
          areas={areas}
          onSelect={setSelectedAreaId}
          action={<ReadonlyToggle />}
        />
        <DistrictBottomBar
          area={selectedArea}
          onClose={() => setSelectedAreaId(null)}
        />
        <ReadonlyToggle
          className={[
            "absolute right-8 top-8 z-10 hidden",
            selectedArea ? "md:max-lg:block" : "sm:block lg:hidden",
          ].join(" ")}
        />
      </div>
    </main>
  );
}
