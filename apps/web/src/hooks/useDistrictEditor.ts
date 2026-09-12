import { useState } from "react";
import type { Area } from "../types/gallery.type";

export function useDistrictEditor(area: Area | null) {
  const [draftDistrict, setDraftDistrict] = useState<Area | null>(null);

  function startEditing() {
    if (!area) return;
    setDraftDistrict(structuredClone(area));
  }

  function cancelEditing() {
    setDraftDistrict(null);
  }

  function updateDescription(description: string) {
    setDraftDistrict((current) =>
      current
        ? {
            ...current,
            description,
          }
        : current,
    );
  }

  function renameCollection(currentName: string, nextName: string) {
    const name = nextName.trim();

    if (!name || name === currentName) return;

    setDraftDistrict((current) => {
      if (!current) return current;

      return {
        ...current,
        photos: current.photos.map((photo) => ({
          ...photo,
          collectionIds: photo.collectionIds?.includes(currentName)
            ? [
                ...new Set(
                  photo.collectionIds.map((collection) =>
                    collection === currentName ? name : collection,
                  ),
                ),
              ]
            : photo.collectionIds,
        })),
      };
    });
  }

  function removeCollection(collectionId: string) {
    setDraftDistrict((current) => {
      if (!current) return current;

      return {
        ...current,
        photos: current.photos.map((photo) => ({
          ...photo,
          collectionIds: photo.collectionIds?.filter(
            (collection) => collection !== collectionId,
          ),
        })),
      };
    });
  }
  function addPhotosToCollection(
    collectionId: string,
    photoIds: ReadonlySet<string>,
  ) {
    if (!collectionId || photoIds.size === 0) return;

    setDraftDistrict((current) => {
      if (!current) return current;

      return {
        ...current,
        photos: current.photos.map((photo) => {
          if (!photoIds.has(photo.id)) {
            return photo;
          }

          return {
            ...photo,
            collectionIds: [
              ...new Set([...(photo.collectionIds ?? []), collectionId]),
            ],
          };
        }),
      };
    });
  }

  function removePhotosFromCollection(
    collectionId: string,
    photoIds: ReadonlySet<string>,
  ) {
    if (!collectionId || photoIds.size === 0) return;

    setDraftDistrict((current) => {
      if (!current) return current;

      return {
        ...current,
        photos: current.photos.map((photo) => {
          if (!photoIds.has(photo.id)) {
            return photo;
          }

          return {
            ...photo,
            collectionIds: photo.collectionIds?.filter(
              (collection) => collection !== collectionId,
            ),
          };
        }),
      };
    });
  }

  function removePhotos(photoIds: ReadonlySet<string>) {
    if (photoIds.size === 0) return;

    setDraftDistrict((draft) => {
      if (!draft) return draft;

      return {
        ...draft,
        photos: draft.photos.filter((photo) => !photoIds.has(photo.id)),
      };
    });
  }

  function deletePhotos(photoIds: ReadonlySet<string>) {
    if (photoIds.size === 0) return;

    // setCurrentDistrict((current) => ({
    //   ...current,
    //   photos: current.photos.filter((photo) => !photoIds.has(photo.id)),
    // }));

    setDraftDistrict(null);
  }

  function saveChanges() {
    if (!draftDistrict) return;

    // setCurrentDistrict(draftDistrict);
    setDraftDistrict(null);
  }

  return {
    draftDistrict,
    startEditing,
    cancelEditing,
    updateDescription,
    renameCollection,
    removeCollection,
    addPhotosToCollection,
    removePhotosFromCollection,
    removePhotos,
    deletePhotos,
    saveChanges,
  };
}
