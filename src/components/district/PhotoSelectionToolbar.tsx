import type { ButtonActionGroup } from "../../types/button.type";
import { Toolbar } from "../common/Toolbar";

type PhotoSelectionToolbarProps = {
  selectedCount: number;
  onClearSelection: () => void;
};

export function PhotoSelectionToolbar({
  selectedCount,
  onClearSelection,
}: PhotoSelectionToolbarProps) {
  const buttons: ButtonActionGroup[] = [
    {
      id: "photo-selection",
      buttons: [
        {
          id: "clear-photo-selection",
          label: "取消選取",
          icon: "bi-x-lg",
          onClick: onClearSelection,
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
