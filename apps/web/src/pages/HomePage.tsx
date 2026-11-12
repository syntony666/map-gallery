import { ReadonlyToggle } from "../components/common/ReadonlyToggle";
import { DistrictBottomBar } from "../components/map/DistrictBottomBar";
import { DistrictPanel } from "../components/map/DistrictPanel";
import { TaiwanMap } from "../components/map/TaiwanMap";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useMapPageController } from "../hooks/useMapPageController";

export function HomePage() {
  const { areas, selectedArea, selectArea, photos } = useMapPageController();

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
          action={<ReadonlyToggle />}
        />
        <DistrictBottomBar
          area={selectedArea}
          onClose={() => selectArea(null)}
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
