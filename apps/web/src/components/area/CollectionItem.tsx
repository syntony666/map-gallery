import type { Collection } from "../../types/gallery.type";
import { ShimmerImg } from "../common/ShimmerImg";

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
      className={`flex shrink-0 flex-col ${isSelected ? "" : "opacity-60"}`}
    >
      {collection.coverImage ? (
        <span className="collection-item img-loading self-start rounded-full">
          <ShimmerImg
            src={collection.coverImage}
            alt={collection.name}
            loading="lazy"
            decoding="async"
            className="h-18 w-18 rounded-full object-cover sm:h-24 sm:w-24"
          />
        </span>
      ) : (
        <span className="collection-item flex h-18 w-18 items-center justify-center rounded-full bg-fill text-2xl text-ink-faint sm:h-24 sm:w-24">
          <i className="bi bi-images" />
        </span>
      )}
      <p className="truncate text-xs mt-1 w-18 sm:w-24">{collection.name}</p>
    </button>
  );
}
