import type { Item } from "../type/item.type";
import { EmptyState } from "./EmptyState";

export type ItemListProps = {
  district: string;
  items: Item[];
};

export function ItemListComponent({ district, items }: ItemListProps) {
  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">所有相片</h2>

        <span className="text-sm text-stone-500">{items.length} 個項目</span>
      </div>

      {items.length === 0 ? (
        <EmptyState title="" description="找不到符合條件的內容" />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                navigation.navigate(`/district/${district}/item/${item.id}`)
              }
              className="overflow-hidden rounded-xl bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <img
                src={item.thumbnail || item.image}
                alt={item.title}
                className="aspect-square w-full object-cover"
                loading="lazy"
              />

              <div className="p-3">
                <h3 className="truncate font-medium">{item.title}</h3>

                {item.summary && (
                  <p className="mt-1 line-clamp-2 text-sm text-stone-500">
                    {item.summary}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
