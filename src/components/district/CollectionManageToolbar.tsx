import type { ButtonActionGroup } from "../../types/button.type";
import type { Collection } from "../../types/photo.type";
import { Toolbar } from "../common/Toolbar";

type CollectionManageToolbarProps = {
  collection: Collection;
  onRename: (collectionName: string) => void;
  onRemove: (collectionName: string, photoCount: number) => void;
};

export function CollectionManageToolbar({
  collection,
  onRename,
  onRemove,
}: CollectionManageToolbarProps) {
  const buttons: ButtonActionGroup[] = [
    {
      id: "collection-photo-edit",
      buttons: [
        {
          id: `${collection.name}-add-photo`,
          label: "加入照片",
          icon: "bi-plus-square",
          onClick: () => {},
        },
        {
          id: `${collection.name}-remove-photo`,
          label: "移除照片",
          icon: "bi-dash-square",
          onClick: () => {},
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
          onClick: () => onRename(collection.name),
        },
        {
          id: `remove-${collection.name}`,
          label: "刪除相簿",
          icon: "bi-trash3",
          variant: "danger",
          onClick: () => onRemove(collection.name, collection.photos.length),
        },
      ],
    },
  ];
  return (
    <Toolbar
      label="正在編輯："
      value={collection.name}
      meta={`${collection.photos.length} 張照片`}
      buttonGroups={buttons}
      mobileGroupIcon="bi-pencil-square"
      mobileGroupLabel="管理相簿"
    />
  );
}
