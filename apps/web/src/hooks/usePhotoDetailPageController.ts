import { useAsyncData } from "./useAsyncData";
import { galleryStore } from "../stores/gallery.store";

type UsePhotoDetailPageControllerOptions = {
  areaId?: string;
  photoId?: string;
};

export function usePhotoDetailPageController({
  areaId,
  photoId,
}: UsePhotoDetailPageControllerOptions) {
  const { data, error } = useAsyncData(
    () => {
      if (!photoId || !areaId) {
        return Promise.resolve(null);
      }

      return Promise.all([
        galleryStore.getPhotoById(photoId),
        galleryStore.getAreaById(areaId),
      ]).then(([photo, area]) => {
        if (photo.areaId !== areaId) {
          throw new Error("照片不屬於此行政區");
        }
        return { photo, area };
      });
    },
    [photoId, areaId],
    { errorMessage: "無法載入照片或地區資料" },
  );

  return {
    photo: data?.photo ?? null,
    area: data?.area ?? null,
    error,
  };
}
