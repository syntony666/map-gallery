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
    <section className="flex gap-3 overflow-x-auto -mx-4 px-4">
      {isEditMode && onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="shrink-0 overflow-hidden"
        >
          <span className="collection-item flex h-18 w-18 items-center justify-center rounded-full bg-stone-200 text-2xl text-stone-500 sm:h-24 sm:w-24">
            <i className="bi bi-plus-lg" />
          </span>
          <p className="mt-1 w-18 truncate text-xs text-stone-500 sm:w-24">
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
