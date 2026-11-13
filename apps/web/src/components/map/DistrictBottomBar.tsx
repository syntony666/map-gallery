import { Link } from "react-router";
import type { ReactNode } from "react";
import type { Area } from "../../types/gallery.type";
import { DistrictInfo } from "./DistrictInfo";
import { AreaCover } from "./AreaCover";

type DistrictBottomBarProps = {
  area: Area | null;
  onClose: () => void;
  /** Right-aligned actions shown inside every bottom card. */
  actions?: ReactNode;
};

export function DistrictBottomBar({
  area,
  onClose,
  actions,
}: DistrictBottomBarProps) {
  return (
    <>
      {area === null ? (
        <div
          className="absolute inset-x-4 bottom-4 z-10 flex items-center
            justify-between gap-2 rounded-2xl bg-white/90 px-5 py-3 text-sm
            text-stone-500 shadow-lg backdrop-blur lg:hidden"
        >
          <span>
            點選地圖上的縣市，
            <br className="md:hidden" />
            查看簡介與照片。
          </span>
          <span className="flex shrink-0 items-center gap-1.5">{actions}</span>
        </div>
      ) : (
        <div
          className="absolute inset-x-4 bottom-4 z-10 hidden items-center gap-3
            rounded-2xl bg-white/90 px-4 py-3 shadow-lg backdrop-blur
            md:max-lg:flex"
        >
          <AreaCover
            src={area.coverImage}
            className="h-12 w-20 shrink-0 rounded-md object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-stone-800">
              {area.name}
              <span className="font-normal text-stone-500">
                {" "}
                • {area.photoCount}張照片
              </span>
            </p>
            {area.description && (
              <p
                className="mt-0.5 line-clamp-2 text-xs leading-relaxed
                  text-stone-600"
              >
                <i className="bi bi-chat-square-heart mr-1" />
                {area.description}
              </p>
            )}
          </div>
          <Link
            to={`/area/${area.id}`}
            className="shrink-0 rounded bg-stone-200 px-3 py-1.5 text-xs
              text-stone-800 hover:bg-stone-300"
          >
            查看內容
          </Link>
          <span className="flex shrink-0 items-center gap-1.5">{actions}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉簡介"
            className="shrink-0 rounded bg-white px-2 py-1 text-stone-700
              shadow hover:bg-stone-50"
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>
      )}

      {area !== null && (
        <div
          className="absolute inset-x-4 bottom-4 z-10 max-h-[75dvh]
            overflow-y-auto rounded-2xl bg-white/90 p-5 shadow-lg
            backdrop-blur md:hidden"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-stone-800">
              {area.name}
            </h2>
            <span className="flex items-center gap-1.5">
              {actions}
              <button
                type="button"
                onClick={onClose}
                aria-label="關閉簡介"
                className="rounded bg-white px-2 py-1 text-stone-700 shadow
                hover:bg-stone-50"
              >
                <i className="bi bi-x-lg" />
              </button>
            </span>
          </div>
          <DistrictInfo area={area} heading={false} />
        </div>
      )}
    </>
  );
}
