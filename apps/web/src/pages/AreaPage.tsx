import { useLocation, useNavigate, useParams } from "react-router";
import { CollectionBar } from "../components/area/CollectionBar";
import { CollectionManageToolbar } from "../components/area/CollectionManageToolbar";
import { AreaToolbar } from "../components/area/AreaToolbar";
import { PhotoGrid } from "../components/area/PhotoGrid";
import { TitleBar } from "../components/common/TitleBar";
import { EmptyState } from "../components/common/EmptyState";
import { PhotoGridToolbar } from "../components/area/PhotoGridToolbar";
import { PhotoSelectionToolbar } from "../components/area/PhotoSelectionToolbar";
import type { ButtonActionGroup } from "../types/button.type";
import type { TitleBarActions } from "../types/title-bar.type";
import { useAreaPageController } from "../hooks/useAreaPageController";

export function AreaPage() {
  const { areaId } = useParams();
  const { state } = useLocation();

  if (!areaId) {
    return (
      <div>
        <TitleBarContent areaName="" />
        <EmptyState
          title=""
          description="目前未建立此行政區 請確認網址或聯絡管理員"
        />
      </div>
    );
  }

  return (
    <AreaContent
      areaId={areaId}
      initialCollectionId={state?.collectionId ?? ""}
    />
  );
}

type AreaContentProps = {
  areaId: string;
  initialCollectionId?: string;
};

function AreaContent({ areaId, initialCollectionId }: AreaContentProps) {
  const { error, area, draftDescription, collections, filters, UI, actions } =
    useAreaPageController({
      areaId,
      initialCollectionId,
    });

  const navigate = useNavigate();

  if (error) {
    return (
      <div>
        <TitleBarContent areaName="" />
        <EmptyState title="無法載入行政區" description={error} />
      </div>
    );
  }

  if (!area) {
    return (
      <div>
        <TitleBarContent areaName="" />
        <EmptyState title="載入中…" />
      </div>
    );
  }

  const renderPhotoSection = () => {
    const photos = filters.visiblePhotos;

    if (photos === null) {
      return <EmptyState title="" description="載入中..." />;
    }

    if (photos.length === 0) {
      return (
        <EmptyState
          title=""
          description={
            filters.keyword || filters.selectedCollectionId
              ? "找不到符合條件的內容"
              : "你來早了 這裡什麼都沒有"
          }
        />
      );
    }

    return (
      <>
        <PhotoGridToolbar
          photoCount={photos.length}
          showActions={!UI.isEditMode}
          action={{
            onAddPhoto: () => navigate(`/area/${area.id}/photo/new`),
            onDeletePhoto: actions.startPhotoDeleteSelect,
          }}
        />

        <PhotoGrid
          photos={photos}
          isSelectionMode={!!UI.isPhotoSelectMode}
          selectedPhotoIds={UI.selectedPhotoIds}
          onOpenPhoto={
            UI.isEditMode
              ? undefined
              : (photoId) => navigate(`/area/${area.id}/photo/${photoId}`)
          }
          onTogglePhotoSelection={actions.togglePhotoSelection}
        />
      </>
    );
  };

  return (
    <main className="grid gap-4">
      {/* 標題列 */}
      <TitleBarContent
        areaName={area.name}
        description={
          UI.isAreaEditMode
            ? "對於這個地方，你想說..."
            : area.description
        }
        isEditMode={UI.isEditMode}
        isCollectionEditMode={UI.isCollectionEditMode}
        showActions={!UI.isPhotoSelectMode}
        action={actions.titleBar}
      />

      {UI.isAreaEditMode && draftDescription !== null ? (
        /* 說明編輯區 編輯時相簿列隱藏 */
        <textarea
          value={draftDescription}
          onChange={(event) => actions.updateDescription(event.target.value)}
          rows={3}
          autoFocus
          className="rounded border border-stone-500 bg-white px-2 py-2 
            text-sm text-stone-700 outline-none"
        />
      ) : (
        /* 橫向相簿列 */
        <CollectionBar
          key={UI.isCollectionEditMode ? "editing" : "browse"}
          collections={collections}
          selectedCollectionId={filters.selectedCollectionId}
          onSelect={filters.toggleCollection}
          isEditMode={
            UI.isCollectionEditMode && !UI.isCollectionPhotoSelectMode
          }
          onAdd={actions.onCollectionCreate}
        />
      )}

      {/* Edit mode 的相簿管理列 */}
      {UI.isCollectionEditMode ? (
        <CollectionManageToolbar
          collection={
            collections?.find(
              (collection) => collection.id === filters.selectedCollectionId,
            ) ?? null
          }
          isCollectionPhotoSelectMode={!!UI.collectionPhotoMode}
          action={actions.collectionToolbar}
        />
      ) : (
        <div className="border-b border-stone-200 -mt-4 pb-4" />
      )}

      {/* 搜尋、篩選與排序列 */}
      {!UI.isEditMode && (
        <AreaToolbar
          keyword={filters.keyword}
          sort={filters.sort}
          onKeywordChange={filters.setKeyword}
          onSortChange={filters.setSort}
        />
      )}

      {/* 景點卡片區 */}
      {renderPhotoSection()}

      {UI.isPhotoDeleteSelectMode && (
        <PhotoSelectionToolbar
          selectedCount={UI.selectedPhotoIds.size}
          onConfirmDelete={actions.confirmPhotoDelete}
          onCancel={actions.cancelPhotoDelete}
        />
      )}
    </main>
  );
}

