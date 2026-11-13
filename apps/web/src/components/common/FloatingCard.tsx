import type { ReactNode } from "react";

type FloatingCardProps = {
  /** Positioning, padding, and breakpoint visibility stay with the caller. */
  className?: string;
  children: ReactNode;
  as?: "div" | "aside";
  "aria-label"?: string;
};

/** Shared chrome for the floating cards (bottom bar, region menu, side panel). */
export function FloatingCard({
  as: Tag = "div",
  className = "",
  children,
  "aria-label": ariaLabel,
}: FloatingCardProps) {
  return (
    <Tag
      aria-label={ariaLabel}
      className={`rounded-2xl bg-white/90 shadow-lg backdrop-blur ${className}`}
    >
      {children}
    </Tag>
  );
}
