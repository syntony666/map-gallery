import { useState } from "react";

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
        className={`flex items-center justify-center bg-stone-200 text-stone-400 ${className}`}
      >
        <i className={`bi bi-images ${iconClassName ?? ""}`} />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailedSrc(src)}
    />
  );
}
