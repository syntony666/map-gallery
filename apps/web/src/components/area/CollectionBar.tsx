import type { Collection } from "../../types/gallery.type";
import { EmptyState } from "../common/EmptyState";
import { CollectionAvatar } from "./CollectionAvatar";
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
          <CollectionAvatar icon="bi-plus-lg" label="新增相簿" muted />
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
