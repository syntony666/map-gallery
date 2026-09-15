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
  const { error, area, collections, filters, UI, actions } =
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

  if (!area.displayed) {
    return (
      <div>
        <TitleBarContent areaName="" />
        <EmptyState title="載入中…" />
      </div>
    );
  }

  return (
    <main className="grid gap-4">
      {/* 標題列 */}
      <TitleBarContent
        areaName={area.displayed.name}
        description={
          UI.isAreaEditMode
            ? "對於這個地方，你想說..."
            : area.displayed.description
        }
        isEditMode={UI.isEditMode}
        showActions={!UI.isPhotoDeleteSelectMode}
        action={actions.titleBar}
      />

      {UI.isAreaEditMode && area.draft ? (
        /* 說明編輯區 編輯時相簿列隱藏 */
        <textarea
          value={area.draft.description ?? ""}
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
      {filters.visiblePhotos?.length === 0 && (
        <EmptyState title="" description="你來早了 這裡什麼都沒有" />
      )}

      {filters.visiblePhotos === null && (
        <EmptyState title="" description="載入中..." />
      )}

      {!(filters.visiblePhotos?.length === 0) &&
        filters.visiblePhotos !== null && (
          <PhotoGridToolbar
            photoCount={filters.visiblePhotos.length}
            showActions={!UI.isEditMode}
            action={{
              onAddPhoto: () =>
                navigate(`/area/${area.displayed?.id}/photo/new`),
              onDeletePhoto: actions.startPhotoDeleteSelect,
            }}
          />
        )}

      {UI.isPhotoDeleteSelectMode && (
        <PhotoSelectionToolbar
          selectedCount={UI.selectedPhotoIds.size}
          onConfirmDelete={actions.confirmPhotoDelete}
          onCancel={actions.cancelPhotoDelete}
        />
      )}

      {!(filters.visiblePhotos?.length === 0) && !!filters.visiblePhotos && (
        <PhotoGrid
          areaId={area.displayed.id}
          photos={filters.visiblePhotos}
          isSelectionMode={!!UI.isPhotoSelectMode}
          selectedPhotoIds={UI.selectedPhotoIds}
          onTogglePhotoSelection={actions.togglePhotoSelection}
        />
      )}
    </main>
  );
}

type TitleBarActions = {
  onEditArea?: () => void;
  onEditCollection?: () => void;
  onCancelEdit?: () => void;
  onSaveEdit?: () => void;
};

function TitleBarContent({
  areaName,
  description,
  isEditMode = false,
  showActions = true,
  action,
}: {
  areaName: string;
  description?: string;
  isEditMode?: boolean;
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

  const buttons =
    areaName.length === 0 || !showActions
      ? []
      : isEditMode
        ? editButtons
        : browseButtons;

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
