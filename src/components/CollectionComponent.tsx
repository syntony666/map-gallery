import type { CollectionGroup } from "../type/item.type";

export type CollectionProps = {
  collections: CollectionGroup[] | null;
  collectionName: string;
  onSelect: (value: string) => void;
};

export function CollectionComponent({
  collections,
  collectionName,
  onSelect,
}: CollectionProps) {
  if (!collections || collections.length === 0) {
    return (
      <div className="flex h-28 w-full items-center justify-center rounded-lg bg-stone-100 text-sm text-stone-500">
        目前沒有相簿
      </div>
    );
  }
  return (
    <section className="flex gap-3 overflow-x-auto pb-2 my-4">
      {collections.map((collection) => (
        <button
          key={collection.name}
          type="button"
          onClick={() => onSelect(collection.name)}
          className={`shrink-0 overflow-hidden 
            ${collectionName === "" || collectionName === collection.name ? "" : "opacity-60"}`}
          aria-label={`查看：${collection.name}`}
        >
          <img
            src={collection.items[0].thumbnail || collection.items[0].image}
            alt={collection.items[0].title}
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
