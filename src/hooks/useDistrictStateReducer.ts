import type { CollectionPhotoMode } from "../types/photo.type";

export type DistrictPageMode =
  | "browse"
  | "editDistrict"
  | "editCollection"
  | "selectingPhotos";

export type DistrictPageUIState = {
  mode: DistrictPageMode;
  collectionPhotoMode: CollectionPhotoMode;
  selectedPhotoIds: Set<string>;
};

export type DistrictPageUIAction =
  | { type: "START_DISTRICT_EDIT" }
  | { type: "START_COLLECTION_EDIT" }
  | {
      type: "START_PHOTO_SELECTION";
      collectionPhotoMode: Exclude<CollectionPhotoMode, null>;
    }
  | { type: "TOGGLE_PHOTO_SELECTION"; photoId: string }
  | { type: "CLEAR_PHOTO_SELECTION" }
  | { type: "CONFIRM_PHOTO_SELECTION" }
  | { type: "CANCEL_PHOTO_SELECTION" }
  | { type: "SAVE_EDIT" }
  | { type: "CANCEL_EDIT" };

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
    mode: "editCollection",
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
        mode: "editDistrict",
        collectionPhotoMode: null,
        selectedPhotoIds: new Set(),
      };

    case "START_COLLECTION_EDIT":
      return createCollectionEditState();

    case "START_PHOTO_SELECTION":
      if (state.mode !== "editCollection") return state;

      return {
        mode: "selectingPhotos",
        collectionPhotoMode: action.collectionPhotoMode,
        selectedPhotoIds: new Set(),
      };

    case "TOGGLE_PHOTO_SELECTION": {
      if (state.mode !== "selectingPhotos") return state;

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
      if (state.mode !== "selectingPhotos") return state;

      return {
        ...state,
        selectedPhotoIds: new Set(),
      };

    case "CONFIRM_PHOTO_SELECTION":
    case "CANCEL_PHOTO_SELECTION":
      if (state.mode !== "selectingPhotos") return state;

      return createCollectionEditState();

    case "SAVE_EDIT":
    case "CANCEL_EDIT":
      if (state.mode === "browse") return state;

      return createBrowseState();

    default:
      return state;
  }
}
