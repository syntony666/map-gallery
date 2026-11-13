import type { ReactNode } from "react";
import type { Area } from "../../types/gallery.type";
import { BottomBar } from "../common/BottomBar";
import { Button } from "../common/Button";
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
        <BottomBar
          className="text-xs text-stone-500 md:text-sm lg:hidden"
          actions={
            <>
              {hintActions}
              {actions}
            </>
          }
        >
          <span>點選縣市，以查看簡介。</span>
        </BottomBar>
      ) : collapsed ? (
        <BottomBar className="text-sm md:hidden">
          <span className="font-semibold text-stone-800">{area.name}</span>
          {area.name}
          <span className="text-stone-500"> • {area.photoCount}張照片</span>
        </BottomBar>
      ) : null}

      {area !== null && (
        <FloatingCard
          className="bottom-bar absolute inset-x-4 bottom-4 z-10 hidden
            items-center gap-3 px-4 py-3 md:max-lg:flex"
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
                <i className="bi bi-chat-square-heart" />
                {area.description}
              </p>
            )}
          </div>
          <Button
            to={`/area/${area.id}`}
            label="查看內容"
            className="shrink-0"
          />
          <span className="flex shrink-0 items-center gap-1.5">{actions}</span>
          <Button
            raised
            icon="bi-x-lg"
            aria-label="關閉簡介"
            onClick={onClose}
            className="shrink-0"
          />
        </FloatingCard>
      )}

      {area !== null && !collapsed && (
        <FloatingCard
          className="bottom-bar absolute inset-x-4 bottom-4 z-10 flex
            max-h-[75dvh] flex-col overflow-hidden p-5 md:hidden"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-stone-800">
              {area.name}
            </h2>
            <span className="flex items-center gap-1.5">
              {actions}
              <Button
                raised
                icon="bi-x-lg"
                aria-label="關閉簡介"
                onClick={onClose}
              />
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <DistrictInfo area={area} heading={false} link={false} />
          </div>
          <div className="mt-3 flex justify-end">
            <Button
              to={`/area/${area.id}`}
              label="查看內容"
              iconEnd="bi-arrow-right"
            />
          </div>
        </FloatingCard>
      )}
    </>
  );
}
