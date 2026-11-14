import type { Area } from "../../types/gallery.type";
import { Button } from "../common/Button";
import { AreaCover } from "./AreaCover";
import { Icon } from "../common/Icon";

type DistrictInfoProps = {
  area: Area | null;
  /** hide the name heading when the container already shows it */
  heading?: boolean;
  /** hide the gallery link when the container already provides one */
  link?: boolean;
};

export function DistrictInfo({
  area,
  heading = true,
  link = true,
}: DistrictInfoProps) {
  if (!area) {
    return (
      <p className="text-sm text-ink-muted">
        點選地圖上的縣市，查看簡介與照片。
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <AreaCover
        src={area.coverImage}
        alt={`${area.name}封面`}
        className="aspect-[16/9] w-full rounded-md object-cover"
        iconClassName="text-2xl"
      />

      {heading && (
        <h2 className="text-lg font-semibold text-ink-strong">{area.name}</h2>
      )}

      <p className="text-xs text-ink-muted">{area.photoCount} 張照片</p>

      {area.description && (
        <p className="text-sm leading-relaxed text-ink-secondary">
          <Icon name="bi-chat-square-heart" className="desc-icon" />
          {area.description}
        </p>
      )}

      {link && (
        <Button
          to={`/area/${area.id}`}
          label="查看內容"
          iconEnd="bi-arrow-right"
          className="mt-1 w-fit"
        />
      )}
    </div>
  );
}
