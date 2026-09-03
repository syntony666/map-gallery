export type Photo = {
  id: string;
  title: string;
  date: string;
  image: string;
  summary?: string;
  description?: string;
  collections?: string[];
};

export type Collection = {
  name: string;
  photos: Photo[];
};

export type CollectionPhotoMode = "add" | "remove" | null;

export type SortOption = "newest" | "oldest" | "title";
