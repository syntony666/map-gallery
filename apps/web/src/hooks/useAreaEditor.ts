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

  function saveChanges() {
    if (!draftArea) {
      return;
    }

    setDraftArea(null);
  }

  return {
    draftArea,
    startEditing,
    cancelEditing,
    updateDescription,
    saveChanges,
  };
}
