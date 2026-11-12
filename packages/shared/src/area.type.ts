export type AreaDataResponse = {
  id: string;
  name: string;
  coverImage: string | null;
  coverPhotoId: string | null;
  description: string | null;
  photoCount: number;
};

export type AreaListDataResponse = {
  items: AreaDataResponse[];
};

export type UpdateAreaContentRequest = {
  coverPhotoId?: string | null;
  description?: string | null;
};
