import type { SortOption } from "../../types/photo.type";

type PhotoToolbarProps = {
  keyword: string;
  sort: SortOption;
  onKeywordChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
};

export function DistrictToolbar({
  keyword,
  sort,
  onKeywordChange,
  onSortChange,
}: PhotoToolbarProps) {
  return (
    <section className="flex flex-wrap item-center border-y border-stone-200 gap-3 py-4">
      <input
        type="search"
        value={keyword}
        onChange={(event) => onKeywordChange(event.target.value)}
        placeholder="搜尋景點或照片"
        className="min-w-0 flex-1 rounded border px-3 py-2 text-sm border-stone-400"
      />

      <select
        value={sort}
        onChange={(event) => onSortChange(event.target.value as SortOption)}
        className="rounded border px-3 py-2 text-sm border-stone-400"
      >
        <option value="newest">最新</option>
        <option value="oldest">最舊</option>
        <option value="title">名稱 A–Z</option>
      </select>
    </section>
  );
}
