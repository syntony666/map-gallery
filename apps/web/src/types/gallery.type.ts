export type Photo = {
  id: string;
  title: string;
  date: string;
  image: string;
  summary?: string;
  description?: string;
  collectionIds: string[];
};

export type PhotoDetail = Photo & {
  areaId: string;
};

export type Area = {
  id: string;
  name: string;
  coverImage?: string;
  description?: string;
  photoCount: number;
};

export type Collection = {
  id: string;
  name: string;
  coverImage?: string;
  photoCount: number;
};

export type GetPhotosQuery = {
  areaId?: string;
  collectionId?: string;
  keyword?: string;
  sort?: SortOption;
  page?: number;
  limit?: number;
};

export type GetCollectionsQuery = {
  areaId: string;
};

export type CollectionPhotoMode = "add" | "remove" | null;

export type SortOption = "newest" | "oldest" | "title";
