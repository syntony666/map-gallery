import type { Collection } from "../../types/gallery.type";
import { CollectionAvatar } from "./CollectionAvatar";

type CollectionItemProps = {
  collection: Collection;
  isSelected: boolean;
  onClick: () => void;
};

export function CollectionItem({
  collection,
  isSelected,
  onClick,
}: CollectionItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 flex-col overflow-hidden ${isSelected ? "" : "opacity-60"}`}
    >
      <CollectionAvatar
        image={collection.coverImage}
        alt={collection.name}
        icon="bi-images"
        label={collection.name}
      />
    </button>
  );
}
