import type { SortOption } from "../../types/gallery.type";
import { toolbarInputClassName } from "../../utils/field-classes";

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
    <div className="flex min-w-40 flex-1 items-center gap-3">
      <input
        type="search"
        aria-label="搜尋景點或照片"
        value={keyword}
        onChange={(event) => onKeywordChange(event.target.value)}
        placeholder="搜尋景點或照片"
        className={`min-w-0 flex-1 ${toolbarInputClassName} text-base`}
      />

      <select
        aria-label="排序方式"
        value={sort}
        onChange={(event) => onSortChange(event.target.value as SortOption)}
        className={`${toolbarInputClassName} text-sm`}
      >
        <option value="newest">最新</option>
        <option value="oldest">最舊</option>
        <option value="title">名稱</option>
      </select>
    </div>
  );
}
