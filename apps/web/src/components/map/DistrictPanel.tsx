import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { galleryStore } from "../../stores/gallery.store";
import type { Area, Photo } from "../../types/gallery.type";
import { DistrictInfo } from "./DistrictInfo";
import { regionSortKey } from "./regions";

type DistrictPanelProps = {
  area: Area | null;
  areas: Area[] | null;
  action?: ReactNode;
  onClose: () => void;
  onSelect: (areaId: string) => void;
};

export function DistrictPanel({
  area,
  areas,
  action,
  onClose,
  onSelect,
}: DistrictPanelProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    if (!area) {
      return;
    }

    let cancelled = false;
    galleryStore
      .getPhotos({ areaId: area.id, limit: 12 })
      .then((result) => {
        if (!cancelled) {
          setPhotos(result.photos);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPhotos([]);
        }
      });

    return () => {
      cancelled = true;
      setPhotos([]);
    };
  }, [area]);

  return (
    <aside
      aria-label="地區"
      className="absolute right-6 top-6 bottom-6 z-10 hidden w-80
        overflow-y-auto rounded-2xl bg-white/90 p-5 shadow-lg backdrop-blur
        lg:block"
    >
      <div className="mb-4 flex items-center justify-end gap-2">
        {action}
        {area && (
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉簡介"
            className="rounded bg-white px-2 py-1 text-stone-700 shadow
              hover:bg-stone-50"
          >
            <i className="bi bi-x-lg" />
          </button>
        )}
      </div>

      {area === null ? (
        <>
          <h2 className="mb-2 text-sm font-semibold text-stone-800">
            所有地區
          </h2>
          <ul className="divide-y divide-stone-200/60">
            {[...(areas ?? [])]
              .sort((a, b) => regionSortKey(a.id) - regionSortKey(b.id))
              .map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(item.id)}
                    className="flex w-full items-center justify-between rounded
                    px-2 py-2 text-left text-sm text-stone-700
                    hover:bg-stone-100/80"
                  >
                    <span>{item.name}</span>
                    <span className="text-xs text-stone-400">
                      {item.photoCount} 張
                    </span>
                  </button>
                </li>
              ))}
          </ul>
        </>
      ) : (
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
      )}
    </aside>
  );
}
