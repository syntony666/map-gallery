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
      {collection.coverImage ? (
        <img
          src={collection.coverImage}
          alt={collection.name}
          loading="lazy"
          decoding="async"
          className="collection-item h-18 w-18 rounded-full bg-stone-200 sm:h-24 sm:w-24"
        />
      ) : (
        <span className="collection-item flex h-18 w-18 items-center justify-center rounded-full bg-stone-200 text-2xl text-stone-400 sm:h-24 sm:w-24">
          <i className="bi bi-images" />
        </span>
      )}
      <p className="truncate text-xs mt-1 w-18 sm:w-24">{collection.name}</p>
    </button>
  );
}
