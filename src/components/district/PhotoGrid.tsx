import type { Photo } from "../../types/photo.type";
import { EmptyState } from "../common/EmptyState";
import { PhotoCard } from "./PhotoCard";

export type PhotoGridProps = {
  district: string;
  photos: Photo[];
};

export function PhotoGrid({ district, photos }: PhotoGridProps) {
  return (
    <section>
      {photos.length === 0 ? (
        <EmptyState title="" description="找不到符合條件的內容" />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <PhotoCard districtName={district} photo={photo} />
          ))}
        </div>
      )}
    </section>
  );
}
