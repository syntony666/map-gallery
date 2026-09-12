import { useNavigate, useParams } from "react-router";
import areas from "../data/districts.json";
import { TitleBar } from "../components/common/TitleBar";
import { PhotoViewer } from "../components/photo-detail/PhotoViewer";
import { PhotoInfo } from "../components/photo-detail/PhotoInfo";
import type { Photo } from "../types/gallery.type";
import type { ButtonActionGroup } from "../types/button.type";

export function PhotoDetailPage() {
  const { areaId, photoId } = useParams();

  const area = areas.find((area) => area.id === areaId);

  const emptyPhoto: Photo = {
    id: "0",
    title: "",
    summary: "找不到此照片 請返回到上一頁",
    date: "",
    image: "https://placehold.net/default.png",
    collectionIds: [],
  };

  if (!area) {
    return <PhotoDetailContent areaName="" photo={emptyPhoto} isError />;
  }

  const photo = area.photos.find((photo) => photo.id === photoId) as Photo;

  if (!photo) {
    return <PhotoDetailContent areaName={area.id} photo={emptyPhoto} isError />;
  }

  return <PhotoDetailContent areaName={area.id} photo={photo} />;
}

type PhotoDetailContentProps = {
  areaName: string;
  photo: Photo;
  isError?: boolean;
};

function PhotoDetailContent({
  areaName,
  photo,
  isError,
}: PhotoDetailContentProps) {
  const navigate = useNavigate();

  const titleButtons: ButtonActionGroup[] = [
    {
      id: "photo-detail",
      buttons: [
        {
          id: "manage-photo-detail",
          label: "",
          icon: "bi-pencil-square",
          onClick: () => {
            alert("編輯模式未實作");
          },
        },
      ],
    },
  ];
  return (
    <main>
      <TitleBar
        areaName={!isError ? areaName : "回到地圖"}
        buttonGroup={!isError ? titleButtons : []}
        mobileActions={{ mobileMode: "inline" }}
        onBack={() => navigate(!isError ? `/area/${areaName}` : "/")}
      />

      <article className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(16rem,2fr)] lg:gap-10">
        <PhotoViewer photo={photo} />

        <PhotoInfo areaName={areaName} photo={photo} />
      </article>
    </main>
  );
}
