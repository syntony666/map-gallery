import { useState } from "react";
import { Icon } from "../common/Icon";

type AreaCoverProps = {
  src?: string;
  alt?: string;
  className: string;
  iconClassName?: string;
};

export function AreaCover({
  src,
  alt = "",
  className,
  iconClassName,
}: AreaCoverProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return (
      <span
        className={`flex items-center justify-center bg-fill/50 text-ink-faint ${className}`}
      >
        <Icon name="bi-images" className={iconClassName} />
      </span>
    );
  }

  return (
    <span className={`img-loading ${className}`}>
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        onError={() => setFailedSrc(src)}
      />
    </span>
  );
}
