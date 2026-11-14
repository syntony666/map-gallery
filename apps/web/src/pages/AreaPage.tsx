import { useLocation, useNavigate, useParams } from "react-router";
import { BottomBar } from "../components/common/BottomBar";
import { BottomBarOverlay } from "../components/common/BottomBarOverlay";
import { BottomBarStack } from "../components/common/BottomBarStack";
import { menuSections } from "../utils/menu";
import { Button } from "../components/common/Button";
import { ButtonGroup } from "../components/common/ButtonGroup";
import { CollectionBar } from "../components/area/CollectionBar";
import { CollectionManageToolbar } from "../components/area/CollectionManageToolbar";
import { AreaToolbar } from "../components/area/AreaToolbar";
import { PhotoGrid } from "../components/area/PhotoGrid";
import { TitleBar } from "../components/common/TitleBar";
import { EmptyState } from "../components/common/EmptyState";
import { PhotoGridToolbar } from "../components/area/PhotoGridToolbar";
import { PhotoPagination } from "../components/area/PhotoPagination";
import { PhotoSelectionToolbar } from "../components/area/PhotoSelectionToolbar";
import type { ButtonActionGroup, ButtonConfig } from "../types/button.type";
import type { TitleBarActions } from "../hooks/useAreaPageController";
import { useAreaPageController } from "../hooks/useAreaPageController";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useResetState } from "../hooks/useResetState";
import { inputClassName } from "../utils/field-classes";
import { pageBottomPad } from "../utils/layout-classes";
import { useViewMode } from "../hooks/useViewMode";
import { getPhotoGridHeading } from "../utils/photo-grid-heading";

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

  const { readonly } = useViewMode();
  // Mode switches unmount the bar but keep this state; closing the menu on
  // mode change prevents it from reopening when the bar comes back.
  const [photoMenuOpen, setPhotoMenuOpen] = useResetState(
    false,
    UI.isEditMode,
  );
  useDocumentTitle(area?.name);
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

  const { title: photoGridTitle, hint: photoGridHint } = getPhotoGridHeading({
    UI,
    filters,
    collections,
  });

  const titleButtons = readonly
    ? []
    : buildButtons(
        area.name,
        !UI.isPhotoSelectMode,
        UI.isEditMode,
        UI.isCollectionEditMode,
        actions.titleBar,
      );

  const collectionDoneGroup: ButtonActionGroup[] = [
    {
      id: "collection-edit-done",
      buttons: [
        {
          id: "done",
          label: "完成",
          icon: "bi-check-lg",
          variant: "primary",
          onClick: actions.titleBar.onDoneEdit ?? (() => alert("非預期操作")),
        },
      ],
    },
  ];

  const photoMenuGroups: ButtonActionGroup[] =
    !UI.isEditMode && !readonly
      ? [
          {
            id: "photo-actions",
            buttons: [
              {
                id: "photo-add",
                label: "新增照片",
                icon: "bi-plus-lg",
                onClick: () => navigate(`/area/${area.id}/photo/new`),
              },
              ...(filters.visiblePhotos && filters.visiblePhotos.length > 0
                ? [
                    {
                      id: "photo-delete",
                      label: "刪除照片",
                      icon: "bi-trash3",
                      onClick: actions.startPhotoDeleteSelect,
                    } satisfies ButtonConfig,
                  ]
                : []),
            ],
          },
        ]
      : [];

  const renderPhotoSection = () => {
    if (filters.photosError) {
      return (
        <EmptyState title="無法載入照片" description={filters.photosError} />
      );
    }

    const photos = filters.visiblePhotos;

    if (photos === null) {
      return <EmptyState title="" description="載入中..." />;
    }

    if (photos.length === 0) {
      return (
        <>
          <PhotoGridToolbar
            title={photoGridTitle}
            hint={photoGridHint}
            photoCount={0}
            showActions={!UI.isEditMode && !readonly}
            action={{
              onAddPhoto: () => navigate(`/area/${area.id}/photo/new`),
            }}
          />
          <EmptyState
            title=""
            description={
              filters.keyword || filters.selectedCollectionId
                ? "找不到符合條件的內容"
                : "你來早了 這裡什麼都沒有"
            }
          />
        </>
      );
    }

    return (
      <>
        <PhotoGridToolbar
          title={photoGridTitle}
          hint={photoGridHint}
          photoCount={filters.pagination?.total ?? photos.length}
          showActions={!UI.isEditMode && !readonly}
          action={{
            onAddPhoto: () => navigate(`/area/${area.id}/photo/new`),
            onDeletePhoto: actions.startPhotoDeleteSelect,
          }}
        />

        <PhotoGrid
          photos={photos}
          isSelectionMode={!!UI.isPhotoSelectMode || UI.isAreaEditMode}
          selectedPhotoIds={UI.selectedPhotoIds}
          photoTo={
            UI.isEditMode
              ? undefined
              : (photoId) => `/area/${area.id}/photo/${photoId}`
          }
          onTogglePhotoSelection={actions.togglePhotoSelection}
        />

        {filters.pagination && filters.pagination.totalPages > 1 && (
          <PhotoPagination
            page={filters.page}
            totalPages={filters.pagination.totalPages}
            onPageChange={filters.setPage}
          />
        )}
      </>
    );
  };

  // Reserve space for the floating bottom bar below lg.
  const needsBottomBarSpace = !readonly;

  return (
    <main
      className={`grid gap-4 [overflow-anchor:none] ${needsBottomBarSpace ? pageBottomPad : ""}`}
    >
      <TitleBarContent
        areaName={area.name}
        description={
          UI.isAreaEditMode ? "對於這個地方，你想說..." : area.description
        }
        buttonGroup={titleButtons}
      />

      {UI.isAreaEditMode && draftDescription !== null ? (
        <textarea
          value={draftDescription}
          onChange={(event) => actions.updateDescription(event.target.value)}
          rows={3}
          className={inputClassName}
        />
      ) : (
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

      {UI.isCollectionEditMode ? (
        <CollectionManageToolbar
          collection={
            collections?.find(
              (collection) => collection.id === filters.selectedCollectionId,
            ) ?? null
          }
          isCollectionPhotoSelectMode={!!UI.collectionPhotoMode}
          action={actions.collectionToolbar}
          extraGroups={collectionDoneGroup}
        />
      ) : null}

      {!UI.isEditMode && (
        <AreaToolbar
          keyword={filters.keyword}
          sort={filters.sort}
          onKeywordChange={filters.setKeyword}
          onSortChange={filters.setSort}
        />
      )}

      {UI.isPhotoDeleteSelectMode && (
        <PhotoSelectionToolbar
          selectedCount={UI.selectedPhotoIds.size}
          onConfirmDelete={actions.confirmPhotoDelete}
          onCancel={actions.cancelPhotoDelete}
        />
      )}

      {renderPhotoSection()}

      {titleButtons.length > 0 && (
        <BottomBarStack
          className="lg:hidden"
          overlay={
            <BottomBarOverlay
              open={photoMenuOpen}
              onClose={() => setPhotoMenuOpen(false)}
              title="編輯照片"
              titleIcon="bi-images"
              sections={menuSections(photoMenuGroups)}
            />
          }
        >
          <BottomBar
            className="text-sm"
            actions={
              <>
                <ButtonGroup
                  groups={titleButtons}
                  mobileMode="inline"
                  breakpoint="md"
                  translucent
                />
                {!UI.isEditMode && (
                  <Button
                    size="md"
                    translucent
                    icon="bi-images"
                    label="編輯照片"
                    labelClassName="hidden md:inline"
                    onClick={() => setPhotoMenuOpen(true)}
                  />
                )}
              </>
            }
          >
            <p className="min-w-0 flex-1 truncate text-ink-muted">
              {UI.isAreaEditMode
                ? "編輯地區資訊：修改說明與封面照片"
                : "編輯模式"}
            </p>
          </BottomBar>
        </BottomBarStack>
      )}
    </main>
  );
}

function buildButtons(
  areaName: string,
  showActions: boolean,
  isEditMode: boolean,
  isCollectionEditMode: boolean,
  action: TitleBarActions,
): ButtonActionGroup[] {
  const browseButtons: ButtonActionGroup[] = [
    {
      id: "title-browser",
      buttons: [
        {
          id: "manage-description",
          icon: "bi-pencil-square",
          label: "編輯地區資訊",
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
          icon: "bi-x-lg",
          variant: "danger",
          onClick: action.onCancelEdit ?? (() => alert("非預期操作")),
        },
        {
          id: "save",
          label: "儲存",
          variant: "primary",
          icon: "bi-check-lg",
          onClick: action.onSaveEdit ?? (() => alert("非預期操作")),
        },
      ],
    },
  ];

  if (areaName.length === 0 || !showActions) return [];
  if (!isEditMode) return browseButtons;
  return isCollectionEditMode ? [] : editButtons;
}

function TitleBarContent({
  areaName,
  description,
  buttonGroup,
}: {
  areaName: string;
  description?: string;
  /** Error and loading states render the bar without any actions. */
  buttonGroup?: ButtonActionGroup[];
}) {
  const navigate = useNavigate();

  return (
    <TitleBar
      areaName={areaName.length !== 0 ? areaName : "回到地圖"}
      description={description}
      onBack={() => navigate("/")}
      buttonGroup={buttonGroup ?? []}
      mobileActions={{ mobileMode: "none", breakpoint: "lg" }}
    />
  );
}
