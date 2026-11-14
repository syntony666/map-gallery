import type { Photo } from "../../types/gallery.type";
import { PhotoCard } from "./PhotoCard";

export type PhotoGridProps = {
  photos: Photo[];
  isSelectionMode?: boolean;
  selectedPhotoIds?: ReadonlySet<string>;
  photoTo?: (photoId: string) => string;
  onTogglePhotoSelection?: (photoId: string) => void;
};

export function PhotoGrid({
  photos,
  isSelectionMode = false,
  selectedPhotoIds = new Set(),
  photoTo,
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
          to={photoTo?.(photo.id)}
          onToggleSelection={() => onTogglePhotoSelection?.(photo.id)}
        />
      ))}
    </section>
  );
}
