export type CollectionDataResponse = {
  id: string;
  areaId: string;
  name: string;
  coverImage: string | null;
  photoCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CollectionListDataResponse = {
  items: CollectionDataResponse[];
};

export type CreateCollectionRequest = { areaId: string; name: string };
export type UpdateCollectionRequest = { name: string };
