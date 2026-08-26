import { Button } from "../common/Button";

type PhotoSelectionToolbarProps = {
  selectedCount: number;
  onClearSelection: () => void;
};

export function PhotoSelectionToolbar({
  selectedCount,
  onClearSelection,
}: PhotoSelectionToolbarProps) {
  return (
    <section className="flex flex-wrap items-center justify-between gap-3 py-3 border-y border-stone-400">
      <p className="text-sm text-stone-500">
        已選取：
        <span className="ml-1 font-medium text-stone-700">
          {selectedCount} 張照片
        </span>
      </p>

      <Button
        button={{
          id: "clear-photo-selection",
          label: "取消選取",
          icon: "bi-x-lg text-red-700",
          onClick: onClearSelection,
        }}
      />
    </section>
  );
}
