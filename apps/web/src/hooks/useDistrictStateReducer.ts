import type { CollectionPhotoMode } from "../types/photo.type";

export type DistrictPageMode =
  | "browse"
  | "districtEdit"
  | "collectionEdit"
  | "collectionPhotoSelect"
  | "photoDeleteSelect";

export type DistrictPageUIState = {
  mode: DistrictPageMode;
  collectionPhotoMode: CollectionPhotoMode;
  selectedPhotoIds: Set<string>;
};

export type DistrictPageUIAction =
  | { type: "START_DISTRICT_EDIT" }
  | { type: "START_COLLECTION_EDIT" }
  | {
      type: "START_COLLECTION_PHOTO_SELECT";
      collectionPhotoMode: Exclude<CollectionPhotoMode, null>;
    }
  | { type: "START_PHOTO_DELETE_SELECT" }
  | { type: "TOGGLE_PHOTO_SELECTION"; photoId: string }
  | { type: "CLEAR_PHOTO_SELECTION" }
  | { type: "CONFIRM_PHOTO_SELECTION" }
  | { type: "CANCEL_PHOTO_SELECTION" }
  | { type: "CONFIRM_PHOTO_DELETE" }
  | { type: "CANCEL_PHOTO_DELETE" }
  | { type: "SAVE_EDIT" }
  | { type: "CANCEL_EDIT" }
  | { type: "EXIT_EDIT" };

export const initialDistrictPageUIState: DistrictPageUIState = {
  mode: "browse",
  collectionPhotoMode: null,
  selectedPhotoIds: new Set(),
};

function createBrowseState(): DistrictPageUIState {
  return {
    mode: "browse",
    collectionPhotoMode: null,
    selectedPhotoIds: new Set(),
  };
}

function createCollectionEditState(): DistrictPageUIState {
  return {
    mode: "collectionEdit",
    collectionPhotoMode: null,
    selectedPhotoIds: new Set(),
  };
}

export function districtPageReducer(
  state: DistrictPageUIState,
  action: DistrictPageUIAction,
): DistrictPageUIState {
  switch (action.type) {
    case "START_DISTRICT_EDIT":
      return {
        mode: "districtEdit",
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

    case "CLEAR_PHOTO_SELECTION":
      if (
        state.mode !== "collectionPhotoSelect" &&
        state.mode !== "photoDeleteSelect"
      ) {
        return state;
      }

      return {
        ...state,
        selectedPhotoIds: new Set(),
      };

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
      if (state.mode === "browse") return state;

      return createBrowseState();

    default:
      return state;
  }
}
