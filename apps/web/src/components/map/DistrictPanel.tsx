import type { Area } from "../../types/gallery.type";
import { DistrictInfo } from "./DistrictInfo";

type DistrictPanelProps = {
  area: Area | null;
};

export function DistrictPanel({ area }: DistrictPanelProps) {
  return (
    <aside
      aria-label="地區簡介"
      className="hidden overflow-y-auto rounded-2xl bg-white/90 p-5
        shadow-lg backdrop-blur lg:block"
    >
      <DistrictInfo area={area} />
    </aside>
  );
}
