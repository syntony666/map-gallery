import { useMemo, useState } from "react";
import type { Photo, SortOption } from "../types/photo.type";

export function useDistrictFilters(photos: Photo[]) {
  const [keyword, setKeyword] = useState("");
  const [collectionName, setCollectionName] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");

  const collectionGroup = useMemo(() => {
    const groups = new Map<string, Photo[]>();

    photos.forEach((photo) => {
      photo.collections?.forEach((collection) => {
        const photos = groups.get(collection) ?? [];

        photos.push(photo);

        groups.set(collection, photos);
      });
    });
    return Array.from(groups, ([collection, photos]) => ({
      name: collection,
      photos,
    })).sort((a, b) =>
      b.photos[0].date.localeCompare(a.photos[0].date, "zh-Hant"),
    );
  }, [photos]);

  const visiblePhotos = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    const filteredPhotos = photos.filter((photo) => {
      const matchesCollection =
        !collectionName || photo.collections?.includes(collectionName);

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
  }, [photos, keyword, collectionName, sort]);

  function toggleCollection(collection: string) {
    setCollectionName((current) => (current === collection ? "" : collection));
  }

  return {
    keyword,
    setKeyword,

    sort,
    setSort,

    collectionName,
    setCollectionName,
    toggleCollection,

    collectionGroup,
    visiblePhotos,
  };
}
