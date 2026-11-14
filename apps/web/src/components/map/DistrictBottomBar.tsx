import type { ReactNode } from "react";
import type { Area } from "../../types/gallery.type";
import { BottomBar } from "../common/BottomBar";
import { BottomBarStack } from "../common/BottomBarStack";
import { Button } from "../common/Button";
import { FloatingCard } from "../common/FloatingCard";
import { DistrictInfo } from "./DistrictInfo";
import { AreaCover } from "./AreaCover";
import { useDelayedUnmount } from "../../hooks/useDelayedUnmount";

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
  /* cardArea keeps the last area during the exit window so the card
     still has content while it animates out. */
  const cardOpen = area !== null && !collapsed;
  const cardArea = useDelayedUnmount(cardOpen ? area : null);

  return (
    <BottomBarStack overlay={overlay} className="lg:hidden">
      {area === null ? (
        <BottomBar
          className="text-xs text-ink-muted md:text-sm"
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
            <span className="font-semibold text-ink-strong">{area.name}</span>
            <span className="text-ink-muted"> • {area.photoCount}張照片</span>
          </p>
        </BottomBar>
      ) : null}

      {cardArea && (
        <FloatingCard
          className={`hidden items-center gap-3 px-4 py-3 md:max-lg:flex ${cardOpen ? "" : "overlay-exit"}`}
        >
          <AreaCover
            src={cardArea.coverImage}
            className="h-12 w-20 shrink-0 rounded-md object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink-strong">
              {cardArea.name}
              <span className="font-normal text-ink-muted">
                {" "}
                • {cardArea.photoCount}張照片
              </span>
            </p>
            {cardArea.description && (
              <p
                className="mt-0.5 line-clamp-2 text-xs leading-relaxed
                  text-ink-secondary"
              >
                <i className="bi bi-chat-square-heart" />
                {cardArea.description}
              </p>
            )}
          </div>
          <Button
            to={`/area/${cardArea.id}`}
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

      {cardArea && (
        <FloatingCard
          className={`flex max-h-[75dvh] flex-col overflow-hidden p-5
            md:hidden ${cardOpen ? "" : "overlay-exit"}`}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-ink-strong">
              {cardArea.name}
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
            <DistrictInfo area={cardArea} heading={false} link={false} />
          </div>
          <div className="mt-3 flex justify-end">
            <Button
              to={`/area/${cardArea.id}`}
              label="查看內容"
              iconEnd="bi-arrow-right"
            />
          </div>
        </FloatingCard>
      )}
    </BottomBarStack>
  );
}
