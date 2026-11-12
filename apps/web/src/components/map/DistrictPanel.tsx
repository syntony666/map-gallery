import { useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import type { Area, Photo } from "../../types/gallery.type";
import { DistrictInfo } from "./DistrictInfo";
import { RegionList } from "./RegionList";

type DistrictPanelProps = {
  area: Area | null;
  areas: Area[] | null;
  photos: Photo[];
  action?: ReactNode;
  onSelect: (areaId: string) => void;
};

export function DistrictPanel({
  area,
  areas,
  photos,
  action,
  onSelect,
}: DistrictPanelProps) {
  const [view, setView] = useState<"list" | "info">("list");
  const [viewedAreaId, setViewedAreaId] = useState<string | null>(null);

  // Reset to the info view whenever the selected region changes (map or list);
  // the back button only switches views and keeps the selection.
  const areaId = area?.id ?? null;
  if (areaId !== viewedAreaId) {
    setViewedAreaId(areaId);
    setView(areaId ? "info" : "list");
  }

  const showInfo = view === "info" && area !== null;

  return (
    <aside
      aria-label="地區"
      className="absolute right-6 top-6 bottom-6 z-10 hidden w-80
        overflow-y-auto rounded-2xl bg-white/90 p-5 shadow-lg backdrop-blur
        lg:block"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          {showInfo && (
            <button
              type="button"
              onClick={() => setView("list")}
              aria-label="返回清單"
              className="rounded bg-white px-2 py-1 text-stone-700 shadow
                hover:bg-stone-50"
            >
              <i className="bi bi-arrow-left" />
            </button>
          )}
        </div>
        {action}
      </div>

      {showInfo ? (
        <>
          <DistrictInfo area={area} />

          {photos.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {photos.map((photo) => (
                <Link
                  key={photo.id}
                  to={`/area/${area.id}/photo/${photo.id}`}
                  title={photo.title}
                >
                  <img
                    src={photo.image}
                    alt={photo.title}
                    loading="lazy"
                    className="aspect-square w-full rounded-md object-cover"
                  />
                </Link>
              ))}
            </div>
          )}
        </>
      ) : (
        <RegionList
          areas={areas}
          selectedAreaId={area?.id}
          onSelect={(id) => {
            onSelect(id);
            setView("info");
          }}
        />
      )}
    </aside>
  );
}
