import type { Item } from "./item.type";

export type District = {
  districtId: string;
  coverImage?: string;
  description?: string;
  items: Item[];
};
