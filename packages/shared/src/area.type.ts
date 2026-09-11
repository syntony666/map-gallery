export type AreaDataResponse = {
  id: string;
  name: string;
  coverImage: string | null;
  description: string | null;
};

export type AreaListDataResponse = {
  items: AreaDataResponse[];
};
