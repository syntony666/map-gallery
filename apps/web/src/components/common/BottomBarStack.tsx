import type { ReactNode } from "react";

type BottomBarStackProps = {
  children: ReactNode;
  /** Floating overlay anchored above the bar inside the same wrapper. */
  overlay?: ReactNode;
  /** Use `fixed` for scrolling pages; the map overlays use `absolute`. */
  fixed?: boolean;
  className?: string;
};

/** Positioned wrapper owning the bottom anchoring. The visible bar's height
    drives it, so `BottomBarOverlay` can anchor structurally above the bar. */
export function BottomBarStack({
  children,
  overlay,
  fixed = false,
  className = "",
}: BottomBarStackProps) {
  return (
    <div
      className={[
        "inset-x-4 bottom-4 z-10",
        // On tablet widths the bar hugs its contents instead of stretching
        // edge to edge.
        "md:max-lg:left-1/2 md:max-lg:right-auto",
        "md:max-lg:w-fit md:max-lg:max-w-[calc(100dvw-2rem)]",
        "md:max-lg:-translate-x-1/2",
        fixed ? "fixed" : "absolute",
        className,
      ].join(" ")}
    >
      {overlay}
      {children}
    </div>
  );
}
