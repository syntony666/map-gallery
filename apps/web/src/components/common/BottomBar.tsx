import type { ReactNode } from "react";
import { FloatingCard } from "./FloatingCard";

type BottomBarProps = {
  children: ReactNode;
  /** Right-aligned action buttons. */
  actions?: ReactNode;
  /** Use `fixed` for scrolling pages; the map overlays use `absolute`. */
  fixed?: boolean;
  /** Inside a positioned stack the wrapper owns placement; render in flow. */
  stacked?: boolean;
  className?: string;
};

export function BottomBar({
  children,
  actions,
  fixed = false,
  stacked = false,
  className = "",
}: BottomBarProps) {
  return (
    <FloatingCard
      className={[
        "px-5 py-3",
        stacked
          ? ""
          : `inset-x-4 bottom-4 z-10 ${fixed ? "fixed" : "absolute"}`,
        actions ? "flex items-center justify-between gap-2" : "",
        className,
      ].join(" ")}
    >
      {children}
      {actions && (
        <div className="flex shrink-0 items-center gap-1.5">{actions}</div>
      )}
    </FloatingCard>
  );
}
