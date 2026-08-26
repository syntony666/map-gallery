import { useMemo, useState } from "react";
import type {
  CollectionPhotoAction,
  Photo,
  SortOption,
} from "../types/photo.type";
import type { PageMode } from "../types/title-bar.type";

export function useDistrictState(
  photos: Photo[],
  isEditMode: boolean,
  initialCollectionName = "",
  collectionPhotoAction: CollectionPhotoAction = null,
) {
  const [keyword, setKeyword] = useState("");
  const [collectionName, setCollectionName] = useState(initialCollectionName);
  const [sort, setSort] = useState<SortOption>("newest");
  const [pageMode, setPageMode] = useState<PageMode>("browse");

  const collectionGroup = useMemo(() => {
    const groups = new Map<string, Photo[]>();

    photos.forEach((photo) => {
      photo.collections?.forEach((collection) => {
        const collectionPhotos = groups.get(collection) ?? [];

        collectionPhotos.push(photo);
        groups.set(collection, collectionPhotos);
      });
    });

    return Array.from(groups, ([name, collectionPhotos]) => ({
      name,
      photos: collectionPhotos,
    })).sort((a, b) =>
      b.photos[0].date.localeCompare(a.photos[0].date, "zh-Hant"),
    );
  }, [photos]);

  const selectedCollection =
    collectionGroup.find((collection) => collection.name === collectionName) ??
    null;

  const visiblePhotos = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    const filteredPhotos = photos.filter((photo) => {
      const isInSelectedCollection =
        photo.collections?.includes(collectionName) ?? false;

      const matchesCollection = (() => {
        if (!collectionName) {
          return true;
        }

        if (collectionPhotoAction === "add") {
          return !isInSelectedCollection;
        }
        return isInSelectedCollection;
      })();

      const searchableText = [photo.title, photo.summary, photo.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesKeyword =
        !normalizedKeyword || searchableText.includes(normalizedKeyword);

      return matchesCollection && matchesKeyword;
    });

    return [...filteredPhotos].sort((a, b) => {
      switch (sort) {
        case "newest":
          return b.date.localeCompare(a.date);

        case "oldest":
          return a.date.localeCompare(b.date);

        case "title":
          return a.title.localeCompare(b.title, "zh-Hant");
      }
    });
  }, [photos, keyword, collectionName, sort, isEditMode]);

  function toggleCollection(collection: string) {
    setCollectionName((current) => (current === collection ? "" : collection));
  }

  return {
    keyword,
    setKeyword,

    sort,
    setSort,

    pageMode,
    setPageMode,

    collectionName,
    setCollectionName,
    toggleCollection,

    selectedCollection,
    collectionGroup,
    visiblePhotos,
  };
}
