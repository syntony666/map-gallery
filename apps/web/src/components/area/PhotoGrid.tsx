import type { Photo } from "../../types/gallery.type";
import { PhotoCard } from "./PhotoCard";

export type PhotoGridProps = {
  photos: Photo[];
  isSelectionMode?: boolean;
  selectedPhotoIds?: ReadonlySet<string>;
  onOpenPhoto?: (photoId: string) => void;
  onTogglePhotoSelection?: (photoId: string) => void;
};

export function PhotoGrid({
  photos,
  isSelectionMode = false,
  selectedPhotoIds = new Set(),
  onOpenPhoto,
  onTogglePhotoSelection,
}: PhotoGridProps) {
  return (
    <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {photos.map((photo) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          isSelectionMode={isSelectionMode}
          isSelected={selectedPhotoIds.has(photo.id)}
          onOpen={onOpenPhoto ? () => onOpenPhoto(photo.id) : undefined}
          onToggleSelection={() => onTogglePhotoSelection?.(photo.id)}
        />
      ))}
    </section>
  );
}
