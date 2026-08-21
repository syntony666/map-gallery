import type { Photo } from "../../types/photo.type";

export type DistrictPopupData = {
  id: string;
  coverImage?: string;
  description?: string;
  photos: Photo[];
};

type DistrictPopupProps = {
  district: DistrictPopupData | null;
};

export function DistrictPopup({ district }: DistrictPopupProps) {
  if (!district) {
    return (
      <div style={{ width: "220px" }}>
        <h3 style={{ margin: "0 0 8px", fontSize: "18px" }}>無資料</h3>
      </div>
    );
  }
  return (
    <div style={{ width: "220px" }}>
      <h3 style={{ margin: "0 0 8px", fontSize: "18px" }}>{district.id}</h3>
      {district.coverImage && (
        <img
          src={district.coverImage}
          alt={district.id}
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
        {district?.description || "尚無介紹內容"}
      </p>
      <div className="flex photos-center justify-between">
        <p className="text-xs text-gray-500">
          項目數：{district.photos.length}
        </p>

        <button
          type="button"
          onClick={() => navigation.navigate(`/district/${district.id}`)}
          className="rounded bg-teal-600 px-2 py-1 text-xs text-white"
        >
          查看內容
        </button>
      </div>
    </div>
  );
}
