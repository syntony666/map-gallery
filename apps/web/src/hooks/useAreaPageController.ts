import { useEffect, useReducer, useState } from "react";
import type { CollectionManageToolbarAction } from "../components/area/CollectionManageToolbar";
import { useAreaEditor } from "./useAreaEditor";
import { useAreaState } from "./useAreaState";
import { areaPageReducer, initialAreaPageUIState } from "./useAreaStateReducer";
import type { Area, Collection } from "../types/gallery.type";
import { galleryStore } from "../stores/gallery.store";

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

    galleryStore
      .getCollectionsByAreaId(areaId)
      .then((collections) => {
        if (cancelled) return;
        setSourceCollections(collections);
      })
      .catch((reason: unknown) => {
        if (cancelled) return;

        setError(reason instanceof Error ? reason.message : "無法載入相簿資料");
      });

    return () => {
      cancelled = true;
    };
  }, [areaId]);

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
    dispatch({ type: "START_DISTRICT_EDIT" });
  }

  function startCollectionEdit() {
    editor.startEditing();
    dispatch({ type: "START_COLLECTION_EDIT" });
  }

  function saveEdit() {
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
    dispatch({
      type: "START_COLLECTION_PHOTO_SELECT",
      collectionPhotoMode: "add",
    });
  }

  function onRemoveCollectionPhoto() {
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

  function onConfirmCollectionPhotoSelection() {
    const collection = sourceCollections?.find(
      (collection) => collection.id === areaState.selectedCollectionId,
    );
    const photoIds = UIState.selectedPhotoIds;
    const mode = UIState.collectionPhotoMode;

    if (!collection || !mode || photoIds.size === 0) {
      dispatch({ type: "CANCEL_PHOTO_SELECTION" });
      return;
    }

    if (mode === "add") {
      editor.addPhotosToCollection(collection.id, photoIds);
    }

    if (mode === "remove") {
      editor.removePhotosFromCollection(collection.id, photoIds);
    }

    dispatch({ type: "CONFIRM_PHOTO_SELECTION" });
  }

  function onRejectCollectionPhotoSelection() {
    dispatch({ type: "CANCEL_PHOTO_SELECTION" });
  }

  function onCollectionRename(collection: Collection) {
    const nextName = window.prompt("請輸入新的相簿名稱", collection.name);

    if (nextName === null) return;

    const normalizedName = nextName.trim();

    if (!normalizedName || normalizedName === collection.name) return;

    editor.renameCollection(collection.id, normalizedName);
  }

  function onCollectionRemove(collection: Collection) {
    const isConfirmed = window.confirm(
      `確定要刪除「${collection.name}」嗎？其中 ${collection.photoCount} 張照片會解除與此相簿的關聯。`,
    );

    if (!isConfirmed) return;

    editor.removeCollection(collection.id);
    areaState.setSelectedCollectionId("");
  }

  function startPhotoDeleteSelect() {
    editor.startEditing();
    dispatch({ type: "START_PHOTO_DELETE_SELECT" });
  }

  function confirmPhotoDelete() {
    const photoIds = UIState.selectedPhotoIds;

    if (photoIds.size === 0) return;

    const isConfirmed = window.confirm(
      `確定要刪除已選取的 ${photoIds.size} 張照片嗎？`,
    );

    if (!isConfirmed) return;

    editor.deletePhotos(photoIds);
    dispatch({ type: "CONFIRM_PHOTO_DELETE" });
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
