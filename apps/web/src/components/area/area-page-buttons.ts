import type { TitleBarActions } from "../../hooks/useAreaPageController";
import type {
  ButtonActionGroup,
  ButtonConfig,
} from "../../types/button.type";

export function buildTitleButtons({
  isEditMode,
  isCollectionEditMode,
  action,
}: {
  isEditMode: boolean;
  isCollectionEditMode: boolean;
  action: TitleBarActions;
}): ButtonActionGroup[] {
  if (isEditMode) {
    if (isCollectionEditMode) {
      return [];
    }

    return [
      {
        id: "title-edit",
        buttons: [
          {
            id: "cancel",
            label: "取消",
            icon: "bi-x-lg",
            variant: "danger",
            onClick: action.onCancelEdit,
          },
          {
            id: "save",
            label: "儲存",
            variant: "primary",
            icon: "bi-check-lg",
            onClick: action.onSaveEdit,
          },
        ],
      },
    ];
  }

  return [
    {
      id: "title-browser",
      buttons: [
        {
          id: "manage-description",
          icon: "bi-pencil-square",
          label: "編輯地區資訊",
          onClick: action.onEditArea,
        },
        {
          id: "manage-album",
          icon: "bi-journals",
          label: "編輯相簿",
          onClick: action.onEditCollection,
        },
      ],
    },
  ];
}

export function buildCollectionDoneGroup(
  onDone: () => void,
): ButtonActionGroup[] {
  return [
    {
      id: "collection-edit-done",
      buttons: [
        {
          id: "done",
          label: "完成",
          icon: "bi-check-lg",
          variant: "primary",
          onClick: onDone,
        },
      ],
    },
  ];
}

export function buildPhotoMenuGroups({
  hasPhotos,
  onAddPhoto,
  onDeletePhoto,
}: {
  hasPhotos: boolean;
  onAddPhoto: () => void;
  onDeletePhoto: () => void;
}): ButtonActionGroup[] {
  return [
    {
      id: "photo-actions",
      buttons: [
        {
          id: "photo-add",
          label: "新增照片",
          icon: "bi-plus-lg",
          onClick: onAddPhoto,
        },
        ...(hasPhotos
          ? [
              {
                id: "photo-delete",
                label: "刪除照片",
                icon: "bi-trash3",
                onClick: onDeletePhoto,
              } satisfies ButtonConfig,
            ]
          : []),
      ],
    },
  ];
}
