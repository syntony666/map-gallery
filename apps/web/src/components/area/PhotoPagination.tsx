type PhotoPaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function PhotoPagination({
  page,
  totalPages,
  onPageChange,
}: PhotoPaginationProps) {
  const buttonClassName =
    "flex items-center gap-1 rounded px-2 py-1 text-sm text-stone-600 hover:bg-stone-200 disabled:text-stone-300 disabled:hover:bg-transparent";

  return (
    <nav className="flex items-center justify-center gap-4 pt-2">
      <button
        type="button"
        className={buttonClassName}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <i className="bi bi-chevron-left" />
        上一頁
      </button>
      <span className="text-sm text-stone-500">
        第 {page} / {totalPages} 頁
      </span>
      <button
        type="button"
        className={buttonClassName}
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        下一頁
        <i className="bi bi-chevron-right" />
      </button>
    </nav>
  );
}
