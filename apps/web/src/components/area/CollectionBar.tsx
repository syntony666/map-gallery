import type { Collection } from "../../types/gallery.type";
import { EmptyState } from "../common/EmptyState";
import { CollectionItem } from "./CollectionItem";
import "./CollectionBar.css";

type CollectionBarProps = {
  collections: Collection[] | null;
  selectedCollectionId: string;
  isEditMode: boolean;
  onAdd: () => void;
  onSelect: (value: string) => void;
};

export function CollectionBar({
  collections,
  selectedCollectionId,
  isEditMode,
  onAdd,
  onSelect,
}: CollectionBarProps) {
  if (!collections || (collections.length === 0 && !isEditMode)) {
    return <EmptyState title="" description="目前沒有相簿" />;
  }

  function handleCollectionClick(collection: Collection) {
    onSelect(collection.id);
  }

  return (
    <section className="flex gap-3 overflow-x-auto -mx-4 px-4 pt-1">
      {isEditMode && onAdd && (
        <button type="button" onClick={onAdd} className="shrink-0">
          <span className="collection-item glass h-18 w-18 rounded-md p-1 sm:h-24 sm:w-24">
            <span className="flex h-full w-full items-center justify-center rounded bg-fill/70 text-2xl text-ink-muted">
              <i className="bi bi-plus-lg" />
            </span>
          </span>
          <p className="mt-1 w-18 truncate text-xs text-ink-muted sm:w-24">
            新增相簿
          </p>
        </button>
      )}
      {collections.map((collection) => (
        <CollectionItem
          key={collection.id}
          collection={collection}
          isSelected={
            selectedCollectionId === "" ||
            selectedCollectionId === collection.id
          }
          onClick={() => handleCollectionClick(collection)}
        />
      ))}
    </section>
  );
}
