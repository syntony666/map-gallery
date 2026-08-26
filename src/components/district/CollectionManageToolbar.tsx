import type { Collection } from "../../types/photo.type";
import { Button } from "../common/Button";

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
  const buttons = [
    {
      id: `remove-${collection.name}`,
      icon: "bi-plus-square",
      onClick: () => {},
    },
    {
      id: `remove-${collection.name}`,
      icon: "bi-dash-square",
      onClick: () => {},
    },
    {
      id: `rename-${collection.name}`,
      icon: "bi-pencil-square",
      onClick: () => onRename(collection.name),
    },
    {
      id: `remove-${collection.name}`,
      icon: "bi-trash3 text-red-700",
      onClick: () => onRemove(collection.name, collection.photos.length),
    },
  ];
  return (
    <section
      className="flex flex-wrap items-center justify-between py-3
        border-y border-stone-400"
    >
      <p className="text-sm text-stone-500">
        正在編輯：
        <span className="ml-1 font-medium text-stone-700">
          {collection.name}
        </span>
        <span className="ml-1 text-stone-400">
          ({collection.photos.length} 張照片)
        </span>
      </p>

      <div className="flex items-center gap-2">
        {buttons.map((button) => (
          <Button button={button} />
        ))}
      </div>
    </section>
  );
}
