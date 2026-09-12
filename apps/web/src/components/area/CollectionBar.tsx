import type { Collection } from "../../types/gallery.type";
import { EmptyState } from "../common/EmptyState";
import { CollectionItem } from "./CollectionItem";
import "./CollectionBar.css";

type CollectionBarProps = {
  collections: Collection[] | null;
  selectedCollectionId: string;
  onSelect: (value: string) => void;
};

export function CollectionBar({
  collections,
  selectedCollectionId,
  onSelect,
}: CollectionBarProps) {
  if (!collections || collections.length === 0) {
    return <EmptyState title="" description="目前沒有相簿" />;
  }

  function handleCollectionClick(collection: Collection) {
    onSelect(collection.id);
  }

  return (
    <section className="flex gap-3 overflow-x-auto -mx-4 px-4">
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
