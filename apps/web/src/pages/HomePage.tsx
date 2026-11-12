import { useState } from "react";
import { ReadonlyToggle } from "../components/common/ReadonlyToggle";
import { DistrictBottomBar } from "../components/map/DistrictBottomBar";
import { DistrictPanel } from "../components/map/DistrictPanel";
import { TaiwanMap } from "../components/map/TaiwanMap";
import { useAsyncData } from "../hooks/useAsyncData";
import { galleryStore } from "../stores/gallery.store";

export function HomePage() {
  const { data: areas } = useAsyncData(() => galleryStore.getAreas(), []);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

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
