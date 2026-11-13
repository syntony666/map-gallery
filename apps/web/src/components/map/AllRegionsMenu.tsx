import { useState } from "react";
import type { Area } from "../../types/gallery.type";
import { RegionList } from "./RegionList";

type AllRegionsMenuProps = {
  areas: Area[] | null;
  selectedAreaId: string | null;
  onSelect: (areaId: string) => void;
};

/** Below lg the district panel is hidden; this opens the same list on demand. */
export function AllRegionsMenu({
  areas,
  selectedAreaId,
  onSelect,
}: AllRegionsMenuProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const select = (areaId: string) => {
    onSelect(areaId);
    close();
  };

  return (
    <>
      {/* Once the /areas gallery page ships this becomes a link instead of
          opening a list. */}
      <button
        type="button"
        aria-label="所有地區"
        onClick={() => setOpen(true)}
        className="absolute left-4 top-4 z-10 flex items-center gap-1.5
          rounded-lg bg-white px-3 py-1.5 text-sm text-stone-700 shadow
          hover:bg-stone-50 lg:hidden"
      >
        <i className="bi bi-grid" />
        所有地區
      </button>

      {/* Floating card styled like the district bottom bar; the max height
          reserves the bar's zone on md+ so the card never covers it. */}
      {open && (
        <div className="absolute inset-0 z-20 lg:hidden">
          <button
            type="button"
            aria-label="關閉所有地區"
            className="absolute inset-0 cursor-default"
            onClick={close}
          />
          <div
            className="absolute left-4 top-16 w-72
              max-w-[calc(100%-2rem)] overflow-y-auto rounded-2xl
              bg-white/90 p-4 shadow-lg backdrop-blur
              max-h-[calc(100%-6rem)] md:max-h-[calc(100%-10rem)]"
          >
            <RegionList
              areas={areas}
              selectedAreaId={selectedAreaId}
              onSelect={select}
            />
          </div>
        </div>
      )}
    </>
  );
}
