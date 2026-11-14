import type { ReactNode } from "react";
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
  /** Browse-mode controls (search/sort) merged into this bar. */
  filters?: ReactNode;
};

export function PhotoGridToolbar({
  title = "所有相片",
  hint,
  photoCount,
  showActions,
  action,
  filters,
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
      <div className="flex flex-wrap items-center gap-3 max-lg:glass-thin max-lg:rounded-md max-lg:p-2 max-lg:shadow-sm">
        <span className="px-1 text-lg font-semibold">{title}</span>

        {buttons.length > 0 && (
          <div className="hidden items-center gap-2 lg:flex">
            {buttons.map((button) => (
              <Button key={button.id} size="md" {...button} />
            ))}
          </div>
        )}

        {filters}

        <span className="ml-auto px-1 text-sm text-ink-muted">
          {photoCount} 個項目
        </span>
      </div>

      {hint && <p className="mt-1 px-1 text-xs text-ink-muted">{hint}</p>}
    </section>
  );
}
