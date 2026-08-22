import type { Photo } from "../../types/photo.type";
import { Button } from "../common/Button";
import { EmptyState } from "../common/EmptyState";

export type PhotoGridProps = {
  district: string;
  photos: Photo[];
};

export function PhotoGrid({ district, photos }: PhotoGridProps) {
  const addButton = {
    id: "addPhoto",
    icon: "bi-plus-lg",
    onClick: () => alert("上傳功能尚未開放"),
  };
  return (
    <section className="mt-6">
      <div className="mb-3 flex item-center justify-between">
        <div>
          <span className="text-lg font-semibold me-2">所有相片</span>
          <Button button={addButton} />
        </div>
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
