import type { SortOption } from "../type/item.type";

type ItemToolbarProps = {
  keyword: string;
  sort: SortOption;
  onKeywordChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
};

export function DistrictToolbarComponent({
  keyword,
  sort,
  onKeywordChange,
  onSortChange,
}: ItemToolbarProps) {
  return (
    <section className="flex flex-wrap items-center border-y border-stone-200 gap-3 py-4">
      <input
        type="search"
        value={keyword}
        onChange={(event) => onKeywordChange(event.target.value)}
        placeholder="搜尋景點或照片"
        className="min-w-0 flex-1 rounded border px-3 py-2 text-sm"
      />

      <select
        value={sort}
        onChange={(event) => onSortChange(event.target.value as SortOption)}
        className="rounded border px-3 py-2 text-sm"
      >
        <option value="newest">最新</option>
        <option value="oldest">最舊</option>
        <option value="title">名稱 A–Z</option>
      </select>
    </section>
  );
}
