import { ShimmerImg } from "../common/ShimmerImg";

const circleSize = "h-18 w-18 sm:h-24 sm:w-24";

type CollectionAvatarProps = {
  /** Cover image; falls back to the icon placeholder when absent. */
  image?: string | null;
  alt?: string;
  /** Bootstrap icon class for the placeholder circle. */
  icon: string;
  label: string;
  /** Muted tone for the placeholder icon and label (e.g. the add tile). */
  muted?: boolean;
};

/** Shared collection tile: fixed-size circle with a caption underneath. */
export function CollectionAvatar({
  image,
  alt = "",
  icon,
  label,
  muted = false,
}: CollectionAvatarProps) {
  return (
    <>
      {image ? (
        <span className="img-loading self-start rounded-full">
          <ShimmerImg
            src={image}
            alt={alt}
            loading="lazy"
            decoding="async"
            className={`collection-item rounded-full object-cover ${circleSize}`}
          />
        </span>
      ) : (
        <span
          className={`collection-item flex items-center justify-center rounded-full
            bg-fill text-2xl ${circleSize} ${muted ? "text-ink-muted" : "text-ink-faint"}`}
        >
          <i className={`bi ${icon}`} />
        </span>
      )}
      <p
        className={`mt-1 w-18 truncate text-xs sm:w-24 ${muted ? "text-ink-muted" : ""}`}
      >
        {label}
      </p>
    </>
  );
}
