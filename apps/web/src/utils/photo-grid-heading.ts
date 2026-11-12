import type { useAreaPageController } from "../hooks/useAreaPageController";

type PhotoGridHeadingParams = Pick<
  ReturnType<typeof useAreaPageController>,
  "UI" | "filters" | "collections"
>;

export function getPhotoGridHeading({
  UI,
  filters,
  collections,
}: PhotoGridHeadingParams): { title: string; hint?: string } {
  const isCoverSelectMode =
    UI.isAreaEditMode || UI.collectionPhotoMode === "cover";

  const title = (() => {
    if (isCoverSelectMode) return "選擇封面照片";
    if (UI.collectionPhotoMode === "add") return "選擇要加入的照片";
    if (UI.collectionPhotoMode === "remove") return "選擇要移除的照片";
    if (UI.isPhotoDeleteSelectMode) return "選擇要刪除的照片";

    const collection = collections?.find(
      (item) => item.id === filters.selectedCollectionId,
    );
    if (collection) return collection.name;
    if (filters.keyword) return "搜尋結果";

    return "所有相片";
  })();

  return {
    title,
    hint: isCoverSelectMode ? "從下方點選一張，再點一次取消指定" : undefined,
  };
}
