import { useEffect, useState } from "react";
import type {
  CollectionPhotoMode,
  Photo,
  SortOption,
} from "../types/gallery.type";
import { galleryStore } from "../stores/gallery.store";

export function useDistrictState(
  areaId: string,
  initialCollectionId = "",
  collectionPhotoMode: CollectionPhotoMode = null,
) {
  const [keyword, setKeyword] = useState("");
  const [selectedCollectionId, setSelectedCollectionId] =
    useState(initialCollectionId);
  const [sort, setSort] = useState<SortOption>("newest");
  const [visiblePhotos, setVisiblePhotos] = useState<Photo[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    galleryStore
      .getPhotos({ areaId, keyword, sort })
      .then((result) => {
        if (cancelled) {
          return;
        }
        setVisiblePhotos(
          result.photos.filter((photo) => {
            const isInSelectedCollection =
              photo.collectionIds.includes(selectedCollectionId) ?? false;
            if (!selectedCollectionId) {
              return true;
            }

            if (collectionPhotoMode === "add") {
              return !isInSelectedCollection;
            }
            return isInSelectedCollection;
          }),
        );
      })
      .catch(() => {
        if (cancelled) return;
        setVisiblePhotos([]);
      });
    return () => {
      cancelled = true;
    };
  }, [areaId, keyword, selectedCollectionId, sort, collectionPhotoMode]);

  function toggleCollection(collection: string) {
    setSelectedCollectionId((current) =>
      current === collection ? "" : collection,
    );
  }

  return {
    keyword,
    setKeyword,
    sort,
    setSort,
    selectedCollectionId,
    setSelectedCollectionId,
    toggleCollection,
    visiblePhotos,
  };
}
