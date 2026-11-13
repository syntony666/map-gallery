import { useNavigate } from "react-router";
import type { PhotoDetail } from "../../types/gallery.type";

type PhotoInfoProps = {
  photo: PhotoDetail;
};

export function PhotoInfo({ photo }: PhotoInfoProps) {
  const navigate = useNavigate();
  return (
    <section className="lg:pt-1">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{photo.title}</h1>

        <time className="mt-1 block text-sm text-ink-muted">{photo.date}</time>
      </div>

      {photo.collections.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2">
          {photo.collections.map((collection) => (
            <button
              key={collection.id}
              type="button"
              onClick={() =>
                navigate(`/area/${photo.areaId}`, {
                  state: { collectionId: collection.id },
                })
              }
              className="text-sm text-accent hover:text-primary"
            >
              #{collection.name}
            </button>
          ))}
        </div>
      )}

      {photo.summary && (
        <p className="mt-6 font-medium leading-7 text-ink">
          {photo.summary}
        </p>
      )}

      {photo.description && (
        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-ink-secondary">
          {photo.description}
        </p>
      )}
    </section>
  );
}
