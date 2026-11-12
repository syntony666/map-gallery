// UI model types for the web app. These intentionally differ from the API
// DTOs in @map-gallery/shared (e.g. optional instead of `string | null`
// fields, `date` instead of `takenAt`); conversion happens in the mapper
// functions in stores/mappers.ts.

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
  collections: { id: string; name: string }[];
};

export type Area = {
  id: string;
  name: string;
  coverImage?: string;
  coverPhotoId?: string;
  description?: string;
  photoCount: number;
};

export type Collection = {
  id: string;
  name: string;
  coverImage?: string;
  coverPhotoId?: string;
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

export type CollectionPhotoMode = "add" | "remove" | "cover" | null;

export type SortOption = "newest" | "oldest" | "title";
