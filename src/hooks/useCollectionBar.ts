import { useState } from "react";
import type { CollectionGroup } from "../types/photo.type";

export function useCollectionBar(collectionGroup: CollectionGroup[] | null) {
  const [managedCollectionName, setManagedCollectionName] = useState<
    string | null
  >(null);

  const managedCollection =
    collectionGroup?.find(
      (collection) => collection.name === managedCollectionName,
    ) ?? null;

  function toggleManagedCollection(collectionName: string) {
    setManagedCollectionName((current) =>
      current === collectionName ? null : collectionName,
    );
  }

  return {
    managedCollection,
    toggleManagedCollection,
  };
}
