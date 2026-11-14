import { useState } from "react";
import type { ButtonActionGroup } from "../../types/button.type";
import type { Collection } from "../../types/gallery.type";
import { BottomBarOverlay } from "../common/BottomBarOverlay";
import { Button } from "../common/Button";
import { ButtonGroup } from "../common/ButtonGroup";
import { Toolbar } from "../common/Toolbar";
import { menuSections } from "../../utils/menu";

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

  // One menu state serves every sub-state; close it whenever the bar switches
  // between them so it does not reopen across a mode change.
  const stateKey = collection
    ? isCollectionPhotoSelectMode
      ? "select"
      : "manage"
    : "none";
  const [lastStateKey, setLastStateKey] = useState(stateKey);
  if (lastStateKey !== stateKey) {
    setLastStateKey(stateKey);
    setMenuOpen(false);
  }

  /** Below lg every action moves into the ☰ menu. */
  const menuButton = (
    <Button
      size="md"
      translucent
      icon="bi-list"
      aria-label="管理相簿"
      className="lg:hidden"
      onClick={() => setMenuOpen(true)}
    />
  );

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
              icon: "bi-check-lg",
              variant: "primary",
              onClick: () => action.onConfirmCollectionPhotoSelection(),
            },
            {
              id: "photo-reject",
              label: "取消",
              icon: "bi-x-lg",
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
      bottomBar
      barActions={
        <>
          <ButtonGroup
            groups={[...buttons, ...extraGroups]}
            mobileMode="none"
            breakpoint="lg"
            translucent
          />
          {menuButton}
          {extraGroups.flatMap((group) =>
            group.buttons.map((button) => (
              <Button
                key={button.id}
                size="md"
                translucent
                {...button}
                labelClassName="hidden md:inline"
                className="lg:hidden"
              />
            )),
          )}
        </>
      }
      barOverlay={
        <BottomBarOverlay
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          title="管理相簿"
          titleIcon="bi-pencil-square"
          sections={menuSections(buttons)}
        />
      }
    />
  );
}
