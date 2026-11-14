import type { Collection } from "../types/gallery.type";
import type { Dialogs } from "../hooks/useDialogs";
import { galleryStore } from "../stores/gallery.store";
import { alertMessage } from "./alert";

/** Creates a collection and resolves it; on failure shows the error
    (including the name-conflict mapping) and resolves null. */
export async function createCollectionWithAlert(
  dialogs: Dialogs,
  input: { areaId: string; name: string },
): Promise<Collection | null> {
  try {
    return await galleryStore.createCollection(input);
  } catch (reason) {
    await dialogs.alert(
      alertMessage(reason, "新增失敗", {
        COLLECTION_NAME_CONFLICT: "已有相同名稱的相簿",
      }),
    );
    return null;
  }
}

/** Returns a new Set with `value` toggled in or out. */
export function toggleInSet<T>(set: ReadonlySet<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
}
