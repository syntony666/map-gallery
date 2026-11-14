import { Link } from "react-router";
import type { Photo } from "../../types/gallery.type";
import { ShimmerImg } from "../common/ShimmerImg";
import { Icon } from "../common/Icon";

type PhotoCardProps = {
  photo: Photo;
  isSelectionMode: boolean;
  isSelected?: boolean;
  to?: string;
  onToggleSelection?: () => void;
};

export function PhotoCard({
  photo,
  isSelectionMode = false,
  isSelected = false,
  to,
  onToggleSelection,
}: PhotoCardProps) {
  let interactionClass = "";
  if (isSelectionMode) {
    interactionClass = isSelected
      ? "ring-2 ring-primary ring-offset-2 ring-offset-page"
      : "hover:ring-2 hover:ring-secondary";
  } else if (to) {
    interactionClass = "hover:-translate-y-0.5 hover:shadow-md";
  }

  const className = `relative flex flex-col overflow-hidden rounded-md bg-surface text-left shadow-sm transition ${interactionClass}`;

  const TitleTag = isSelectionMode ? "span" : "h3";

  const content = (
    <>
      {isSelectionMode && (
        <span
          className={`absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded border text-sm ${
            isSelected
              ? "border-primary bg-primary text-primary-fg"
              : "border-line bg-fill/70 text-transparent"
          }`}
          aria-hidden="true"
        >
          <Icon name="bi-check" />
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

      <div className="glass absolute inset-x-2 bottom-2 rounded px-3 py-2">
        <TitleTag className="truncate text-xs sm:text-base sm:font-medium">
          {photo.title}
        </TitleTag>

        <p
          className="mt-1 hidden line-clamp-2 min-h-10 text-sm text-ink-muted
            sm:block"
        >
          {photo.summary}
        </p>
      </div>
    </>
  );

  if (isSelectionMode) {
    return (
      <button
        type="button"
        onClick={() => onToggleSelection?.()}
        aria-pressed={isSelected}
        className={className}
      >
        {content}
      </button>
    );
  }

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
