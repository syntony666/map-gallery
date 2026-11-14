import { useMemo, useState } from "react";
import type { CollectionPhotoMode, SortOption } from "../types/gallery.type";
import { useAsyncData } from "./useAsyncData";
import { useResetState } from "./useResetState";
import { galleryStore } from "../stores/gallery.store";

export function useAreaState(
  areaId: string,
  initialCollectionId = "",
  collectionPhotoMode: CollectionPhotoMode = null,
) {
  const [keyword, setKeyword] = useState("");
  const [selectedCollectionId, setSelectedCollectionId] =
    useState(initialCollectionId);
  const [sort, setSort] = useState<SortOption>("newest");

  const filterKey = [
    areaId,
    keyword,
    sort,
    selectedCollectionId,
    collectionPhotoMode,
  ].join("|");

  const [page, setPage] = useResetState(1, filterKey);

  const {
    data: result,
    error,
    refresh: refreshPhotos,
  } = useAsyncData(
    () =>
      galleryStore.getPhotos({
        areaId,
        collectionId:
          collectionPhotoMode === "add"
            ? undefined
            : selectedCollectionId || undefined,
        keyword,
        sort,
        page,
      }),
    [areaId, keyword, selectedCollectionId, sort, collectionPhotoMode, page],
  );

  const visiblePhotos = useMemo(
    () =>
      error
        ? null
        : result
          ? collectionPhotoMode === "add" && selectedCollectionId
            ? result.photos.filter(
                (photo) =>
                  !photo.collectionIds.includes(selectedCollectionId),
              )
            : result.photos
          : null,
    [error, result, collectionPhotoMode, selectedCollectionId],
  );

  const pagination = useMemo(
    () =>
      result
        ? { total: result.total, totalPages: result.totalPages }
        : null,
    [result],
  );

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
    photosError: error,
    refreshPhotos,
    page,
    setPage,
    pagination,
  };
}
