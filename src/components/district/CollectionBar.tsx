import type { CollectionGroup } from "../../types/photo.type";
import { EmptyState } from "../common/EmptyState";

export type CollectionProps = {
  collectionGroup: CollectionGroup[] | null;
  collectionName: string;
  onSelect: (value: string) => void;
};

export function CollectionBar({
  collectionGroup,
  collectionName,
  onSelect,
}: CollectionProps) {
  if (!collectionGroup || collectionGroup.length === 0) {
    return <EmptyState title="" description="目前沒有相簿" />;
  }
  return (
    <section className="flex gap-3 overflow-x-auto pb-2 my-4">
      {collectionGroup.map((collection) => (
        <button
          key={collection.name}
          type="button"
          onClick={() => onSelect(collection.name)}
          className={`shrink-0 overflow-hidden 
            ${collectionName === "" || collectionName === collection.name ? "" : "opacity-60"}`}
        >
          <img
            src={collection.photos[0].thumbnail || collection.photos[0].image}
            alt={collection.photos[0].title}
            className="h-18 w-18  rounded-full bg-stone-200 sm:h-24 sm:w-24"
          />

          <p className="mt-1 w-18 truncate text-xs sm:w-24">
            {collection.name}
          </p>
        </button>
      ))}
    </section>
  );
}
