import { useNavigate } from "react-router";
import type { Area } from "../../types/gallery.type";

export type AreaPopupData = Area;

type AreaPopupProps = {
  area: AreaPopupData | null;
};

export function AreaPopup({ area }: AreaPopupProps) {
  const navigate = useNavigate();
  if (!area) {
    return (
      <div style={{ width: "220px" }}>
        <h3 style={{ margin: "0 0 8px", fontSize: "18px" }}>無資料</h3>
      </div>
    );
  }

  return (
    <div style={{ width: "220px" }}>
      <h3 style={{ margin: "0 0 8px", fontSize: "18px" }}>{area.name}</h3>

      {area.coverImage && (
        <img
          src={area.coverImage}
          alt={area.name}
          style={{
            width: "100%",
            height: "120px",
            objectFit: "cover",
            borderRadius: "8px",
            marginBottom: "8px",
          }}
        />
      )}

      <p style={{ margin: "0 0 8px", fontSize: "14px", lineHeight: 1.5 }}>
        {area.description || "尚無介紹內容"}
      </p>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">項目數：{area.photoCount}</p>

        <button
          type="button"
          onClick={() => navigate(`/area/${area.id}`)}
          className="rounded bg-teal-600 px-2 py-1 text-xs text-white"
        >
          查看內容
        </button>
      </div>
    </div>
  );
}
