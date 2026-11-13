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
            <ReadonlyToggle className="bg-white shadow hover:bg-stone-50" />
          }
        />
        <DistrictBottomBar
          area={selectedArea}
          onClose={() => selectArea(null)}
          collapsed={regionsOpen}
          actions={<AllRegionsButton onClick={() => setRegionsOpen(true)} />}
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
