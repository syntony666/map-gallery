import { useNavigate } from "react-router";
import type { Photo } from "../../types/photo.type";

type PhotoInfoProps = {
  districtName: string;
  photo: Photo;
};

export function PhotoInfo({ districtName, photo }: PhotoInfoProps) {
  const navigate = useNavigate();
  return (
    <section className="lg:pt-1">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{photo.title}</h1>

        <time className="mt-1 block text-sm text-stone-500">{photo.date}</time>
      </div>

      {photo.collections?.length && photo.collections.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2">
          {photo.collections.map((collection) => (
            <button
              key={collection}
              type="button"
              onClick={() =>
                navigate(`/district/${districtName}`, {
                  state: { collectionName: collection },
                })
              }
              className="text-sm text-purple-500 hover:text-purple-700"
            >
              #{collection}
            </button>
          ))}
        </div>
      )}

      {photo.summary && (
        <p className="mt-6 font-medium leading-7 text-stone-700">
          {photo.summary}
        </p>
      )}

      {photo.description && (
        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-stone-600">
          {photo.description}
        </p>
      )}
    </section>
  );
}
