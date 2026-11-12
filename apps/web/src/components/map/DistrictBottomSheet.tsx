import { useEffect, useState } from "react";
import type { Area } from "../../types/gallery.type";
import { ActionSheet } from "../common/ActionSheet";
import { DistrictInfo } from "./DistrictInfo";

type DistrictBottomSheetProps = {
  area: Area | null;
  onClose: () => void;
};

export function DistrictBottomSheet({
  area,
  onClose,
}: DistrictBottomSheetProps) {
  const [isWide, setIsWide] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1280px)");
    const update = () => setIsWide(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  if (isWide) {
    return null;
  }

  return (
    <>
      {area === null && (
        <div
          className="absolute inset-x-4 bottom-4 z-10 rounded-2xl
            bg-white/90 px-5 py-3 text-sm text-stone-500 shadow-lg
            backdrop-blur"
        >
          點選地圖上的縣市，查看簡介與照片。
        </div>
      )}

      <ActionSheet
        open={area !== null}
        title={area?.name}
        onClose={onClose}
      >
        <div className="px-2 pb-2">
          <DistrictInfo area={area} heading={false} />
        </div>
      </ActionSheet>
    </>
  );
}
