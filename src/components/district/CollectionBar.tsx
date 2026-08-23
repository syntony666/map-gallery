import type { Collection } from "../../types/photo.type";
import { EmptyState } from "../common/EmptyState";
import { CollectionItem } from "./CollectionItem";
import "./CollectionBar.css";

type CollectionBarProps = {
  collectionGroup: Collection[] | null;
  selectedCollectionName: string;
  onSelect: (value: string) => void;
};

export function CollectionBar({
  collectionGroup,
  selectedCollectionName,
  onSelect,
}: CollectionBarProps) {
  if (!collectionGroup || collectionGroup.length === 0) {
    return <EmptyState title="" description="目前沒有相簿" />;
  }

  function handleCollectionClick(collection: Collection) {
    onSelect(collection.name);
  }

  return (
    <section className="flex gap-3 overflow-x-auto -mx-4 px-4">
      {collectionGroup.map((collection) => (
        <CollectionItem
          key={collection.name}
          collection={collection}
          isSelected={
            selectedCollectionName === "" ||
            selectedCollectionName === collection.name
          }
          onClick={() => handleCollectionClick(collection)}
        />
      ))}
    </section>
  );
}
