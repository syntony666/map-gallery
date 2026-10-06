import type { Photo } from "../../types/gallery.type";

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
      ? "ring-2 ring-stone-700 ring-offset-2"
      : "hover:ring-2 hover:ring-stone-300";
  } else if (onOpen) {
    interactionClass = "hover:-translate-y-0.5 hover:shadow-md";
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`relative overflow-hidden rounded-xl bg-white text-left shadow-sm transition ${interactionClass}`}
    >
      {isSelectionMode && (
        <span
          className={`absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded border text-sm ${
            isSelected
              ? "border-stone-700 bg-stone-700 text-white"
              : "border-stone-300 bg-white/90 text-transparent"
          }`}
          aria-hidden="true"
        >
          <i className="bi bi-check" />
        </span>
      )}

      <img
        src={photo.image}
        alt={photo.title}
        className="aspect-square w-full object-cover"
        loading="lazy"
        decoding="async"
      />

      <div className="p-3">
        <h3 className="truncate font-medium">{photo.title}</h3>

        {photo.summary && (
          <p className="mt-1 line-clamp-2 text-sm text-stone-500">
            {photo.summary}
          </p>
        )}
      </div>
    </button>
  );
}
