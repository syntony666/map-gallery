import { useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import type { Area, Photo } from "../../types/gallery.type";
import { Button } from "../common/Button";
import { FloatingCard } from "../common/FloatingCard";
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
    <FloatingCard
      as="aside"
      aria-label="地區"
      className="absolute right-6 top-6 bottom-6 z-10 hidden w-80
        flex-col overflow-hidden p-5 lg:flex"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          {showInfo && (
            <Button
              raised
              icon="bi-arrow-left"
              aria-label="返回清單"
              onClick={() => setView("list")}
            />
          )}
        </div>
        {action}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
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
                    className="img-loading rounded-md"
                  >
                    <img
                      src={photo.image}
                      alt={photo.title}
                      loading="lazy"
                      className="aspect-square w-full object-cover"
                      onError={(event) =>
                        event.currentTarget.parentElement?.classList.add(
                          "img-error",
                        )
                      }
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
      </div>
    </FloatingCard>
  );
}
