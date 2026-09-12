export type AreaDataResponse = {
  id: string;
  name: string;
  coverImage: string | null;
  description: string | null;
  photoCount: number;
};

export type AreaListDataResponse = {
  items: AreaDataResponse[];
};
