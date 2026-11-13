import { createPortal } from "react-dom";
import type { Area } from "../../types/gallery.type";
import { FloatingCard } from "../common/FloatingCard";
import { RegionList } from "./RegionList";

/** Trigger lives inside each bottom card; it is safe to mount more than once
    because media queries hide every copy except the visible card's. */
export function AllRegionsButton({ onClick }: { onClick: () => void }) {
  return (
    // Once the /areas gallery page ships this becomes a link instead of
    // opening a list.
    <button
      type="button"
      aria-label="所有地區"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded bg-stone-100 px-2
        py-1 text-xs text-stone-700 hover:bg-stone-200 lg:hidden"
    >
      <i className="bi bi-geo-alt" />
      所有地區
    </button>
  );
}

type AllRegionsOverlayProps = {
  areas: Area[] | null;
  selectedAreaId: string | null;
  onSelect: (areaId: string) => void;
  open: boolean;
  onClose: () => void;
};

/** Below lg the district panel is hidden; this opens the same list on demand.
    Mounted once per page — portaled so it escapes the card's backdrop-blur
    containing block; anchored above the bottom bar like the trigger. */
export function AllRegionsOverlay({
  areas,
  selectedAreaId,
  onSelect,
  open,
  onClose,
}: AllRegionsOverlayProps) {
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
        className={`absolute inset-x-4 bottom-20 flex
          ${selectedAreaId ? "md:bottom-24" : ""}
          max-h-[calc(100dvh-10rem)] flex-col overflow-hidden p-4
          md:left-auto md:w-72 [&>ul]:min-h-0 [&>ul]:flex-1
          [&>ul]:overflow-y-auto`}
      >
        <button
          type="button"
          aria-label="關閉"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-6 w-6 items-center
            justify-center rounded text-stone-400 hover:bg-stone-200
            hover:text-stone-600"
        >
          <i className="bi bi-x-lg" />
        </button>
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
