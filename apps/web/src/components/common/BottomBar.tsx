import type { ReactNode } from "react";
import { FloatingCard } from "./FloatingCard";

type BottomBarProps = {
  children: ReactNode;
  /** Right-aligned action buttons. */
  actions?: ReactNode;
  className?: string;
};

/** The visible bar card. Placement belongs to `BottomBarStack`; render in flow. */
export function BottomBar({
  children,
  actions,
  className = "",
}: BottomBarProps) {
  return (
    <FloatingCard
      className={[
        "px-5 py-3",
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
