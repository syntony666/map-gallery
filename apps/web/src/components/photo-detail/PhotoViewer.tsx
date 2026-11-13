import type { Photo } from "../../types/gallery.type";

type PhotoViewerProps = {
  photo: Photo;
};

export function PhotoViewer({ photo }: PhotoViewerProps) {
  return (
    <section className="aspect-square rounded-md bg-stone-200/50 lg:aspect-4/3">
      <img
        src={photo.image}
        alt={photo.title}
        className="h-full w-full object-contain"
        loading="lazy"
        decoding="async"
      />
    </section>
  );
}
