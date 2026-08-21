import type { Photo } from "./photo.type";

export type District = {
  id: string;
  coverImage?: string;
  description?: string;
  photos: Photo[];
};
