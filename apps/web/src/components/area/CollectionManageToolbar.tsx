import type { ButtonActionGroup } from "../../types/button.type";
import type { Collection } from "../../types/gallery.type";
import { Toolbar } from "../common/Toolbar";

export type CollectionManageToolbarAction = {
  onCollectionRename: (collection: Collection) => void;
  onCollectionRemove: (collection: Collection) => void;
  onAddCollectionPhoto: () => void;
  onRemoveCollectionPhoto: () => void;
  onConfirmCollectionPhotoSelection: () => void;
  onRejectCollectionPhotoSelection: () => void;
};

type CollectionManageToolbarProps = {
  collection: Collection | null;
  isCollectionPhotoSelectMode: boolean;
  action: CollectionManageToolbarAction;
};

export function CollectionManageToolbar({
  collection,
  isCollectionPhotoSelectMode,
  action,
}: CollectionManageToolbarProps) {
  if (!collection) {
    return <Toolbar label="請選取上方相簿..." />;
  }
  const buttons: ButtonActionGroup[] = isCollectionPhotoSelectMode
    ? [
        {
          id: "collection-photo-selection",
          buttons: [
            {
              id: "photo-confirm",
              label: "確認",
              icon: "bi-check-circle-fill",
              variant: "primary",
              onClick: () => action.onConfirmCollectionPhotoSelection(),
            },
            {
              id: "photo-reject",
              label: "取消",
              icon: "bi-x-circle-fill",
              variant: "danger",
              onClick: () => action.onRejectCollectionPhotoSelection(),
            },
          ],
        },
      ]
    : [
        {
          id: "collection-photo-edit",
          buttons: [
            {
              id: `${collection.id}-add-photo`,
              label: "加入照片",
              icon: "bi-plus-square",
              onClick: () => action.onAddCollectionPhoto(),
            },
            {
              id: `${collection.id}-remove-photo`,
              label: "移除照片",
              icon: "bi-dash-square",
              onClick: () => action.onRemoveCollectionPhoto(),
            },
          ],
        },
        {
          id: "collection-meta-edit",
          buttons: [
            {
              id: `rename-${collection.id}`,
              label: "更改名稱",
              icon: "bi-pencil-square",
              onClick: () => action.onCollectionRename(collection),
            },
            {
              id: `remove-${collection.id}`,
              label: "刪除相簿",
              icon: "bi-trash3",
              variant: "danger",
              onClick: () => action.onCollectionRemove(collection),
            },
          ],
        },
      ];
  return isCollectionPhotoSelectMode ? (
    <Toolbar
      label="正在編輯："
      value={collection.name}
      meta={`${collection.photoCount} 張照片`}
      buttonGroups={buttons}
      mobileMode="inline"
    />
  ) : (
    <Toolbar
      label="正在編輯："
      value={collection.name}
      meta={`（${collection.photoCount} 張照片）`}
      buttonGroups={buttons}
      mobileGroupIcon="bi-pencil-square"
      mobileGroupLabel="管理相簿"
    />
  );
}
