import { useNavigate } from "react-router";
import type { PhotoDetail } from "../../types/gallery.type";

type PhotoInfoProps = {
  photo: PhotoDetail;
};

export function PhotoInfo({ photo }: PhotoInfoProps) {
  const navigate = useNavigate();
  return (
    <section className="glass rounded-md p-5 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{photo.title}</h1>

        <time className="mt-1 block text-sm text-ink-muted">{photo.date}</time>
      </div>

      {photo.collections.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {photo.collections.map((collection) => (
            <button
              key={collection.id}
              type="button"
              onClick={() =>
                navigate(`/area/${photo.areaId}`, {
                  state: { collectionId: collection.id },
                })
              }
              className="rounded-full my-2 px-2 py-1 text-sm text-accent bg-fill/80 hover:bg-fill"
            >
              #{collection.name}
            </button>
          ))}
        </div>
      )}

      {photo.summary && (
        <p className="font-medium leading-7 text-ink">
          {photo.summary}
        </p>
      )}

      {photo.description && (
        <p className="whitespace-pre-line text-sm leading-7 text-ink-secondary">
          {photo.description}
        </p>
      )}
    </section>
  );
}