function TitleBarContent({
  areaName,
  description,
  isEditMode = false,
  isCollectionEditMode = false,
  showActions = true,
  action,
}: {
  areaName: string;
  description?: string;
  isEditMode?: boolean;
  isCollectionEditMode?: boolean;
  showActions?: boolean;
  action?: TitleBarActions;
}) {
  const navigate = useNavigate();

  if (!action) {
    return (
      <TitleBar
        areaName={areaName.length !== 0 ? areaName : "回到地圖"}
        description={description}
        onBack={() => navigate("/")}
        buttonGroup={[]}
      />
    );
  }

  const browseButtons: ButtonActionGroup[] = [
    {
      id: "title-browser",
      buttons: [
        {
          id: "manage-description",
          icon: "bi-pencil-square",
          label: "編輯說明",
          onClick: action.onEditArea ?? (() => alert("非預期操作")),
        },
        {
          id: "manage-album",
          icon: "bi-journals",
          label: "編輯相簿",
          onClick: action.onEditCollection ?? (() => alert("非預期操作")),
        },
      ],
    },
  ];

  const editButtons: ButtonActionGroup[] = [
    {
      id: "title-edit",
      buttons: [
        {
          id: "cancel",
          label: "取消",
          icon: "bi-x-lg text-red-700",
          variant: "danger",
          onClick: action.onCancelEdit ?? (() => alert("非預期操作")),
        },
        {
          id: "save",
          label: "儲存",
          variant: "primary",
          icon: "bi-check-lg text-emerald-700",
          onClick: action.onSaveEdit ?? (() => alert("非預期操作")),
        },
      ],
    },
  ];

  const collectionEditButtons: ButtonActionGroup[] = [
    {
      id: "title-collection-edit",
      buttons: [
        {
          id: "done",
          label: "完成",
          icon: "bi-check-lg text-emerald-700",
          variant: "primary",
          onClick: action.onDoneEdit ?? (() => alert("非預期操作")),
        },
      ],
    },
  ];

  const buttons =
    areaName.length === 0 || !showActions
      ? []
      : !isEditMode
        ? browseButtons
        : isCollectionEditMode
          ? collectionEditButtons
          : editButtons;

  return (
    <TitleBar
      areaName={areaName.length !== 0 ? areaName : "回到地圖"}
      description={description}
      onBack={() => navigate("/")}
      buttonGroup={buttons}
      mobileActions={{ mobileMode: "inline" }}
    />
  );
}
