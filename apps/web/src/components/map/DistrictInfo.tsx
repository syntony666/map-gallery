import { Link } from "react-router";
import type { Area } from "../../types/gallery.type";
import { AreaCover } from "./AreaCover";

type DistrictInfoProps = {
  area: Area | null;
  /** hide the name heading when the container already shows it */
  heading?: boolean;
};

export function DistrictInfo({ area, heading = true }: DistrictInfoProps) {
  if (!area) {
    return (
      <p className="text-sm text-stone-500">
        點選地圖上的縣市，查看簡介與照片。
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <AreaCover
        src={area.coverImage}
        alt={`${area.name}封面`}
        className="img-loading aspect-[16/9] w-full rounded-lg object-cover"
        iconClassName="text-2xl"
      />

      {heading && (
        <h2 className="text-lg font-semibold text-stone-800">{area.name}</h2>
      )}

      <p className="text-xs text-stone-500">{area.photoCount} 張照片</p>

      {area.description && (
        <p className="text-sm leading-relaxed text-stone-600">
          <i className="bi bi-chat-square-heart mr-1.5" />
          {area.description}
        </p>
      )}

      <Link
        to={`/area/${area.id}`}
        className="mt-1 inline-flex w-fit items-center gap-1 rounded
          bg-stone-200 px-3 py-2 text-xs text-stone-800 hover:bg-stone-300"
      >
        查看內容
        <i className="bi bi-arrow-right" />
      </Link>
    </div>
  );
}
