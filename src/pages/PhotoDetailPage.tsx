import { useNavigate, useParams } from "react-router";
import districts from "../data/districts.json";
import { TitleBar } from "../components/common/TitleBar";
import { PhotoViewer } from "../components/photo-detail/PhotoViewer";
import { PhotoInfo } from "../components/photo-detail/PhotoInfo";
import type { Photo } from "../types/photo.type";
import type { TitleBarButton } from "../types/title-bar.type";

export function PhotoDetailPage() {
  const { districtId, photoId } = useParams();

  const district = districts.find((district) => district.id === districtId);

  const emptyPhoto = {
    id: "0",
    title: "",
    summary: "找不到此照片 請返回到上一頁",
    date: "",
    image: "https://placehold.net/default.png",
  };

  if (!district) {
    return <PhotoDetailContent districtName="" photo={emptyPhoto} isError />;
  }

  const photo = district.photos.find((photo) => photo.id === photoId);

  if (!photo) {
    return (
      <PhotoDetailContent
        districtName={district.id}
        photo={emptyPhoto}
        isError
      />
    );
  }

  return <PhotoDetailContent districtName={district.id} photo={photo} />;
}

type PhotoDetailContentProps = {
  districtName: string;
  photo: Photo;
  isError?: boolean;
};

function PhotoDetailContent({
  districtName,
  photo,
  isError,
}: PhotoDetailContentProps) {
  const navigate = useNavigate();

  const titleButtons: TitleBarButton[] = [
    {
      id: "manage",
      label: "",
      icon: "bi-pencil-square",
      onClick: () => {
        console.log("開啟管理模式");
      },
    },
  ];
  return (
    <main>
      <TitleBar
        districtName={!isError ? districtName : "回到地圖"}
        buttons={!isError ? titleButtons : undefined}
        onBack={() => navigate(!isError ? `/district/${districtName}` : "/")}
      />

      <article className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(16rem,2fr)] lg:gap-10">
        <PhotoViewer photo={photo} />

        <PhotoInfo districtName={districtName} photo={photo} />
      </article>
    </main>
  );
}
