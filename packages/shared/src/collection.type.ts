export type CollectionDataResponse = {
  id: string;
  areaId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type CollectionListDataResponse = {
  items: CollectionDataResponse[];
};
