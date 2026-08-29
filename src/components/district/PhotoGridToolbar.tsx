import type { ButtonConfig } from "../../types/button.type";
import { Button } from "../common/Button";

type PhotoGridToolbarProps = {
  photoCount: number;
  isEditing: boolean;
};
export function PhotoGridToolbar({
  photoCount,
  isEditing,
}: PhotoGridToolbarProps) {
  const buttons: ButtonConfig[] = isEditing
    ? []
    : [
        {
          id: "photo-add",
          label: "",
          icon: "bi-plus-lg",
          onClick: () => alert("上傳功能尚未開放"),
        },
        {
          id: "phtot-delete",
          label: "",
          icon: "bi-trash3",
          onClick: () => alert("上傳功能尚未開放"),
        },
      ];
  return (
    <section className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold">所有相片</span>

        {buttons.length > 0 &&
          buttons.map((button) => <Button key={button.id} button={button} />)}
      </div>
      <span className="text-sm text-stone-500">{photoCount} 個項目</span>
    </section>
  );
}
