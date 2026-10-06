import { useEffect, useState } from "react";
import type {
  CollectionPhotoMode,
  Photo,
  SortOption,
} from "../types/gallery.type";
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
  const [visiblePhotos, setVisiblePhotos] = useState<Photo[] | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pagination, setPagination] = useState<{
    total: number;
    totalPages: number;
  } | null>(null);

  const filterKey = [
    areaId,
    keyword,
    sort,
    selectedCollectionId,
    collectionPhotoMode,
  ].join("|");

  const [pageState, setPageState] = useState({ key: "", page: 1 });
  const page = pageState.key === filterKey ? pageState.page : 1;

  function setPage(nextPage: number) {
    setPageState({ key: filterKey, page: nextPage });
  }

  useEffect(() => {
    let cancelled = false;
    const effectiveCollectionId =
      collectionPhotoMode === "add"
        ? undefined
        : selectedCollectionId || undefined;

    galleryStore
      .getPhotos({
        areaId,
        collectionId: effectiveCollectionId,
        keyword,
        sort,
        page,
      })
      .then((result) => {
        if (cancelled) return;
        setVisiblePhotos(
          collectionPhotoMode === "add" && selectedCollectionId
            ? result.photos.filter(
                (photo) => !photo.collectionIds.includes(selectedCollectionId),
              )
            : result.photos,
        );
        setPagination({
          total: result.total,
          totalPages: result.totalPages,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setVisiblePhotos([]);
        setPagination(null);
      });
    return () => {
      cancelled = true;
    };
  }, [
    areaId,
    keyword,
    selectedCollectionId,
    sort,
    collectionPhotoMode,
    refreshKey,
    page,
  ]);

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
