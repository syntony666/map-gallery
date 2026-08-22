import { useLocation, useNavigate, useParams } from "react-router";
import districts from "../data/districts.json";
import { CollectionBar } from "../components/district/CollectionBar";
import { DistrictToolbar } from "../components/district/DistrictToolbar";
import { useDistrictFilters } from "../hooks/useDistrictFilters";
import { useDistrictEditor } from "../hooks/useDistrictEditor";
import { PhotoGrid } from "../components/district/PhotoGrid";
import type { TitleBarButton } from "../types/title-bar.type";
import { TitleBar } from "../components/common/TitleBar";
import type { District } from "../types/district";
import { EmptyState } from "../components/common/EmptyState";

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
  const {
    currentDistrict,
    draftDistrict,
    isEditing,
    startEditing,
    cancelEditing,
    updateDescription,
    saveChanges,
  } = useDistrictEditor(district);

  const displayedDistrict =
    isEditing && draftDistrict ? draftDistrict : currentDistrict;

  const {
    keyword,
    setKeyword,
    sort,
    setSort,
    collectionName,
    toggleCollection,
    collectionGroup,
    visiblePhotos,
  } = useDistrictFilters(displayedDistrict.photos, initialCollectionName);

  const isDistrictEmpty = !displayedDistrict.photos.length;

  return (
    <main>
      {/* 標題列 */}
      <TitleBarContent
        districtName={displayedDistrict.id}
        description={
          isEditing ? "對於這個地方，你想說..." : displayedDistrict.description
        }
        isEditing={isEditing}
        onStartEditing={startEditing}
        onCancelEdit={cancelEditing}
        onSaveEdit={saveChanges}
      />

      {isEditing && (
        <textarea
          value={draftDistrict?.description ?? ""}
          onChange={(event) => updateDescription(event.target.value)}
          rows={3}
          autoFocus
          className="w-full rounded border text-sm border-stone-500 bg-white 
              mt-2 mx-2 px-2 pt-2 text-stone-700 outline-none"
        />
      )}

      {/* 橫向圖片列 */}
      <CollectionBar
        collectionGroup={collectionGroup}
        collectionName={collectionName}
        onSelect={toggleCollection}
      />
      {/* 搜尋、篩選與排序列 */}
      <DistrictToolbar
        keyword={keyword}
        sort={sort}
        onKeywordChange={setKeyword}
        onSortChange={setSort}
      />
      {/* 景點卡片區 */}
      {isDistrictEmpty && (
        <EmptyState title="" description="你來早了 這裡什麼都沒有" />
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
