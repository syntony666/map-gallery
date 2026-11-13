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

/** Below lg the district panel is hidden; this opens the same list on demand.
    Rendered inside the bottom bar's positioning wrapper, so the card anchors
    2rem above whichever bar is visible without measuring. The fixed backdrop
    escapes to the viewport because no ancestor carries a backdrop filter. */
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

  return (
    <>
      <button
        type="button"
        aria-label="關閉所有地區"
        className="fixed inset-0 cursor-default"
        onClick={onClose}
      />
      <FloatingCard
        className="absolute inset-x-0 bottom-[calc(100%_+_2rem)] flex
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
    </>
  );
}
