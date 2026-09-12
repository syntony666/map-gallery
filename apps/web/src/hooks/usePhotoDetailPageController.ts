import { useEffect, useState } from "react";
import { galleryStore } from "../stores/gallery.store";
import type { Area, PhotoDetail } from "../types/gallery.type";

type UsePhotoDetailPageControllerOptions = {
  areaId?: string;
  photoId?: string;
};

export function usePhotoDetailPageController({
  areaId,
  photoId,
}: UsePhotoDetailPageControllerOptions) {
  const [sourcePhoto, setSourcePhoto] = useState<PhotoDetail | null>(null);
  const [sourceArea, setSourceArea] = useState<Area | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    if (!photoId || !areaId) return () => (cancelled = true);

    Promise.all([
      galleryStore.getPhotoById(photoId),
      galleryStore.getAreaById(areaId),
    ])
      .then(([photo, area]) => {
        if (cancelled) return;
        setSourcePhoto(photo);
        setSourceArea(area);
      })
      .catch((reason: unknown) => {
        if (cancelled) return;

        setError(
          reason instanceof Error ? reason.message : "無法載入照片或地區資料",
        );
      });
    return () => {
      cancelled = true;
    };
  }, [photoId, areaId]);
  return {
    photo: sourcePhoto,
    area: sourceArea,
    error,
  };
}
