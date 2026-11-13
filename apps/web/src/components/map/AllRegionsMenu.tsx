import { useState } from "react";
import { createPortal } from "react-dom";
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
        className="flex items-center gap-1.5 rounded bg-stone-100 px-3
          py-1.5 text-sm text-stone-700 hover:bg-stone-200 lg:hidden"
      >
        <i className="bi bi-grid" />
        所有地區
      </button>

      {/* Portaled so it escapes the card's backdrop-blur containing block;
          anchored above the bottom bar on the right like the trigger. */}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-20 lg:hidden">
            <button
              type="button"
              aria-label="關閉所有地區"
              className="absolute inset-0 cursor-default"
              onClick={close}
            />
            <div
              className="absolute bottom-24 right-4 flex w-72
                max-h-[calc(100dvh-10rem)] max-w-[calc(100vw-2rem)]
                flex-col overflow-hidden rounded-2xl bg-white/90 p-4
                shadow-lg backdrop-blur [&>ul]:min-h-0 [&>ul]:flex-1
                [&>ul]:overflow-y-auto"
            >
              <button
                type="button"
                aria-label="關閉"
                onClick={close}
                className="absolute right-3 top-3 rounded p-1.5
                  text-stone-400 hover:bg-stone-200 hover:text-stone-600"
              >
                <i className="bi bi-x-lg" />
              </button>
              <RegionList
                areas={areas}
                selectedAreaId={selectedAreaId}
                onSelect={select}
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
