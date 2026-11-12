import { useEffect, useState } from "react";
import { DistrictBottomSheet } from "../components/map/DistrictBottomSheet";
import { DistrictPanel } from "../components/map/DistrictPanel";
import { TaiwanMap } from "../components/map/TaiwanMap";
import { useViewMode } from "../hooks/useViewMode";
import { galleryStore } from "../stores/gallery.store";
import type { Area } from "../types/gallery.type";

export function HomePage() {
  const { readonly, toggleReadonly } = useViewMode();
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
          onClose={() => setSelectedAreaId(null)}
          action={
            <button
              type="button"
              onClick={toggleReadonly}
              title={readonly ? "離開閱覽模式" : "閱覽模式"}
              className="rounded bg-white px-2 py-1 text-stone-700 shadow
                hover:bg-stone-50"
            >
              <i className={`bi ${readonly ? "bi-eye-slash" : "bi-eye"}`} />
            </button>
          }
        />
        <DistrictBottomSheet
          area={selectedArea}
          onClose={() => setSelectedAreaId(null)}
        />
        {selectedArea === null && (
          <button
            type="button"
            onClick={toggleReadonly}
            title={readonly ? "離開閱覽模式" : "閱覽模式"}
            className="absolute right-8 top-8 z-10 hidden rounded bg-white px-2
              py-1 text-stone-700 shadow hover:bg-stone-50 sm:block xl:hidden"
          >
            <i className={`bi ${readonly ? "bi-eye-slash" : "bi-eye"}`} />
          </button>
        )}
      </div>
    </main>
  );
}
