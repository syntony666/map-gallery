import { useState } from "react";
import type { District } from "../types/district";

export function useDistrictEditor(district: District) {
  const [currentDistrict, setCurrentDistrict] = useState(district);
  const [draftDistrict, setDraftDistrict] = useState<District | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  function startEditing() {
    setDraftDistrict(structuredClone(currentDistrict));
    setIsEditing(true);
  }

  function cancelEditing() {
    setDraftDistrict(null);
    setIsEditing(false);
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

  function saveChanges() {
    if (!draftDistrict) return;

    setCurrentDistrict(draftDistrict);
    setDraftDistrict(null);
    setIsEditing(false);
  }

  return {
    currentDistrict,
    draftDistrict,
    isEditing,
    startEditing,
    cancelEditing,
    updateDescription,
    saveChanges,
  };
}
