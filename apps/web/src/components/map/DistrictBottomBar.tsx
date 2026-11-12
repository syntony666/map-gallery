import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { Area } from "../../types/gallery.type";
import { ActionSheet } from "../common/ActionSheet";
import { DistrictInfo } from "./DistrictInfo";

type DistrictBottomBarProps = {
  area: Area | null;
  onClose: () => void;
};

export function DistrictBottomBar({ area, onClose }: DistrictBottomBarProps) {
  const [isMdUp, setIsMdUp] = useState(false);
  const [isLgUp, setIsLgUp] = useState(false);

  useEffect(() => {
    const mdQuery = window.matchMedia("(min-width: 768px)");
    const lgQuery = window.matchMedia("(min-width: 1024px)");
    const update = () => {
      setIsMdUp(mdQuery.matches);
      setIsLgUp(lgQuery.matches);
    };
    update();
    mdQuery.addEventListener("change", update);
    lgQuery.addEventListener("change", update);
    return () => {
      mdQuery.removeEventListener("change", update);
      lgQuery.removeEventListener("change", update);
    };
  }, []);

  if (isLgUp) {
    return null;
  }

  return (
    <>
      {isMdUp &&
        (area === null ? (
          <div
            className="absolute inset-x-4 bottom-4 z-10 rounded-2xl bg-white/90
              px-5 py-3 text-sm text-stone-500 shadow-lg backdrop-blur"
          >
            點選地圖上的縣市，查看簡介與照片。
          </div>
        ) : (
          <div
            className="absolute inset-x-4 bottom-4 z-10 flex items-center gap-3
              rounded-2xl bg-white/90 px-4 py-3 shadow-lg backdrop-blur"
          >
            {area.coverImage && (
              <img
                src={area.coverImage}
                alt=""
                className="h-12 w-20 rounded-md object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-stone-800">
                {area.name}
              </p>
              <p className="text-xs text-stone-500">
                {area.photoCount} 張照片
              </p>
            </div>
            <Link
              to={`/area/${area.id}`}
              className="shrink-0 rounded bg-stone-200 px-3 py-1.5 text-xs
                text-stone-800 hover:bg-stone-300"
            >
              查看內容
            </Link>
            <button
              type="button"
              onClick={onClose}
              aria-label="關閉簡介"
              className="shrink-0 rounded bg-white px-2 py-1 text-stone-700
                shadow hover:bg-stone-50"
            >
              <i className="bi bi-x-lg" />
            </button>
          </div>
        ))}

      {!isMdUp && (
        <ActionSheet
          open={area !== null}
          title={area?.name}
          onClose={onClose}
        >
          <div className="px-2 pb-2">
            <DistrictInfo area={area} heading={false} />
          </div>
        </ActionSheet>
      )}
    </>
  );
}
