import type { SortOption } from "../../types/gallery.type";

type PhotoToolbarProps = {
  keyword: string;
  sort: SortOption;
  onKeywordChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
};

export function AreaToolbar({
  keyword,
  sort,
  onKeywordChange,
  onSortChange,
}: PhotoToolbarProps) {
  return (
    <section className="glass flex flex-wrap items-center gap-3 rounded-md p-2 shadow-sm">
      <input
        type="search"
        value={keyword}
        onChange={(event) => onKeywordChange(event.target.value)}
        placeholder="搜尋景點或照片"
        className="min-w-0 flex-1 rounded border border-line/75 bg-page/60 px-3 py-2 text-sm"
      />

      <select
        value={sort}
        onChange={(event) => onSortChange(event.target.value as SortOption)}
        className="rounded border border-line/75 bg-page/60 px-3 py-2 text-sm"
      >
        <option value="newest">最新</option>
        <option value="oldest">最舊</option>
        <option value="title">名稱</option>
      </select>
    </section>
  );
}
