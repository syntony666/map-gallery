import { useState } from "react";
import type { Area } from "../../types/gallery.type";
import { ActionSheet } from "../common/ActionSheet";
import { RegionList } from "./RegionList";

type AllRegionsMenuProps = {
  areas: Area[] | null;
  selectedAreaId: string | null;
  onSelect: (areaId: string) => void;
};

const listTitle = (
  <>
    <i className="bi bi-chat-square-heart mr-1.5 text-stone-400" />
    所有地區
  </>
);

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

      {/* Phones use the same bottom sheet as the selection UI. */}
      <ActionSheet
        className="md:hidden"
        open={open}
        title={listTitle}
        onClose={close}
      >
        <div className="px-2 pb-2 [&>h2]:hidden">
          <RegionList
            areas={areas}
            selectedAreaId={selectedAreaId}
            onSelect={select}
          />
        </div>
      </ActionSheet>

      {/* Tablets get a floating card under the button, styled like the
          district bottom bar. */}
      {open && (
        <div className="absolute inset-0 z-20 hidden md:max-lg:block">
          <button
            type="button"
            aria-label="關閉所有地區"
            className="absolute inset-0 cursor-default"
            onClick={close}
          />
          <div
            className="absolute left-4 top-16 max-h-[70dvh] w-72
              overflow-y-auto rounded-2xl bg-white/90 p-4 shadow-lg
              backdrop-blur"
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
