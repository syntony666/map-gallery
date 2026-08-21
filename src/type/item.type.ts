export type Item = {
  id: string;
  title: string;
  date: string;
  thumbnail?: string;
  image: string;
  summary?: string;
  description?: string;
  collections: string[];
};

export type CollectionGroup = {
  name: string;
  items: Item[];
};

export type SortOption = "newest" | "oldest" | "title";
