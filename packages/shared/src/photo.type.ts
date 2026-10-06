export type PhotoListItemDataResponse = {
  id: string;
  areaId: string;
  title: string;
  summary: string | null;
  image: string;
  takenAt: string;
  createdAt: string;
  updatedAt: string;
  collectionIds: string[];
};

export type PhotoCollectionSummary = {
  id: string;
  name: string;
};

export type PhotoDataResponse = Omit<
  PhotoListItemDataResponse,
  "collectionIds"
> & {
  description: string | null;
  collections: PhotoCollectionSummary[];
};

export type PhotoListPaginationDataResponse = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PhotoListDataResponse = {
  items: PhotoListItemDataResponse[];
  pagination: PhotoListPaginationDataResponse;
};

export type BatchDeletePhotosRequest = {
  photoIds: string[];
};
