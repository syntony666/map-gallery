import type { Photo } from "../../types/gallery.type";
import { ShimmerImg } from "../common/ShimmerImg";

type PhotoCardProps = {
  photo: Photo;
  isSelectionMode: boolean;
  isSelected?: boolean;
  onOpen?: () => void;
  onToggleSelection?: () => void;
};

export function PhotoCard({
  photo,
  isSelectionMode = false,
  isSelected = false,
  onOpen,
  onToggleSelection,
}: PhotoCardProps) {
  function handleClick() {
    if (isSelectionMode) {
      onToggleSelection?.();
      return;
    }

    onOpen?.();
  }

  let interactionClass = "";
  if (isSelectionMode) {
    interactionClass = isSelected
      ? "ring-2 ring-primary ring-offset-2 ring-offset-page"
      : "hover:ring-2 hover:ring-secondary";
  } else if (onOpen) {
    interactionClass = "hover:-translate-y-0.5 hover:shadow-md";
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`relative flex flex-col overflow-hidden rounded-md bg-surface text-left shadow-sm transition ${interactionClass}`}
    >
      {isSelectionMode && (
        <span
          className={`absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded border text-sm ${
            isSelected
              ? "border-primary bg-primary text-primary-fg"
              : "border-line bg-surface/90 text-transparent"
          }`}
          aria-hidden="true"
        >
          <i className="bi bi-check" />
        </span>
      )}

      <span className="img-loading aspect-square w-full self-start">
        <ShimmerImg
          src={photo.image}
          alt={photo.title}
          className="aspect-square w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </span>

      {/* Caption floats as an inset box near the image's bottom edge;
          translucent surface + blur keep the photo readable through it. */}
      <div className="absolute inset-x-2 bottom-2 rounded bg-surface/80 px-3 py-2 backdrop-blur-sm">
        <h3 className="truncate font-medium">{photo.title}</h3>

        {photo.summary && (
          <p className="mt-1 line-clamp-2 text-sm text-ink-muted">
            {photo.summary}
          </p>
        )}
      </div>
    </button>
  );
}
