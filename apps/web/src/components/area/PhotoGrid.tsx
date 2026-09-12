import type { Photo } from "../../types/gallery.type";
import { EmptyState } from "../common/EmptyState";
import { PhotoCard } from "./PhotoCard";

export type PhotoGridProps = {
  area: string;
  photos: Photo[];
  isSelectionMode?: boolean;
  selectedPhotoIds?: ReadonlySet<string>;
  onTogglePhotoSelection?: (photoId: string) => void;
};

export function PhotoGrid({
  area,
  photos,
  isSelectionMode = false,
  selectedPhotoIds = new Set(),
  onTogglePhotoSelection,
}: PhotoGridProps) {
  return (
    <section>
      {photos.length === 0 ? (
        <EmptyState title="" description="找不到符合條件的內容" />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <PhotoCard
              key={photo.id}
              areaName={area}
              photo={photo}
              isSelectionMode={isSelectionMode}
              isSelected={selectedPhotoIds.has(photo.id)}
              onToggleSelection={() => onTogglePhotoSelection?.(photo.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
