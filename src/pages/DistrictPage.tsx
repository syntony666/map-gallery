import { useLocation, useNavigate, useParams } from "react-router";
import districts from "../data/districts.json";
import { CollectionBar } from "../components/district/CollectionBar";
import { CollectionManageToolbar } from "../components/district/CollectionManageToolbar";
import { DistrictToolbar } from "../components/district/DistrictToolbar";
import { PhotoGrid } from "../components/district/PhotoGrid";
import { TitleBar } from "../components/common/TitleBar";
import type { District } from "../types/district";
import { EmptyState } from "../components/common/EmptyState";
import { PhotoGridToolbar } from "../components/district/PhotoGridToolbar";
import { PhotoSelectionToolbar } from "../components/district/PhotoSelectionToolbar";
import type { ButtonActionGroup } from "../types/button.type";
import { useDistrictPageController } from "../hooks/useDistrictPageController";

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
  district: currentDistrict,
  initialCollectionName,
}: DistrictContentProps) {
  const { district, filters, UI, actions } = useDistrictPageController({
    district: currentDistrict,
    initialCollectionName,
  });

  const isDistrictEmpty = !district.displayed.photos.length;

  return (
    <main className="grid gap-4">
      {/* 標題列 */}
      <TitleBarContent
        districtName={district.displayed.id}
        description={
          UI.isEditingDistrict
            ? "對於這個地方，你想說..."
            : district.displayed.description
        }
        isEditing={UI.isEditing}
        action={actions.titleBar}
      />

      {UI.isEditingDistrict ? (
        /* 說明編輯區 編輯時相簿列隱藏 */
        <textarea
          value={district.draft?.description ?? ""}
          onChange={(event) => actions.updateDescription(event.target.value)}
          rows={3}
          autoFocus
          className="rounded border border-stone-500 bg-white px-2 py-2 
            text-sm text-stone-700 outline-none"
        />
      ) : (
        /* 橫向相簿列 */
        <CollectionBar
          key={UI.isEditingCollection ? "editing" : "browse"}
          collectionGroup={filters.collectionGroup}
          selectedCollectionName={
            filters.selectedCollection ? filters.selectedCollection.name : ""
          }
          onSelect={filters.toggleCollection}
        />
      )}

      {/* Edit mode 的相簿管理列 */}
      {UI.isEditingCollection ? (
        <CollectionManageToolbar
          collection={filters.selectedCollection}
          isPhotoEditing={!!UI.collectionPhotoMode}
          action={actions.collectionToolbar}
        />
      ) : (
        <div className="border-b border-stone-200 -mt-4 pb-4 height" />
      )}

      {/* 搜尋、篩選與排序列 */}
      {!UI.isEditing && (
        <DistrictToolbar
          keyword={filters.keyword}
          sort={filters.sort}
          onKeywordChange={filters.setKeyword}
          onSortChange={filters.setSort}
        />
      )}

      {/* 景點卡片區 */}
      {isDistrictEmpty && (
        <EmptyState title="" description="你來早了 這裡什麼都沒有" />
      )}

      {!isDistrictEmpty && (
        <PhotoGridToolbar
          photoCount={filters.visiblePhotos.length}
          isEditing={UI.isEditing}
        />
      )}

      {!isDistrictEmpty && UI.selectedPhotoIds.size > 0 && (
        <PhotoSelectionToolbar
          selectedCount={UI.selectedPhotoIds.size}
          onClearSelection={actions.clearPhotoSelection}
        />
      )}

      {!isDistrictEmpty && (
        <PhotoGrid
          district={district.displayed.id}
          photos={filters.visiblePhotos}
          isEditMode={!!UI.collectionPhotoMode}
          selectedPhotoIds={UI.selectedPhotoIds}
          onTogglePhotoSelection={actions.togglePhotoSelection}
        />
      )}
    </main>
  );
}

type TitleBarActions = {
  onEditDistrict?: () => void;
  onEditCollection?: () => void;
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
