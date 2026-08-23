export type Photo = {
  id: string;
  title: string;
  date: string;
  thumbnail?: string;
  image: string;
  summary?: string;
  description?: string;
  collections?: string[];
};

export type Collection = {
  name: string;
  photos: Photo[];
};

export type SortOption = "newest" | "oldest" | "title";
