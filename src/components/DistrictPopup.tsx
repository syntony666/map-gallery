type Item = {
  id: string;
  title: string;
  thumbnail?: string;
  image: string;
  summary?: string;
  description?: string;
};

export type DistrictPopupData = {
  districtId: string;
  coverImage?: string;
  description?: string;
  items: Item[];
};

type DistrictPopupProps = {
  district: DistrictPopupData | null;
};

export function DistrictPopup({ district }: DistrictPopupProps) {
  return (
    <div style={{ width: "220px" }}>
      <h3 style={{ margin: "0 0 8px", fontSize: "18px" }}>
        {district?.districtId}
      </h3>
      {district?.coverImage && (
        <img
          src={district.coverImage}
          alt={district.districtId}
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
      <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>
        項目數：{district?.items?.length ?? 0}
      </p>
    </div>
  );
}
