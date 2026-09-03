import { useReducer } from "react";
import type { District } from "../types/district";
import type { CollectionManageToolbarAction } from "../components/district/CollectionManageToolbar";
import { useDistrictEditor } from "./useDistrictEditor";
import { useDistrictState } from "./useDistrictState";
import {
  districtPageReducer,
  initialDistrictPageUIState,
} from "./useDistrictStateReducer";

type UseDistrictPageControllerOptions = {
  district: District;
  initialCollectionName?: string;
};

type TitleBarActions = {
  onEditDistrict?: () => void;
  onEditCollection?: () => void;
  onCancelEdit?: () => void;
  onSaveEdit?: () => void;
};

export function useDistrictPageController({
  district,
  initialCollectionName,
}: UseDistrictPageControllerOptions) {
  const [UIState, dispatch] = useReducer(
    districtPageReducer,
    initialDistrictPageUIState,
  );

  const editor = useDistrictEditor(district);

  const displayedDistrict =
    UIState.mode !== "browse" && editor.draftDistrict
      ? editor.draftDistrict
      : editor.currentDistrict;

  const districtState = useDistrictState(
    displayedDistrict.photos,
    initialCollectionName,
    UIState.collectionPhotoMode,
  );

  const isEditMode = UIState.mode !== "browse";

  const isDistrictEditMode = UIState.mode === "districtEdit";

  const isCollectionEditMode =
    UIState.mode === "collectionEdit" ||
    UIState.mode === "collectionPhotoSelect";

  const isCollectionPhotoSelectMode = UIState.mode === "collectionPhotoSelect";

  const isPhotoDeleteSelectMode = UIState.mode === "photoDeleteSelect";

  const isPhotoSelectMode =
    isCollectionPhotoSelectMode || isPhotoDeleteSelectMode;

  function resetPageUI() {
    districtState.setCollectionName("");
  }

  function startDistrictEdit() {
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
    const collection = districtState.selectedCollection;
    const photoIds = UIState.selectedPhotoIds;
    const mode = UIState.collectionPhotoMode;

    if (!collection || !mode || photoIds.size === 0) {
      dispatch({ type: "CANCEL_PHOTO_SELECTION" });
      return;
    }

    if (mode === "add") {
      editor.addPhotosToCollection(collection.name, photoIds);
    }

    if (mode === "remove") {
      editor.removePhotosFromCollection(collection.name, photoIds);
    }

    dispatch({ type: "CONFIRM_PHOTO_SELECTION" });
  }

  function onRejectCollectionPhotoSelection() {
    dispatch({ type: "CANCEL_PHOTO_SELECTION" });
  }

  function onCollectionRename(collectionName: string) {
    const nextName = window.prompt("請輸入新的相簿名稱", collectionName);

    if (nextName === null) return;

    const normalizedName = nextName.trim();

    if (!normalizedName || normalizedName === collectionName) return;

    editor.renameCollection(collectionName, normalizedName);
    districtState.setCollectionName(normalizedName);
  }

  function onCollectionRemove(collectionName: string, photoCount: number) {
    const isConfirmed = window.confirm(
      `確定要刪除「${collectionName}」嗎？其中 ${photoCount} 張照片會解除與此相簿的關聯。`,
    );

    if (!isConfirmed) return;

    editor.removeCollection(collectionName);
    districtState.setCollectionName("");
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
    onEditDistrict: startDistrictEdit,
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
    district: {
      displayed: displayedDistrict,
      draft: editor.draftDistrict,
    },

    filters: {
      keyword: districtState.keyword,
      setKeyword: districtState.setKeyword,
      sort: districtState.sort,
      setSort: districtState.setSort,
      selectedCollection: districtState.selectedCollection,
      collectionGroup: districtState.collectionGroup,
      toggleCollection: districtState.toggleCollection,
      visiblePhotos: districtState.visiblePhotos,
    },

    UI: {
      isEditMode,
      isDistrictEditMode,
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
