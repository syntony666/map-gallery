import { useState } from "react";
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
  const [refreshKey, setRefreshKey] = useState(0);

  const filterKey = [
    areaId,
    keyword,
    sort,
    selectedCollectionId,
    collectionPhotoMode,
  ].join("|");

  const [page, setPage] = useResetState(1, filterKey);

  const { data: result, error } = useAsyncData(
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
    [
      areaId,
      keyword,
      selectedCollectionId,
      sort,
      collectionPhotoMode,
      refreshKey,
      page,
    ],
  );

  const visiblePhotos = error
    ? []
    : result
      ? collectionPhotoMode === "add" && selectedCollectionId
        ? result.photos.filter(
            (photo) => !photo.collectionIds.includes(selectedCollectionId),
          )
        : result.photos
      : null;

  const pagination = result
    ? { total: result.total, totalPages: result.totalPages }
    : null;

  function toggleCollection(collection: string) {
    setSelectedCollectionId((current) =>
      current === collection ? "" : collection,
    );
  }

  function refreshPhotos() {
    setRefreshKey((key) => key + 1);
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
    refreshPhotos,
    page,
    setPage,
    pagination,
  };
}
