import type { Area } from "../../types/gallery.type";
import { regionSortKey } from "./regions";

type RegionListProps = {
  areas: Area[] | null;
  selectedAreaId?: string | null;
  onSelect: (areaId: string) => void;
};

export function RegionList({
  areas,
  selectedAreaId,
  onSelect,
}: RegionListProps) {
  return (
    <>
      <h2 className="mb-2 text-sm font-semibold text-stone-800">所有地區</h2>
      <ul className="divide-y divide-stone-200/60">
        {[...(areas ?? [])]
          .sort((a, b) => regionSortKey(a.id) - regionSortKey(b.id))
          .map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                className={[
                  "flex w-full items-center justify-between rounded px-2",
                  "py-2 text-left text-sm",
                  item.id === selectedAreaId
                    ? "bg-stone-200/70 font-medium text-stone-800"
                    : "text-stone-700 hover:bg-stone-100/80",
                ].join(" ")}
              >
                <span>{item.name}</span>
                <span className="text-xs text-stone-400">
                  {item.photoCount} 張
                </span>
              </button>
            </li>
          ))}
      </ul>
    </>
  );
}
