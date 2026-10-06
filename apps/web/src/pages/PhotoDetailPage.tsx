import { useNavigate, useParams } from "react-router";
import { TitleBar } from "../components/common/TitleBar";
import { PhotoViewer } from "../components/photo-detail/PhotoViewer";
import { PhotoInfo } from "../components/photo-detail/PhotoInfo";
import type { Area, PhotoDetail } from "../types/gallery.type";
import type { ButtonActionGroup } from "../types/button.type";
import { usePhotoDetailPageController } from "../hooks/usePhotoDetailPageController";

export function PhotoDetailPage() {
  const { areaId, photoId } = useParams();

  const controller = usePhotoDetailPageController({ photoId, areaId });

  const emptyPhoto: PhotoDetail = {
    id: "0",
    title: "",
    summary: "找不到此照片 請返回到上一頁",
    date: "",
    image: "https://placehold.net/default.png",
    collectionIds: [],
    collections: [],
    areaId: areaId ?? "",
  };

  if (!controller.area || !controller.photo || controller.error) {
    return (
      <PhotoDetailContent area={controller.area} photo={emptyPhoto} isError />
    );
  }

  return <PhotoDetailContent area={controller.area} photo={controller.photo} />;
}

type PhotoDetailContentProps = {
  area: Area | null;
  photo: PhotoDetail;
  isError?: boolean;
};

function PhotoDetailContent({ area, photo, isError }: PhotoDetailContentProps) {
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
        areaName={!isError && area ? area.name : "回到地圖"}
        buttonGroup={!isError ? titleButtons : []}
        mobileActions={{ mobileMode: "inline" }}
        onBack={() => navigate(!isError && area ? `/area/${area.id}` : "/")}
      />

      <article className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(16rem,2fr)] lg:gap-10">
        <PhotoViewer photo={photo} />

        <PhotoInfo photo={photo} />
      </article>
    </main>
  );
}
