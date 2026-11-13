import type { Area } from "../../types/gallery.type";
import { BottomBarOverlay } from "../common/BottomBarOverlay";
import { Button } from "../common/Button";
import { regionRows } from "./regionMenu";

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

/** Below lg the district panel is hidden; this opens the same list on demand. */
export function AllRegionsOverlay({
  areas,
  selectedAreaId,
  onSelect,
  open,
  onClose,
}: AllRegionsOverlayProps) {
  return (
    <BottomBarOverlay
      open={open}
      onClose={onClose}
      title="所有地區"
      titleIcon="bi-geo-alt"
      sections={[
        {
          id: "regions",
          rows: regionRows(areas, selectedAreaId, onSelect),
        },
      ]}
      dividers
    />
  );
}
