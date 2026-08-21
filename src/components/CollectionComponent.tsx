import type { CollectionGroup } from "../type/item.type";

export type CollectionProps = {
  district: string;
  collections: CollectionGroup[] | null;
};

export function CollectionComponent({
  district,
  collections,
}: CollectionProps) {
  if (!collections || collections.length === 0) {
    return (
      <div className="flex h-28 w-full items-center justify-center rounded-lg bg-stone-100 text-sm text-stone-500">
        此行政區目前還沒有照片
      </div>
    );
  }
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {collections.map((collection) => (
        <button
          key={collection.name}
          type="button"
          onClick={() =>
            navigation.navigate(
              `/district/${district}/item/${collection.items[0].id}`,
            )
          }
          className="shrink-0 overflow-hidden rounded-full bg-stone-200"
          aria-label={`查看：${collection.name}`}
        >
          <img
            src={collection.items[0].thumbnail || collection.items[0].image}
            alt={collection.items[0].title}
            className="h-18 w-18 object-cover sm:h-24 sm:w-24"
          />
        </button>
      ))}
    </div>
  );
}
