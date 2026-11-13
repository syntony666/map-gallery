import type { Area } from "../../types/gallery.type";
import type { MenuRow } from "../../types/menu.type";
import { regionSortKey } from "./regions";

/** Region rows for `MenuList`, sorted by region order. */
export function regionRows(
  areas: Area[] | null,
  selectedAreaId?: string | null,
  onSelect?: (areaId: string) => void,
): MenuRow[] {
  return [...(areas ?? [])]
    .sort((a, b) => regionSortKey(a.id) - regionSortKey(b.id))
    .map((item) => ({
      id: item.id,
      label: item.name,
      meta: `${item.photoCount} 張`,
      selected: item.id === selectedAreaId,
      onClick: onSelect ? () => onSelect(item.id) : undefined,
    }));
}
