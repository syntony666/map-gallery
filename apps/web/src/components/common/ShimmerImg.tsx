import type { ImgHTMLAttributes } from "react";

/** Image for use inside an `img-loading` parent: stops the shimmer on error. */
export function ShimmerImg({
  onError,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      {...props}
      onError={(event) => {
        event.currentTarget.parentElement?.classList.add("img-error");
        onError?.(event);
      }}
    />
  );
}
