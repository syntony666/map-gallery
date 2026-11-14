import type { Photo } from "../../types/gallery.type";

type PhotoViewerProps = {
  photo: Photo;
};

export function PhotoViewer({ photo }: PhotoViewerProps) {
  return (
    <section className="relative aspect-square overflow-hidden rounded-md shadow-lg lg:aspect-4/3">
      <img
        src={photo.image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-70 blur-2xl"
      />
      <div className="absolute inset-0 bg-surface/30" />
      <img
        src={photo.image}
        alt={photo.title}
        className="relative h-full w-full object-contain drop-shadow-lg"
        loading="lazy"
        decoding="async"
      />
    </section>
  );
}
