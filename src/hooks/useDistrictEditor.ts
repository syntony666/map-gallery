import { useState } from "react";
import type { District } from "../types/district";

export function useDistrictEditor(district: District) {
  const [currentDistrict, setCurrentDistrict] = useState(district);
  const [draftDistrict, setDraftDistrict] = useState<District | null>(null);

  function startEditing() {
    setDraftDistrict(structuredClone(currentDistrict));
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
          collections: photo.collections?.includes(currentName)
            ? [
                ...new Set(
                  photo.collections.map((collection) =>
                    collection === currentName ? name : collection,
                  ),
                ),
              ]
            : photo.collections,
        })),
      };
    });
  }

  function removeCollection(collectionName: string) {
    setDraftDistrict((current) => {
      if (!current) return current;

      return {
        ...current,
        photos: current.photos.map((photo) => ({
          ...photo,
          collections: photo.collections?.filter(
            (collection) => collection !== collectionName,
          ),
        })),
      };
    });
  }

  function saveChanges() {
    if (!draftDistrict) return;

    setCurrentDistrict(draftDistrict);
    setDraftDistrict(null);
  }

  return {
    currentDistrict,
    draftDistrict,
    startEditing,
    cancelEditing,
    updateDescription,
    renameCollection,
    removeCollection,
    saveChanges,
  };
}
