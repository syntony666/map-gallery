import { useEffect, useState } from "react";
import { Link } from "react-router";
import { galleryStore } from "../../stores/gallery.store";
import type { Area, Photo } from "../../types/gallery.type";
import { DistrictInfo } from "./DistrictInfo";

type DistrictPanelProps = {
  area: Area | null;
};

export function DistrictPanel({ area }: DistrictPanelProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    if (!area) {
      return;
    }

    let cancelled = false;
    galleryStore
      .getPhotos({ areaId: area.id, limit: 6 })
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
      aria-label="地區簡介"
      className="absolute right-6 top-6 bottom-6 z-10 hidden w-80
        overflow-y-auto rounded-2xl bg-white/90 p-5 shadow-lg backdrop-blur
        xl:block"
    >
      <DistrictInfo area={area} />

      {photos.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <Link
              key={photo.id}
              to={`/area/${area?.id}/photo/${photo.id}`}
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
    </aside>
  );
}
