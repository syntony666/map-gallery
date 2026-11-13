import { useState } from "react";
import { ReadonlyToggle } from "../components/common/ReadonlyToggle";
import {
  AllRegionsButton,
  AllRegionsOverlay,
} from "../components/map/AllRegionsMenu";
import { DistrictBottomBar } from "../components/map/DistrictBottomBar";
import { DistrictPanel } from "../components/map/DistrictPanel";
import { TaiwanMap } from "../components/map/TaiwanMap";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useMapPageController } from "../hooks/useMapPageController";

export function HomePage() {
  const { areas, selectedArea, selectArea, photos } = useMapPageController();
  const [regionsOpen, setRegionsOpen] = useState(false);

  useDocumentTitle(null);

  return (
    <main className="map-page">
      <div className="relative h-full">
        <TaiwanMap
          areas={areas}
          selectedAreaId={selectedArea?.id ?? null}
          onSelectArea={selectArea}
        />
        <DistrictPanel
          area={selectedArea}
          areas={areas}
          photos={photos}
          onSelect={selectArea}
          action={
            <ReadonlyToggle
              label
              className="bg-white px-2 py-1 text-sm shadow hover:bg-stone-50"
            />
          }
        />
        <DistrictBottomBar
          area={selectedArea}
          onClose={() => selectArea(null)}
          collapsed={regionsOpen}
          actions={<AllRegionsButton onClick={() => setRegionsOpen(true)} />}
          hintActions={
            <ReadonlyToggle
              label
              className="px-1 py-1 text-xs text-stone-400
                hover:text-stone-600"
            />
          }
        />
        <AllRegionsOverlay
          areas={areas}
          selectedAreaId={selectedArea?.id ?? null}
          onSelect={selectArea}
          open={regionsOpen}
          onClose={() => setRegionsOpen(false)}
        />
      </div>
    </main>
  );
}
