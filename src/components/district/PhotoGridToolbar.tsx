import type { ButtonConfig } from "../../types/button.type";
import { Button } from "../common/Button";

export type PhotoGridToolbarAction = {
  onAddPhoto: () => void;
  onDeletePhoto: () => void;
};

type PhotoGridToolbarProps = {
  photoCount: number;
  showActions: boolean;
  action: PhotoGridToolbarAction;
};

export function PhotoGridToolbar({
  photoCount,
  showActions,
  action,
}: PhotoGridToolbarProps) {
  const buttons: ButtonConfig[] = showActions
    ? [
        {
          id: "photo-add",
          label: "",
          icon: "bi-plus-lg",
          onClick: action.onAddPhoto,
        },
        {
          id: "photo-delete",
          label: "",
          icon: "bi-trash3",
          onClick: action.onDeletePhoto,
        },
      ]
    : [];
  return (
    <section className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold">所有相片</span>

        {buttons.length > 0 &&
          buttons.map((button) => <Button key={button.id} button={button} />)}
      </div>
      <span className="text-sm text-stone-500">{photoCount} 個項目</span>
    </section>
  );
}
