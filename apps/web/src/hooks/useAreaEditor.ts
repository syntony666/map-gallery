import { useState } from "react";
import type { Area } from "../types/gallery.type";

export function useAreaEditor(area: Area | null) {
  const [draftArea, setDraftArea] = useState<Area | null>(null);

  function startEditing() {
    if (!area) return;
    setDraftArea(structuredClone(area));
  }

  function cancelEditing() {
    setDraftArea(null);
  }

  function updateDescription(description: string) {
    setDraftArea((current) =>
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

    setDraftArea((current) => {
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
    setDraftArea((current) => {
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

    setDraftArea((current) => {
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

    setDraftArea((current) => {
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

    setDraftArea((draft) => {
      if (!draft) return draft;

      return {
        ...draft,
        photos: draft.photos.filter((photo) => !photoIds.has(photo.id)),
      };
    });
  }

  function deletePhotos(photoIds: ReadonlySet<string>) {
    if (photoIds.size === 0) return;

    // setCurrentArea((current) => ({
    //   ...current,
    //   photos: current.photos.filter((photo) => !photoIds.has(photo.id)),
    // }));

    setDraftArea(null);
  }

  function saveChanges() {
    if (!draftArea) return;

    // setCurrentArea(draftArea);
    setDraftArea(null);
  }

  return {
    draftArea,
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
