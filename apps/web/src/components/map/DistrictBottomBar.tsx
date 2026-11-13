import { Link } from "react-router";
import type { ReactNode } from "react";
import type { Area } from "../../types/gallery.type";
import { FloatingCard } from "../common/FloatingCard";
import { DistrictInfo } from "./DistrictInfo";
import { AreaCover } from "./AreaCover";

type DistrictBottomBarProps = {
  area: Area | null;
  onClose: () => void;
  /** Right-aligned actions shown inside every bottom card. */
  actions?: ReactNode;
  /** Extra actions prepended to the hint bar only. */
  hintActions?: ReactNode;
  /** Collapses the selected card to a slim strip while the region menu is open. */
  collapsed?: boolean;
};

export function DistrictBottomBar({
  area,
  onClose,
  actions,
  hintActions,
  collapsed,
}: DistrictBottomBarProps) {
  return (
    <>
      {area === null ? (
        <FloatingCard
          className="absolute inset-x-4 bottom-4 z-10 flex items-center
            justify-between gap-2 px-5 py-3 text-xs text-stone-500
            md:text-sm lg:hidden"
        >
          <span>點選縣市，以查看簡介。</span>
          <span className="flex shrink-0 items-center gap-1.5">
            {hintActions}
            {actions}
          </span>
        </FloatingCard>
      ) : collapsed ? (
        <FloatingCard
          className="absolute inset-x-4 bottom-4 z-10 px-5 py-3 text-sm
            md:hidden"
        >
          <span className="font-semibold text-stone-800">{area.name}</span>
          <span className="text-stone-500"> {area.photoCount} 張照片</span>
        </FloatingCard>
      ) : null}

      {area !== null && (
        <FloatingCard
          className="absolute inset-x-4 bottom-4 z-10 hidden items-center
            gap-3 px-4 py-3 md:max-lg:flex"
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
        </FloatingCard>
      )}

      {area !== null && !collapsed && (
        <FloatingCard
          className="absolute inset-x-4 bottom-4 z-10 flex max-h-[75dvh]
            flex-col overflow-hidden p-5 md:hidden"
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
          <div className="min-h-0 flex-1 overflow-y-auto">
            <DistrictInfo area={area} heading={false} link={false} />
          </div>
          <div className="mt-3 flex justify-end">
            <Link
              to={`/area/${area.id}`}
              className="inline-flex items-center gap-1 rounded
                bg-stone-200 px-3 py-2 text-xs text-stone-800
                hover:bg-stone-300"
            >
              查看內容
              <i className="bi bi-arrow-right" />
            </Link>
          </div>
        </FloatingCard>
      )}
    </>
  );
}
