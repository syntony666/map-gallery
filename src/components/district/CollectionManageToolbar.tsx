import type { ButtonActionGroup } from "../../types/button.type";
import type { Collection } from "../../types/photo.type";
import { Toolbar } from "../common/Toolbar";

export type CollectionManageToolbarAction = {
  onRename: (collectionName: string) => void;
  onRemove: (collectionName: string, photoCount: number) => void;
  onAddPhoto: () => void;
  onRemovePhoto: () => void;
  onConfirmPhotoSelection: () => void;
  onRejectPhotoSelection: () => void;
};

type CollectionManageToolbarProps = {
  collection: Collection | null;
  isPhotoEditing: boolean;
  action: CollectionManageToolbarAction;
};

export function CollectionManageToolbar({
  collection,
  isPhotoEditing,
  action,
}: CollectionManageToolbarProps) {
  if (!collection) {
    return <Toolbar label="請選取上方相簿..." />;
  }
  const buttons: ButtonActionGroup[] = isPhotoEditing
    ? [
        {
          id: "collection-photo-selection",
          buttons: [
            {
              id: "photo-confirm",
              label: "確認",
              icon: "bi-check-circle-fill",
              variant: "primary",
              onClick: () => action.onConfirmPhotoSelection(),
            },
            {
              id: "photo-reject",
              label: "取消",
              icon: "bi-x-circle-fill",
              variant: "danger",
              onClick: () => action.onRejectPhotoSelection(),
            },
          ],
        },
      ]
    : [
        {
          id: "collection-photo-edit",
          buttons: [
            {
              id: `${collection.name}-add-photo`,
              label: "加入照片",
              icon: "bi-plus-square",
              onClick: () => action.onAddPhoto(),
            },
            {
              id: `${collection.name}-remove-photo`,
              label: "移除照片",
              icon: "bi-dash-square",
              onClick: () => action.onRemovePhoto(),
            },
          ],
        },
        {
          id: "collection-meta-edit",
          buttons: [
            {
              id: `rename-${collection.name}`,
              label: "更改名稱",
              icon: "bi-pencil-square",
              onClick: () => action.onRename(collection.name),
            },
            {
              id: `remove-${collection.name}`,
              label: "刪除相簿",
              icon: "bi-trash3",
              variant: "danger",
              onClick: () =>
                action.onRemove(collection.name, collection.photos.length),
            },
          ],
        },
      ];
  return isPhotoEditing ? (
    <Toolbar
      label="正在編輯："
      value={collection.name}
      meta={`${collection.photos.length} 張照片`}
      buttonGroups={buttons}
      mobileMode="inline"
    />
  ) : (
    <Toolbar
      label="正在編輯："
      value={collection.name}
      meta={`（${collection.photos.length} 張照片）`}
      buttonGroups={buttons}
      mobileGroupIcon="bi-pencil-square"
      mobileGroupLabel="管理相簿"
    />
  );
}
