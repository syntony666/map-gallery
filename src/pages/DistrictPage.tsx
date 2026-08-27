import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import districts from "../data/districts.json";
import { CollectionBar } from "../components/district/CollectionBar";
import { CollectionManageToolbar } from "../components/district/CollectionManageToolbar";
import { DistrictToolbar } from "../components/district/DistrictToolbar";
import { useDistrictState } from "../hooks/useDistrictState";
import { useDistrictEditor } from "../hooks/useDistrictEditor";
import { PhotoGrid } from "../components/district/PhotoGrid";
import { TitleBar } from "../components/common/TitleBar";
import type { District } from "../types/district";
import { EmptyState } from "../components/common/EmptyState";
import { PhotoGridToolbar } from "../components/district/PhotoGridToolbar";
import { PhotoSelectionToolbar } from "../components/district/PhotoSelectionToolbar";
import type { ButtonActionGroup } from "../types/button.type";
import type { PageMode } from "../types/title-bar.type";

export function DistrictPage() {
  const { districtId } = useParams();
  const { state } = useLocation();

  const district = districts.find((item) => item.id === districtId);

  if (!district) {
    return (
      <div>
        <TitleBarContent districtName="" />
        <EmptyState
          title=""
          description="目前未建立此行政區 請確認網址或聯絡管理員"
        />
      </div>
    );
  }

  return (
    <DistrictContent
      district={district}
      initialCollectionName={state?.collectionName ?? ""}
    />
  );
}

type DistrictContentProps = {
  district: District;
  initialCollectionName?: string;
};

function DistrictContent({
  district,
  initialCollectionName,
}: DistrictContentProps) {
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [pageMode, setPageMode] = useState<PageMode>("browse");
  const isEditMode = useMemo(() => pageMode !== "browse", [pageMode]);

  const {
    currentDistrict,
    draftDistrict,
    startEditing,
    cancelEditing,
    updateDescription,
    renameCollection,
    removeCollection,
    saveChanges,
  } = useDistrictEditor(district);

  const displayedDistrict =
    isEditMode && draftDistrict ? draftDistrict : currentDistrict;

  const {
    keyword,
    setKeyword,
    sort,
    setSort,
    collectionName,
    setCollectionName,
    toggleCollection,
    selectedCollection,
    collectionGroup,
    visiblePhotos,
  } = useDistrictState(displayedDistrict.photos, initialCollectionName);

  const isDistrictEmpty = !displayedDistrict.photos.length;

  function clearPhotoSelection() {
    setSelectedPhotoIds(new Set());
  }

  function togglePhotoSelection(photoId: string) {
    setSelectedPhotoIds((current) => {
      const next = new Set(current);

      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }

      return next;
    });
  }

  function handleRenameCollection(currentName: string) {
    const nextName = window.prompt("修改 Collection 名稱", currentName);

    if (nextName === null) return;

    const normalizedName = nextName.trim();

    if (!normalizedName || normalizedName === currentName) return;

    renameCollection(currentName, normalizedName);
    setCollectionName(normalizedName);
  }

  function handleRemoveCollection(collectionName: string, photoCount: number) {
    const confirmed = window.confirm(
      `要從 ${photoCount} 張照片中移除「${collectionName}」嗎？\n\n` +
        "這不會刪除照片，只會移除此 Collection 標記。",
    );

    if (!confirmed) return;

    removeCollection(collectionName);
    setCollectionName("");
  }

  const titleBarActions: TitleBarActions = {
    onEditDistrict: () => {
      startEditing();
      setPageMode("editDistrict");
    },
    onEditAlbum: () => {
      startEditing();
      setPageMode("editCollection");
      clearPhotoSelection();
    },
    onCancelEdit: () => {
      cancelEditing();
      setPageMode("browse");
      setCollectionName("");
      clearPhotoSelection();
    },
    onSaveEdit: () => {
      saveChanges();
      setPageMode("browse");
      setCollectionName("");
      clearPhotoSelection();
    },
  };

  return (
    <main className="grid gap-4">
      {/* 標題列 */}
      <TitleBarContent
        districtName={displayedDistrict.id}
        description={
          pageMode === "editDistrict"
            ? "對於這個地方，你想說..."
            : displayedDistrict.description
        }
        isEditing={isEditMode}
        action={titleBarActions}
      />

      {pageMode === "editDistrict" && (
        <textarea
          value={draftDistrict?.description ?? ""}
          onChange={(event) => updateDescription(event.target.value)}
          rows={3}
          autoFocus
          className="rounded border border-stone-500 bg-white px-2 py-2 
            text-sm text-stone-700 outline-none"
        />
      )}

      {/* 橫向 Collection 列 */}
      <CollectionBar
        key={pageMode === "editCollection" ? "editing" : "browse"}
        collectionGroup={collectionGroup}
        selectedCollectionName={collectionName}
        onSelect={toggleCollection}
      />

      {/* Edit mode 的 Collection 管理列 */}
      {pageMode === "editCollection" && selectedCollection && (
        <CollectionManageToolbar
          collection={selectedCollection}
          onRename={handleRenameCollection}
          onRemove={handleRemoveCollection}
        />
      )}

      <div className="border-b border-stone-200 -mt-4 pb-4 height" />

      {/* 搜尋、篩選與排序列 */}
      {!isEditMode && (
        <DistrictToolbar
          keyword={keyword}
          sort={sort}
          onKeywordChange={setKeyword}
          onSortChange={setSort}
        />
      )}

      {/* 景點卡片區 */}
      {isDistrictEmpty && (
        <EmptyState title="" description="你來早了 這裡什麼都沒有" />
      )}

      {!isDistrictEmpty && (
        <PhotoGridToolbar
          photoCount={visiblePhotos.length}
          isEditing={isEditMode}
        />
      )}

      {!isDistrictEmpty && selectedPhotoIds.size > 0 && (
        <PhotoSelectionToolbar
          selectedCount={selectedPhotoIds.size}
          onClearSelection={clearPhotoSelection}
        />
      )}

      {!isDistrictEmpty && (
        <PhotoGrid
          district={displayedDistrict.id}
          photos={visiblePhotos}
          isEditMode={pageMode === "editPhoto"}
          selectedPhotoIds={selectedPhotoIds}
          onTogglePhotoSelection={togglePhotoSelection}
        />
      )}
    </main>
  );
}

type TitleBarActions = {
  onEditDistrict?: () => void;
  onEditAlbum?: () => void;
  onCancelEdit?: () => void;
  onSaveEdit?: () => void;
};

function TitleBarContent({
  districtName,
  description,
  isEditing = false,
  action,
}: {
  districtName: string;
  description?: string;
  isEditing?: boolean;
  action?: TitleBarActions;
}) {
  const navigate = useNavigate();
  console.log("action", action);

  if (!action) {
    return (
      <TitleBar
        districtName={districtName.length !== 0 ? districtName : "回到地圖"}
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
          onClick: action.onEditDistrict ?? (() => alert("非預期操作")),
        },
        {
          id: "manage-album",
          icon: "bi-journals",
          label: "編輯相簿",
          onClick: action.onEditAlbum ?? (() => alert("非預期操作")),
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
    districtName.length === 0 ? [] : isEditing ? editButtons : browseButtons;

  return (
    <TitleBar
      districtName={districtName.length !== 0 ? districtName : "回到地圖"}
      description={description}
      onBack={() => navigate("/")}
      buttonGroup={buttons}
      mobileActions={{ mobileMode: "inline" }}
    />
  );
}
