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
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  if (isDesktop) {
    return null;
  }

  return (
    <ActionSheet
      open={area !== null}
      title={area?.name}
      onClose={onClose}
    >
      <div className="px-2 pb-2">
        <DistrictInfo area={area} heading={false} />
      </div>
    </ActionSheet>
  );
}
