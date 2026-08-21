import { useMemo, useState } from "react";
import type { Item, SortOption } from "../type/item.type";

export function useDistrictFilters(items: Item[]) {

  const [keyword, setKeyword] = useState("");
  const [collectionName, setCollectionName] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");

  const collections = useMemo(() => {
    const groups = new Map<string, Item[]>();

    items.forEach((item) => {
      item.collections?.forEach((collection) => {
        const items = groups.get(collection) ?? [];

        items.push(item);

        groups.set(collection, items);
      });
    });
    return Array.from(groups, ([collection, items]) => ({
      name: collection,
      items,
    })).sort((a, b) =>
      b.items[0].date.localeCompare(a.items[0].date, "zh-Hant"),
    );
  }, [items]);

  const visibleItems = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    const filteredItems = items.filter((item) => {
      const matchesCollection =
        !collectionName || item.collections?.includes(collectionName);

      const searchableText = [item.title, item.summary, item.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesKeyword =
        !normalizedKeyword || searchableText.includes(normalizedKeyword);

      return matchesCollection && matchesKeyword;
    });

    return [...filteredItems].sort((a, b) => {
      switch (sort) {
        case "newest":
          return b.date.localeCompare(a.date);

        case "oldest":
          return a.date.localeCompare(b.date);

        case "title":
          return a.title.localeCompare(b.title, "zh-Hant");
      }
    });
  }, [items, keyword, collectionName, sort]);

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

    collections,
    visibleItems,
  };
}
