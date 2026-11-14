import type { ButtonConfig } from "../../types/button.type";
import { Button } from "../common/Button";

export type PhotoGridToolbarAction = {
  onAddPhoto: () => void;
  onDeletePhoto?: () => void;
};

type PhotoGridToolbarProps = {
  title?: string;
  hint?: string;
  photoCount: number;
  showActions: boolean;
  action: PhotoGridToolbarAction;
};

export function PhotoGridToolbar({
  title = "所有相片",
  hint,
  photoCount,
  showActions,
  action,
}: PhotoGridToolbarProps) {
  const buttons: ButtonConfig[] = showActions
    ? [
        {
          id: "photo-add",
          label: "新增照片",
          icon: "bi-plus-lg",
          iconOnly: true,
          onClick: action.onAddPhoto,
        },
        ...(action.onDeletePhoto
          ? [
              {
                id: "photo-delete",
                label: "刪除照片",
                icon: "bi-trash3",
                iconOnly: true,
                onClick: action.onDeletePhoto,
              } satisfies ButtonConfig,
            ]
          : []),
      ]
    : [];
  return (
    <section>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">{title}</span>

          <div className="hidden items-center gap-2 lg:flex">
            {buttons.map((button) => (
              <Button key={button.id} size="md" {...button} />
            ))}
          </div>
        </div>
        <span className="text-sm text-ink-muted">{photoCount} 個項目</span>
      </div>

      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </section>
  );
}
