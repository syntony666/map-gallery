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
