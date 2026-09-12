import type { Collection } from "../../types/gallery.type";

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
      className={`shrink-0 overflow-hidden ${isSelected ? "" : "opacity-60"}`}
    >
      <img
        src={collection.coverImage}
        alt={collection.name}
        loading="lazy"
        decoding="async"
        className="collection-item h-18 w-18 rounded-full bg-stone-200 sm:h-24 sm:w-24"
      />
      <p className="truncate text-xs mt-1 w-18 sm:w-24">{collection.name}</p>
    </button>
  );
}
