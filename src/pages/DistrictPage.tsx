import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import districts from "../data/districts.json";
import { CollectionBar } from "../components/district/CollectionBar";
import { CollectionManageToolbar } from "../components/district/CollectionManageToolbar";
import { DistrictToolbar } from "../components/district/DistrictToolbar";
import { useDistrictState } from "../hooks/useDistrictState";
import { useDistrictEditor } from "../hooks/useDistrictEditor";
import { PhotoGrid } from "../components/district/PhotoGrid";
import type { TitleBarButton } from "../types/title-bar.type";
import { TitleBar } from "../components/common/TitleBar";
import type { District } from "../types/district";
import { EmptyState } from "../components/common/EmptyState";
import { PhotoGridToolbar } from "../components/district/PhotoGridToolbar";

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
  const [isEditMode, setIsEditMode] = useState(false);

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
  } = useDistrictState(
    displayedDistrict.photos,
    isEditMode,
    initialCollectionName,
  );

  const isDistrictEmpty = !displayedDistrict.photos.length;

  function handleStartEditing() {
    startEditing();
    setIsEditMode(true);
  }

  function handleCancelEditing() {
    cancelEditing();
    setIsEditMode(false);
    setCollectionName("");
  }

  function handleSaveChanges() {
    saveChanges();
    setIsEditMode(false);
    setCollectionName("");
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

  console.log("collectionName", collectionName);

  return (
    <main className="grid gap-4">
      {/* 標題列 */}
      <TitleBarContent
        districtName={displayedDistrict.id}
        description={
          isEditMode ? "對於這個地方，你想說..." : displayedDistrict.description
        }
        isEditing={isEditMode}
        onStartEditing={handleStartEditing}
        onCancelEdit={handleCancelEditing}
        onSaveEdit={handleSaveChanges}
      />

      {isEditMode && (
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
        key={isEditMode ? "editing" : "browse"}
        collectionGroup={collectionGroup}
        selectedCollectionName={collectionName}
        onSelect={toggleCollection}
      />

      {/* Edit mode 的 Collection 管理列 */}
      {isEditMode && selectedCollection && (
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

      {!isDistrictEmpty && (
        <PhotoGrid district={displayedDistrict.id} photos={visiblePhotos} />
      )}
    </main>
  );
}

function TitleBarContent({
  districtName,
  description,
  isEditing = false,
  onStartEditing,
  onCancelEdit,
  onSaveEdit,
}: {
  districtName: string;
  description?: string;
  isEditing?: boolean;
  onStartEditing?: () => void;
  onCancelEdit?: () => void;
  onSaveEdit?: () => void;
}) {
  const navigate = useNavigate();

  const browseButtons: TitleBarButton[] = [
    {
      id: "manage",
      icon: "bi-pencil-square",
      onClick: onStartEditing ?? (() => alert("非預期操作")),
    },
  ];

  const editButtons: TitleBarButton[] = [
    {
      id: "cancel",
      icon: "bi-x-lg text-red-700",
      onClick: onCancelEdit ?? (() => alert("非預期操作")),
    },
    {
      id: "save",
      icon: "bi-check-lg text-emerald-700",
      onClick: onSaveEdit ?? (() => alert("非預期操作")),
    },
  ];

  const buttons =
    districtName.length === 0
      ? undefined
      : isEditing
        ? editButtons
        : browseButtons;

  return (
    <TitleBar
      districtName={districtName.length !== 0 ? districtName : "回到地圖"}
      description={description}
      onBack={() => navigate("/")}
      buttons={buttons}
    />
  );
}
