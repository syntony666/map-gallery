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
        <span className="collection-item glass img-loading h-18 w-18 self-start rounded-md p-1 sm:h-24 sm:w-24">
          <ShimmerImg
            src={collection.coverImage}
            alt={collection.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full rounded object-cover"
          />
        </span>
      ) : (
        <span className="collection-item glass h-18 w-18 rounded-md p-1 sm:h-24 sm:w-24">
          <span className="flex h-full w-full items-center justify-center rounded bg-fill/70 text-2xl text-ink-faint">
            <i className="bi bi-images" />
          </span>
        </span>
      )}
      <p className="truncate text-xs mt-1 w-18 sm:w-24">{collection.name}</p>
    </button>
  );
}
