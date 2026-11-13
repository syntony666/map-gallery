import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Area } from "../../types/gallery.type";
import { Button } from "../common/Button";
import { FloatingCard } from "../common/FloatingCard";
import { RegionList } from "./RegionList";

/** Trigger lives inside each bottom card; it is safe to mount more than once
    because media queries hide every copy except the visible card's. */
export function AllRegionsButton({ onClick }: { onClick: () => void }) {
  return (
    // Once the /areas gallery page ships this becomes a link instead of
    // opening a list.
    <Button
      icon="bi-geo-alt"
      label="所有地區"
      aria-label="所有地區"
      onClick={onClick}
      className="lg:hidden"
    />
  );
}

type AllRegionsOverlayProps = {
  areas: Area[] | null;
  selectedAreaId: string | null;
  onSelect: (areaId: string) => void;
  open: boolean;
  onClose: () => void;
};

/** Gap between the card's bottom edge and the top of the visible bottom bar. */
const MENU_GAP_PX = 32;

/** Below lg the district panel is hidden; this opens the same list on demand.
    Mounted once per page — portaled so it escapes the card's backdrop-blur
    containing block. The card anchors 2rem above whatever `.bottom-bar` is
    visible, measured live so bar-height changes need no constants. */
export function AllRegionsOverlay({
  areas,
  selectedAreaId,
  onSelect,
  open,
  onClose,
}: AllRegionsOverlayProps) {
  const [clearance, setClearance] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (!open) return;

    const update = () => {
      const tops = [...document.querySelectorAll(".bottom-bar")]
        .filter((el) => el.offsetParent !== null)
        .map((el) => el.getBoundingClientRect().top);
      setClearance(
        tops.length > 0
          ? window.innerHeight - Math.min(...tops) + MENU_GAP_PX
          : null,
      );
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [open]);

  if (!open) return null;

  const select = (areaId: string) => {
    onSelect(areaId);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-20 lg:hidden">
      <button
        type="button"
        aria-label="關閉所有地區"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <FloatingCard
        style={{ bottom: clearance ?? 96 }}
        className="absolute inset-x-4 flex
          max-h-[calc(100dvh-10rem)] flex-col overflow-hidden p-4
          md:left-auto md:w-72 [&>ul]:min-h-0 [&>ul]:flex-1
          [&>ul]:overflow-y-auto"
      >
        <Button
          ghost
          icon="bi-x-lg"
          aria-label="關閉"
          onClick={onClose}
          className="absolute right-4 top-4 h-6 w-6 justify-center"
        />
        <RegionList
          areas={areas}
          selectedAreaId={selectedAreaId}
          onSelect={select}
        />
      </FloatingCard>
    </div>,
    document.body,
  );
}
