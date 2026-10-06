import { useCallback, useEffect, useReducer, useState } from "react";
import type { CollectionManageToolbarAction } from "../components/area/CollectionManageToolbar";
import { useAreaEditor } from "./useAreaEditor";
import { useAreaState } from "./useAreaState";
import { areaPageReducer, initialAreaPageUIState } from "./useAreaStateReducer";
import type { Area, Collection } from "../types/gallery.type";
import { galleryStore, GalleryStoreError } from "../stores/gallery.store";

type UseAreaPageControllerOptions = {
  areaId: string;
  initialCollectionId?: string;
};

type TitleBarActions = {
  onEditArea?: () => void;
  onEditCollection?: () => void;
  onCancelEdit?: () => void;
  onSaveEdit?: () => void;
};

export function useAreaPageController({
  areaId,
  initialCollectionId,
}: UseAreaPageControllerOptions) {
  const [UIState, dispatch] = useReducer(
    areaPageReducer,
    initialAreaPageUIState,
  );

  const [sourceArea, setSourceArea] = useState<Area | null>(null);
  const [sourceCollections, setSourceCollections] = useState<
    Collection[] | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const editor = useAreaEditor(sourceArea);

  const refetchCollections = useCallback(async () => {
    return galleryStore
      .getCollectionsByAreaId(areaId)
      .then((items) => setSourceCollections(items));
  }, [areaId]);

  useEffect(() => {
    let cancelled = false;

    galleryStore
      .getAreaById(areaId)
      .then((area) => {
        if (cancelled) return;

        setSourceArea(area);
      })
      .catch((reason: unknown) => {
        if (cancelled) return;

        setError(
          reason instanceof Error ? reason.message : "無法載入行政區資料",
        );
      });

    refetchCollections().catch((reason: unknown) => {
      if (cancelled) return;
      setError(reason instanceof Error ? reason.message : "無法載入相簿資料");
    });

    return () => {
      cancelled = true;
    };
  }, [areaId, refetchCollections]);

  const displayedArea =
    UIState.mode !== "browse" && editor.draftArea
      ? editor.draftArea
      : sourceArea;

  const areaState = useAreaState(
    areaId,
    initialCollectionId,
    UIState.collectionPhotoMode,
  );

  const isEditMode = UIState.mode !== "browse";

  const isAreaEditMode = UIState.mode === "areaEdit";

  const isCollectionEditMode =
    UIState.mode === "collectionEdit" ||
    UIState.mode === "collectionPhotoSelect";

  const isCollectionPhotoSelectMode = UIState.mode === "collectionPhotoSelect";

  const isPhotoDeleteSelectMode = UIState.mode === "photoDeleteSelect";

  const isPhotoSelectMode =
    isCollectionPhotoSelectMode || isPhotoDeleteSelectMode;

  function resetPageUI() {
    areaState.setSelectedCollectionId("");
  }

  function startAreaEdit() {
    editor.startEditing();
    dispatch({ type: "START_AREA_EDIT" });
  }

  function startCollectionEdit() {
    editor.startEditing();
    dispatch({ type: "START_COLLECTION_EDIT" });
  }

  async function saveEdit() {
    const draft = editor.draftArea;

    if (!draft) {
      return;
    }

    try {
      await galleryStore.updateAreaContent(areaId, {
        description: draft.description ?? null,
      });
      setSourceArea(await galleryStore.getAreaById(areaId));
    } catch (reason) {
      window.alert(
        reason instanceof Error ? reason.message : "儲存失敗，請稍後再試",
      );
      return;
    }

    editor.saveChanges();
    resetPageUI();
    dispatch({ type: "SAVE_EDIT" });
  }

  function cancelEdit() {
    editor.cancelEditing();
    resetPageUI();
    dispatch({ type: "CANCEL_EDIT" });
  }

  function onAddCollectionPhoto() {
    areaState.setKeyword("");
    dispatch({
      type: "START_COLLECTION_PHOTO_SELECT",
      collectionPhotoMode: "add",
    });
  }

  function onRemoveCollectionPhoto() {
    areaState.setKeyword("");
    dispatch({
      type: "START_COLLECTION_PHOTO_SELECT",
      collectionPhotoMode: "remove",
    });
  }

  function togglePhotoSelection(photoId: string) {
    dispatch({
      type: "TOGGLE_PHOTO_SELECTION",
      photoId,
    });
  }

  function clearPhotoSelection() {
    dispatch({ type: "CLEAR_PHOTO_SELECTION" });
  }

  async function onConfirmCollectionPhotoSelection() {
    const collection = sourceCollections?.find(
      (item) => item.id === areaState.selectedCollectionId,
    );
    const photoIds = [...UIState.selectedPhotoIds];
    const mode = UIState.collectionPhotoMode;

    if (!collection || !mode || photoIds.length === 0) {
      dispatch({ type: "CANCEL_PHOTO_SELECTION" });
      return;
    }

    try {
      if (mode === "add") {
        await galleryStore.addPhotosToCollection({
          collectionId: collection.id,
          photoIds,
        });
      } else {
        await galleryStore.removePhotosFromCollection({
          collectionId: collection.id,
          photoIds,
        });
      }

      await refetchCollections();
      areaState.refreshPhotos();
      dispatch({ type: "CONFIRM_PHOTO_SELECTION" });
    } catch (reason) {
      window.alert(
        reason instanceof GalleryStoreError &&
          reason.code === "PHOTO_AREA_MISMATCH"
          ? "照片與相簿不屬於同一縣市"
          : reason instanceof Error
            ? reason.message
            : "更新失敗",
      );
    }
  }

  function onRejectCollectionPhotoSelection() {
    dispatch({ type: "CANCEL_PHOTO_SELECTION" });
  }

  async function onCollectionRename(collection: Collection) {
    const nextName = window.prompt("請輸入新的相簿名稱", collection.name);

    if (nextName === null) {
      return;
    }

    const normalizedName = nextName.trim();

    if (!normalizedName || normalizedName === collection.name) {
      return;
    }

    try {
      await galleryStore.updateCollection(collection.id, {
        name: normalizedName,
      });
      await refetchCollections();
    } catch (reason) {
      window.alert(
        reason instanceof GalleryStoreError &&
          reason.code === "COLLECTION_NAME_CONFLICT"
          ? "已有相同名稱的相簿"
          : reason instanceof Error
            ? reason.message
            : "更新失敗",
      );
    }
  }

  async function onCollectionRemove(collection: Collection) {
    const isConfirmed = window.confirm(
      `確定要刪除「${collection.name}」嗎？其中 ${collection.photoCount} 張照片會解除與此相簿的關聯。`,
    );

    if (!isConfirmed) {
      return;
    }

    try {
      await galleryStore.deleteCollection(collection.id);
      await refetchCollections();
      areaState.setSelectedCollectionId("");
    } catch (reason) {
      window.alert(
        reason instanceof Error ? reason.message : "刪除失敗",
      );
    }
  }

  async function onCollectionCreate() {
    const nextName = window.prompt("請輸入新相簿名稱");

    if (nextName === null) {
      return;
    }

    const normalizedName = nextName.trim();

    if (!normalizedName) {
      return;
    }

    try {
      const created = await galleryStore.createCollection({
        areaId,
        name: normalizedName,
      });
      await refetchCollections();
      areaState.setSelectedCollectionId(created.id);
    } catch (reason) {
      window.alert(
        reason instanceof GalleryStoreError &&
          reason.code === "COLLECTION_NAME_CONFLICT"
          ? "已有相同名稱的相簿"
          : reason instanceof Error
            ? reason.message
            : "新增失敗",
      );
    }
  }

  function startPhotoDeleteSelect() {
    areaState.setKeyword("");
    dispatch({ type: "START_PHOTO_DELETE_SELECT" });
  }

  async function confirmPhotoDelete() {
    const photoIds = [...UIState.selectedPhotoIds];

    if (photoIds.length === 0) {
      return;
    }

    const isConfirmed = window.confirm(
      `確定要刪除已選取的 ${photoIds.length} 張照片嗎？`,
    );

    if (!isConfirmed) {
      return;
    }

    try {
      await galleryStore.deletePhotos(photoIds);
      await refetchCollections();
      areaState.refreshPhotos();
      dispatch({ type: "CONFIRM_PHOTO_DELETE" });
    } catch (reason) {
      window.alert(reason instanceof Error ? reason.message : "刪除失敗");
    }
  }

  function cancelPhotoDelete() {
    dispatch({ type: "CANCEL_PHOTO_DELETE" });
  }

  const titleBarActions: TitleBarActions = {
    onEditArea: startAreaEdit,
    onEditCollection: startCollectionEdit,
    onSaveEdit: saveEdit,
    onCancelEdit: cancelEdit,
  };

  const collectionManageToolbarActions: CollectionManageToolbarAction = {
    onCollectionRename,
    onCollectionRemove,
    onAddCollectionPhoto,
    onRemoveCollectionPhoto,
    onConfirmCollectionPhotoSelection,
    onRejectCollectionPhotoSelection,
  };

  return {
    error,

    area: {
      displayed: displayedArea,
      draft: editor.draftArea,
    },

    collections: sourceCollections,

    filters: {
      keyword: areaState.keyword,
      setKeyword: areaState.setKeyword,
      sort: areaState.sort,
      setSort: areaState.setSort,
      selectedCollectionId: areaState.selectedCollectionId,
      toggleCollection: areaState.toggleCollection,
      visiblePhotos: areaState.visiblePhotos,
    },

    UI: {
      isEditMode,
      isAreaEditMode,
      isCollectionEditMode,
      isCollectionPhotoSelectMode,
      isPhotoDeleteSelectMode,
      isPhotoSelectMode,
      collectionPhotoMode: UIState.collectionPhotoMode,
      selectedPhotoIds: UIState.selectedPhotoIds,
    },

    actions: {
      updateDescription: editor.updateDescription,
      onCollectionCreate,
      togglePhotoSelection,
      clearPhotoSelection,
      startPhotoDeleteSelect,
      confirmPhotoDelete,
      cancelPhotoDelete,
      titleBar: titleBarActions,
      collectionToolbar: collectionManageToolbarActions,
    },
  };
}
