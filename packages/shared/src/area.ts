export type Area = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  isEnabled: boolean;
  canCreateContent: boolean;
};

export type AreaContent = {
  areaId: string;
  coverImage: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AreaDetail = {
  area: Area;
  content: AreaContent | null;
};
