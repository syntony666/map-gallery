import { useEffect, useState } from "react";
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

  // iOS Safari tints the status bar and overscroll areas with the root
  // background — paint it sea blue while this page is mounted.
  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#9ecdda";
    return () => {
      document.body.style.backgroundColor = prev;
    };
  }, []);

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
          action={<ReadonlyToggle label raised size="md" />}
        />
        <DistrictBottomBar
          area={selectedArea}
          onClose={() => selectArea(null)}
          collapsed={regionsOpen}
          actions={<AllRegionsButton onClick={() => setRegionsOpen(true)} />}
          hintActions={<ReadonlyToggle translucent label />}
          overlay={
            <AllRegionsOverlay
              areas={areas}
              selectedAreaId={selectedArea?.id ?? null}
              onSelect={selectArea}
              open={regionsOpen}
              onClose={() => setRegionsOpen(false)}
            />
          }
        />
      </div>
    </main>
  );
}
