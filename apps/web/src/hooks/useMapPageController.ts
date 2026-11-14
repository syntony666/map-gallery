import { useState } from "react";
import { useAsyncData } from "./useAsyncData";
import { galleryStore } from "../stores/gallery.store";

export function useMapPageController() {
  const { data: areas, error: areasError } = useAsyncData(
    () => galleryStore.getAreas(),
    [],
  );
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  const selectedArea =
    areas?.find((area) => area.id === selectedAreaId) ?? null;

  const { data: photos, error: photosError } = useAsyncData(
    () =>
      selectedArea
        ? galleryStore
            .getPhotos({ areaId: selectedArea.id, limit: 12 })
            .then((result) => result.photos)
        : Promise.resolve([]),
    [selectedArea?.id],
  );

  return {
    areas,
    areasError,
    selectedArea,
    selectArea: setSelectedAreaId,
    photos: photos ?? [],
    photosError,
  };
}
