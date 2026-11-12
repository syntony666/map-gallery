import { useState } from "react";
import { useAsyncData } from "./useAsyncData";
import { galleryStore } from "../stores/gallery.store";

export function useMapPageController() {
  const { data: areas } = useAsyncData(() => galleryStore.getAreas(), []);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  const selectedArea =
    areas?.find((area) => area.id === selectedAreaId) ?? null;

  const { data: photos } = useAsyncData(
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
    selectedArea,
    selectArea: setSelectedAreaId,
    photos: photos ?? [],
  };
}
