import type { ReactNode } from "react";

type BottomBarStackProps = {
  children: ReactNode;
  /** Floating overlay anchored above the bar inside the same wrapper. */
  overlay?: ReactNode;
  className?: string;
};

/** The one place that owns bottom-bar placement: always fixed to the viewport,
    one bottom offset (with safe area) for every page. The visible bar's height
    drives the wrapper, so `BottomBarOverlay` can anchor structurally above. */
export function BottomBarStack({
  children,
  overlay,
  className = "",
}: BottomBarStackProps) {
  return (
    <div
      className={[
        "fixed inset-x-4 z-10",
        "bottom-[calc(1rem+env(safe-area-inset-bottom))]",
        className,
      ].join(" ")}
    >
      {overlay}
      {children}
    </div>
  );
}
