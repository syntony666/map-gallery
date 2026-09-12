import type { Photo } from "../../types/gallery.type";

export type AreaPopupData = {
  id: string;
  coverImage?: string;
  description?: string;
  photos: Photo[];
};

type AreaPopupProps = {
  area: AreaPopupData | null;
};

export function AreaPopup({ area }: AreaPopupProps) {
  if (!area) {
    return (
      <div style={{ width: "220px" }}>
        <h3 style={{ margin: "0 0 8px", fontSize: "18px" }}>無資料</h3>
      </div>
    );
  }
  return (
    <div style={{ width: "220px" }}>
      <h3 style={{ margin: "0 0 8px", fontSize: "18px" }}>{area.id}</h3>
      {area.coverImage && (
        <img
          src={area.coverImage}
          alt={area.id}
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
        {area?.description || "尚無介紹內容"}
      </p>
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">項目數：{area.photos.length}</p>

        <button
          type="button"
          onClick={() => navigation.navigate(`/area/${area.id}`)}
          className="rounded bg-teal-600 px-2 py-1 text-xs text-white"
        >
          查看內容
        </button>
      </div>
    </div>
  );
}
