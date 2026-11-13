import { Button } from "../common/Button";

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
  return (
    <nav className="flex items-center justify-center gap-4 pt-2">
      <Button
        ghost
        size="md"
        icon="bi-chevron-left"
        label="上一頁"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      />
      <span className="text-sm text-ink-muted">
        第 {page} / {totalPages} 頁
      </span>
      <Button
        ghost
        size="md"
        iconEnd="bi-chevron-right"
        label="下一頁"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      />
    </nav>
  );
}
