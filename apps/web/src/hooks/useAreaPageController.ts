import { useCallback, useReducer } from "react";
import type { CollectionManageToolbarAction } from "../components/area/CollectionManageToolbar";
import { useAreaEditor } from "./useAreaEditor";
import { useAreaState } from "./useAreaState";
import { useAsyncData } from "./useAsyncData";
import { areaPageReducer, initialAreaPageUIState } from "./useAreaStateReducer";
import type { Collection } from "../types/gallery.type";
import { galleryStore } from "../stores/gallery.store";
import { alertError } from "../utils/alert";

export type TitleBarActions = {
  onEditArea?: () => void;
  onEditCollection?: () => void;
  onCancelEdit?: () => void;
  onSaveEdit?: () => void;
  onDoneEdit?: () => void;
};

type UseAreaPageControllerOptions = {
  areaId: string;
  initialCollectionId?: string;
};

export function useAreaPageController({
  areaId,
  initialCollectionId,
}: UseAreaPageControllerOptions) {
  const [UIState, dispatch] = useReducer(
    areaPageReducer,
    initialAreaPageUIState,
  );

  const {
    data: sourceArea,
    setData: setSourceArea,
    error: areaError,
  } = useAsyncData(() => galleryStore.getAreaById(areaId), [areaId], {
    errorMessage: "無法載入行政區資料",
  });
  const {
    data: sourceCollections,
    setData: setSourceCollections,
    error: collectionsError,
  } = useAsyncData(
    () => galleryStore.getCollectionsByAreaId(areaId),
    [areaId],
    {
      errorMessage: "無法載入相簿資料",
    },
  );
  const error = areaError ?? collectionsError;

  const editor = useAreaEditor(sourceArea);

  const refetchCollections = useCallback(
    () =>
      galleryStore.getCollectionsByAreaId(areaId).then(setSourceCollections),
    [areaId, setSourceCollections],
  );

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

    if (sourceArea?.coverPhotoId) {
      dispatch({
        type: "TOGGLE_PHOTO_SELECTION",
        photoId: sourceArea.coverPhotoId,
      });
    }
  }

  function startCollectionEdit() {
    dispatch({ type: "START_COLLECTION_EDIT" });
  }

  async function saveEdit() {
    const draftDescription = editor.draftDescription;

    if (draftDescription === null) {
      return;
    }

    try {
      await galleryStore.updateAreaContent(areaId, {
        description: draftDescription,
        coverPhotoId: [...UIState.selectedPhotoIds][0] ?? null,
      });
      setSourceArea(await galleryStore.getAreaById(areaId));
    } catch (reason) {
      alertError(reason, "儲存失敗，請稍後再試");
      return;
    }

    editor.discardDraft();
    resetPageUI();
    dispatch({ type: "SAVE_EDIT" });
  }

  function cancelEdit() {
    editor.discardDraft();
    resetPageUI();
    dispatch({ type: "CANCEL_EDIT" });
  }

  function exitEdit() {
    editor.discardDraft();
    resetPageUI();
    dispatch({ type: "EXIT_EDIT" });
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

  function onSetCollectionCover() {
    areaState.setKeyword("");
    dispatch({
      type: "START_COLLECTION_PHOTO_SELECT",
      collectionPhotoMode: "cover",
    });

    const collection = sourceCollections?.find(
      (item) => item.id === areaState.selectedCollectionId,
    );

    if (collection?.coverPhotoId) {
      dispatch({
        type: "TOGGLE_PHOTO_SELECTION",
        photoId: collection.coverPhotoId,
      });
    }
  }

  function togglePhotoSelection(photoId: string) {
    dispatch({
      type: "TOGGLE_PHOTO_SELECTION",
      photoId,
    });
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
      } else if (mode === "remove") {
        await galleryStore.removePhotosFromCollection({
          collectionId: collection.id,
          photoIds,
        });
      } else {
        await galleryStore.updateCollection(collection.id, {
          coverPhotoId: photoIds[0],
        });
      }

      await refetchCollections();
      areaState.refreshPhotos();
      dispatch({ type: "CONFIRM_PHOTO_SELECTION" });
    } catch (reason) {
      alertError(reason, "更新失敗", {
        PHOTO_AREA_MISMATCH: "照片與相簿不屬於同一縣市",
      });
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
      alertError(reason, "更新失敗", {
        COLLECTION_NAME_CONFLICT: "已有相同名稱的相簿",
      });
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
      alertError(reason, "刪除失敗");
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
      alertError(reason, "新增失敗", {
        COLLECTION_NAME_CONFLICT: "已有相同名稱的相簿",
      });
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
      alertError(reason, "刪除失敗");
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
    onDoneEdit: exitEdit,
  };

  const collectionManageToolbarActions: CollectionManageToolbarAction = {
    onCollectionRename,
    onCollectionRemove,
    onAddCollectionPhoto,
    onRemoveCollectionPhoto,
    onSetCollectionCover,
    onConfirmCollectionPhotoSelection,
    onRejectCollectionPhotoSelection,
  };

  return {
    error,

    area: sourceArea,
    draftDescription: editor.draftDescription,

    collections: sourceCollections,

    filters: {
      keyword: areaState.keyword,
      setKeyword: areaState.setKeyword,
      sort: areaState.sort,
      setSort: areaState.setSort,
      selectedCollectionId: areaState.selectedCollectionId,
      toggleCollection: areaState.toggleCollection,
      visiblePhotos: areaState.visiblePhotos,
      photosError: areaState.photosError,
      page: areaState.page,
      setPage: areaState.setPage,
      pagination: areaState.pagination,
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
      startPhotoDeleteSelect,
      confirmPhotoDelete,
      cancelPhotoDelete,
      titleBar: titleBarActions,
      collectionToolbar: collectionManageToolbarActions,
    },
  };
}
