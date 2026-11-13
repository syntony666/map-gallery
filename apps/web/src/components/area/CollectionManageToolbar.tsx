import { useState } from "react";
import type { ButtonActionGroup } from "../../types/button.type";
import type { Collection } from "../../types/gallery.type";
import { ActionMenuList } from "../common/ActionMenuList";
import { BottomBarOverlay } from "../common/BottomBarOverlay";
import { Button } from "../common/Button";
import { ButtonGroup } from "../common/ButtonGroup";
import { Toolbar } from "../common/Toolbar";

export type CollectionManageToolbarAction = {
  onCollectionRename: (collection: Collection) => void;
  onCollectionRemove: (collection: Collection) => void;
  onAddCollectionPhoto: () => void;
  onRemoveCollectionPhoto: () => void;
  onSetCollectionCover: () => void;
  onConfirmCollectionPhotoSelection: () => void;
  onRejectCollectionPhotoSelection: () => void;
};

type CollectionManageToolbarProps = {
  collection: Collection | null;
  isCollectionPhotoSelectMode: boolean;
  action: CollectionManageToolbarAction;
  /** Extra groups appended in manage mode (e.g. the done button). */
  extraGroups?: ButtonActionGroup[];
};

export function CollectionManageToolbar({
  collection,
  isCollectionPhotoSelectMode,
  action,
  extraGroups = [],
}: CollectionManageToolbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  // The manage bar unmounts in photo-select mode, but this state survives;
  // close the menu so it does not reopen on the way back.
  const [menuAllowed, setMenuAllowed] = useState(
    !!collection && !isCollectionPhotoSelectMode,
  );
  const canShowMenu = !!collection && !isCollectionPhotoSelectMode;
  if (menuAllowed !== canShowMenu) {
    setMenuAllowed(canShowMenu);
    setMenuOpen(false);
  }

  if (!collection) {
    return (
      <Toolbar
        label="編輯相簿：請選取上方相簿..."
        buttonGroups={extraGroups}
        bottomBar
      />
    );
  }
  const buttons: ButtonActionGroup[] = isCollectionPhotoSelectMode
    ? [
        {
          id: "collection-photo-selection",
          buttons: [
            {
              id: "photo-confirm",
              label: "確認",
              icon: "bi-check-circle-fill",
              variant: "primary",
              onClick: () => action.onConfirmCollectionPhotoSelection(),
            },
            {
              id: "photo-reject",
              label: "取消",
              icon: "bi-x-circle-fill",
              variant: "danger",
              onClick: () => action.onRejectCollectionPhotoSelection(),
            },
          ],
        },
      ]
    : [
        {
          id: "collection-photo-edit",
          buttons: [
            {
              id: `${collection.id}-add-photo`,
              label: "加入照片",
              icon: "bi-plus-square",
              onClick: () => action.onAddCollectionPhoto(),
            },
            {
              id: `${collection.id}-remove-photo`,
              label: "移除照片",
              icon: "bi-dash-square",
              onClick: () => action.onRemoveCollectionPhoto(),
            },
            {
              id: `${collection.id}-set-cover`,
              label: "設定封面",
              icon: "bi-star",
              disabled: collection.photoCount === 0,
              onClick: () => action.onSetCollectionCover(),
            },
          ],
        },
        {
          id: "collection-meta-edit",
          buttons: [
            {
              id: `rename-${collection.id}`,
              label: "更改名稱",
              icon: "bi-pencil-square",
              onClick: () => action.onCollectionRename(collection),
            },
            {
              id: `remove-${collection.id}`,
              label: "刪除相簿",
              icon: "bi-trash3",
              variant: "danger",
              onClick: () => action.onCollectionRemove(collection),
            },
          ],
        },
      ];
  return isCollectionPhotoSelectMode ? (
    <Toolbar
      label="正在編輯："
      value={collection.name}
      meta={`${collection.photoCount} 張照片`}
      buttonGroups={buttons}
      mobileMode="inline"
      bottomBar
    />
  ) : (
    <Toolbar
      label="正在編輯："
      value={collection.name}
      meta={`（${collection.photoCount} 張照片）`}
      buttonGroups={[...buttons, ...extraGroups]}
      mobileGroupIcon="bi-pencil-square"
      mobileGroupLabel="管理相簿"
      bottomBar
      barActions={
        <>
          <ButtonGroup
            groups={[...buttons, ...extraGroups]}
            mobileMode="none"
            breakpoint="md"
          />
          <Button
            size="md"
            icon="bi-list"
            aria-label="管理相簿"
            className="md:hidden"
            onClick={() => setMenuOpen(true)}
          />
        </>
      }
      barOverlay={
        <BottomBarOverlay open={menuOpen} onClose={() => setMenuOpen(false)}>
          <ActionMenuList
            groups={[...buttons, ...extraGroups]}
            onSelect={() => setMenuOpen(false)}
          />
        </BottomBarOverlay>
      }
    />
  );
}
