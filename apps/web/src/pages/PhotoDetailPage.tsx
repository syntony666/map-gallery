import { useNavigate, useParams } from "react-router";
import { TitleBar } from "../components/common/TitleBar";
import { BottomBar } from "../components/common/BottomBar";
import { BottomBarStack } from "../components/common/BottomBarStack";
import { ButtonGroup } from "../components/common/ButtonGroup";
import { PhotoViewer } from "../components/photo-detail/PhotoViewer";
import { PhotoInfo } from "../components/photo-detail/PhotoInfo";
import { EmptyState } from "../components/common/EmptyState";
import { galleryStore } from "../stores/gallery.store";
import { alertMessage } from "../utils/alert";
import { pageBottomPad } from "../utils/ui-classes";
import { useDialogs } from "../hooks/useDialogs";
import type { Area, PhotoDetail } from "../types/gallery.type";
import type { ButtonActionGroup } from "../types/button.type";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { usePhotoDetailPageController } from "../hooks/usePhotoDetailPageController";
import { useViewMode } from "../hooks/useViewMode";

export function PhotoDetailPage() {
  const { areaId, photoId } = useParams();
  const navigate = useNavigate();

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

  if (!photoId || !areaId || controller.error) {
    return (
      <PhotoDetailContent area={controller.area} photo={emptyPhoto} isError />
    );
  }

  if (!controller.area || !controller.photo) {
    return (
      <main>
        <TitleBar areaName="回到地圖" onBack={() => navigate("/")} />
        <EmptyState title="載入中…" />
      </main>
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
  const { readonly } = useViewMode();
  const dialogs = useDialogs();

  useDocumentTitle(isError ? null : photo.title);

  async function deletePhoto() {
    const confirmed = await dialogs.confirm(
      `確定要刪除「${photo.title}」嗎？`,
      { danger: true },
    );

    if (!confirmed) {
      return;
    }

    try {
      await galleryStore.deletePhotos([photo.id]);
      navigate(area ? `/area/${area.id}` : "/");
    } catch (reason) {
      await dialogs.alert(alertMessage(reason, "刪除失敗"));
    }
  }

  const titleButtons: ButtonActionGroup[] = [
    {
      id: "photo-detail",
      buttons: [
        {
          id: "delete-photo-detail",
          label: "刪除",
          icon: "bi-trash3",
          variant: "danger",
          onClick: deletePhoto,
        },
        {
          id: "manage-photo-detail",
          label: "編輯",
          icon: "bi-pencil-square",
          onClick: () =>
            navigate(`/area/${photo.areaId}/photo/${photo.id}/edit`),
        },
      ],
    },
  ];

  const showActions = !isError && !readonly;

  return (
    <main className={showActions ? pageBottomPad : ""}>
      <TitleBar
        areaName={!isError && area ? area.name : "回到地圖"}
        headingLevel={2}
        buttonGroup={showActions ? titleButtons : []}
        mobileActions={{ mobileMode: "none", breakpoint: "lg" }}
        onBack={() => navigate(!isError && area ? `/area/${area.id}` : "/")}
      />

      <article className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(16rem,2fr)] lg:gap-10">
        <PhotoViewer photo={photo} />

        <PhotoInfo photo={photo} />
      </article>

      {showActions && (
        <BottomBarStack className="lg:hidden">
          <BottomBar
            className="text-sm"
            actions={
              <ButtonGroup
                groups={titleButtons}
                mobileMode="inline"
                breakpoint="md"
                translucent
              />
            }
          >
            <p className="min-w-0 flex-1 truncate text-ink-muted">編輯模式</p>
          </BottomBar>
        </BottomBarStack>
      )}
    </main>
  );
}
