import { useState } from "react";
import type { Area } from "../types/gallery.type";

export function useAreaEditor(area: Area | null) {
  const [draftDescription, setDraftDescription] = useState<string | null>(
    null,
  );

  function startEditing() {
    if (!area) return;
    setDraftDescription(area.description ?? "");
  }

  function discardDraft() {
    setDraftDescription(null);
  }

  function updateDescription(description: string) {
    setDraftDescription((current) =>
      current === null ? current : description,
    );
  }

  return {
    draftDescription,
    startEditing,
    discardDraft,
    updateDescription,
  };
}
