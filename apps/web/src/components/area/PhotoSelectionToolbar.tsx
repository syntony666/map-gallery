import type { ButtonActionGroup } from "../../types/button.type";
import { Toolbar } from "../common/Toolbar";

type PhotoSelectionToolbarProps = {
  selectedCount: number;
  onConfirmDelete: () => void;
  onCancel: () => void;
};

export function PhotoSelectionToolbar({
  selectedCount,
  onConfirmDelete,
  onCancel,
}: PhotoSelectionToolbarProps) {
  const buttons: ButtonActionGroup[] = [
    {
      id: "photo-delete-selection",
      buttons: [
        {
          id: "cancel-photo-delete",
          label: "取消",
          icon: "bi-x-lg",
          onClick: onCancel,
        },
        {
          id: "confirm-photo-delete",
          label: `刪除 ${selectedCount} 張`,
          icon: "bi-trash3",
          variant: "danger",
          disabled: selectedCount === 0,
          onClick: onConfirmDelete,
        },
      ],
    },
  ];
  return (
    <Toolbar
      label={"已選取："}
      value={`${selectedCount} 張照片`}
      buttonGroups={buttons}
      mobileMode="inline"
    />
  );
}
