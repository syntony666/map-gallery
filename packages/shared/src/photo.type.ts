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

export type PhotoDataResponse = PhotoListItemDataResponse & {
  description: string | null;
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
