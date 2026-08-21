import type { Photo } from "../type/photo.type";
import { EmptyState } from "./EmptyState";

export type PhotoGridProps = {
  district: string;
  photos: Photo[];
};

export function PhotoGridComponent({ district, photos }: PhotoGridProps) {
  return (
    <section className="mt-6">
      <div className="mb-3 flex photos-center justify-between">
        <h2 className="text-lg font-semibold">所有相片</h2>

        <span className="text-sm text-stone-500">{photos.length} 個項目</span>
      </div>

      {photos.length === 0 ? (
        <EmptyState title="" description="找不到符合條件的內容" />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <button
              key={photo.id}
              type="button"
              onClick={() =>
                navigation.navigate(`/district/${district}/photo/${photo.id}`)
              }
              className="overflow-hidden rounded-xl bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <img
                src={photo.thumbnail || photo.image}
                alt={photo.title}
                className="aspect-square w-full object-cover"
                loading="lazy"
              />

              <div className="p-3">
                <h3 className="truncate font-medium">{photo.title}</h3>

                {photo.summary && (
                  <p className="mt-1 line-clamp-2 text-sm text-stone-500">
                    {photo.summary}
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
