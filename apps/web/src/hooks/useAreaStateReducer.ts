import type { CollectionPhotoMode } from "../types/gallery.type";

export type AreaPageMode =
  | "browse"
  | "areaEdit"
  | "collectionEdit"
  | "collectionPhotoSelect"
  | "photoDeleteSelect";

export type AreaPageUIState = {
  mode: AreaPageMode;
  collectionPhotoMode: CollectionPhotoMode;
  selectedPhotoIds: Set<string>;
};

export type AreaPageUIAction =
  | { type: "START_AREA_EDIT" }
  | { type: "START_COLLECTION_EDIT" }
  | {
      type: "START_COLLECTION_PHOTO_SELECT";
      collectionPhotoMode: Exclude<CollectionPhotoMode, null>;
    }
  | { type: "START_PHOTO_DELETE_SELECT" }
  | { type: "TOGGLE_PHOTO_SELECTION"; photoId: string }
  | { type: "CONFIRM_PHOTO_SELECTION" }
  | { type: "CANCEL_PHOTO_SELECTION" }
  | { type: "CONFIRM_PHOTO_DELETE" }
  | { type: "CANCEL_PHOTO_DELETE" }
  | { type: "SAVE_EDIT" }
  | { type: "CANCEL_EDIT" }
  | { type: "EXIT_EDIT" };

export const initialAreaPageUIState: AreaPageUIState = {
  mode: "browse",
  collectionPhotoMode: null,
  selectedPhotoIds: new Set(),
};

function createBrowseState(): AreaPageUIState {
  return {
    mode: "browse",
    collectionPhotoMode: null,
    selectedPhotoIds: new Set(),
  };
}

function createCollectionEditState(): AreaPageUIState {
  return {
    mode: "collectionEdit",
    collectionPhotoMode: null,
    selectedPhotoIds: new Set(),
  };
}

export function areaPageReducer(
  state: AreaPageUIState,
  action: AreaPageUIAction,
): AreaPageUIState {
  switch (action.type) {
    case "START_AREA_EDIT":
      return {
        mode: "areaEdit",
        collectionPhotoMode: null,
        selectedPhotoIds: new Set(),
      };

    case "START_COLLECTION_EDIT":
      return createCollectionEditState();

    case "START_COLLECTION_PHOTO_SELECT":
      if (state.mode !== "collectionEdit") return state;

      return {
        mode: "collectionPhotoSelect",
        collectionPhotoMode: action.collectionPhotoMode,
        selectedPhotoIds: new Set(),
      };

    case "START_PHOTO_DELETE_SELECT":
      if (state.mode !== "browse") {
        return state;
      }

      return {
        mode: "photoDeleteSelect",
        collectionPhotoMode: null,
        selectedPhotoIds: new Set(),
      };

    case "TOGGLE_PHOTO_SELECTION": {
      if (
        state.mode !== "collectionPhotoSelect" &&
        state.mode !== "photoDeleteSelect"
      )
        return state;

      const selectedPhotoIds = new Set(state.selectedPhotoIds);

      if (selectedPhotoIds.has(action.photoId)) {
        selectedPhotoIds.delete(action.photoId);
      } else {
        selectedPhotoIds.add(action.photoId);
      }

      return {
        ...state,
        selectedPhotoIds,
      };
    }

    case "CONFIRM_PHOTO_SELECTION":
    case "CANCEL_PHOTO_SELECTION":
      if (state.mode !== "collectionPhotoSelect") return state;

      return createCollectionEditState();

    case "CONFIRM_PHOTO_DELETE":
    case "CANCEL_PHOTO_DELETE":
      if (state.mode !== "photoDeleteSelect") return state;

      return createBrowseState();

    case "SAVE_EDIT":
    case "CANCEL_EDIT":
    case "EXIT_EDIT":
      if (state.mode === "browse") return state;

      return createBrowseState();

    default:
      return state;
  }
}
