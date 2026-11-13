import type { ReactNode } from "react";
import type { Area } from "../../types/gallery.type";
import { BottomBar } from "../common/BottomBar";
import { BottomBarStack } from "../common/BottomBarStack";
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
  /** Overlay (e.g. the region menu) anchored above the bar inside the same
      positioning wrapper. */
  overlay?: ReactNode;
};

export function DistrictBottomBar({
  area,
  onClose,
  actions,
  hintActions,
  collapsed,
  overlay,
}: DistrictBottomBarProps) {
  return (
    <BottomBarStack overlay={overlay} className="lg:hidden">
      {area === null ? (
        <BottomBar
          className="text-xs text-stone-500 md:text-sm"
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
        <BottomBar className="text-sm" actions={actions}>
          <p className="min-w-0 truncate">
            <span className="font-semibold text-stone-800">{area.name}</span>
            <span className="text-stone-500"> • {area.photoCount}張照片</span>
          </p>
        </BottomBar>
      ) : null}

      {area !== null && !collapsed && (
        <FloatingCard className="hidden items-center gap-3 px-4 py-3 md:max-lg:flex">
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
            icon="bi-arrow-up-right"
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
          className="flex max-h-[75dvh] flex-col overflow-hidden p-5
            md:hidden"
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
          <div className="scroll-body">
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
    </BottomBarStack>
  );
}
