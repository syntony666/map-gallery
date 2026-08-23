import type { Photo } from "../../types/photo.type";

type PhotoCardProps = {
  districtName: string;
  photo: Photo;
};

export function PhotoCard({ districtName, photo }: PhotoCardProps) {
  return (
    <button
      key={photo.id}
      type="button"
      onClick={() =>
        navigation.navigate(`/district/${districtName}/photo/${photo.id}`)
      }
      className="overflow-hidden rounded-xl bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <img
        src={photo.image}
        alt={photo.title}
        className="aspect-square w-full object-cover"
        loading="lazy"
        decoding="async"
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
  );
}
