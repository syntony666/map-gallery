import type { CSSProperties, ReactNode } from "react";

type FloatingCardProps = {
  /** Positioning, padding, and breakpoint visibility stay with the caller. */
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  as?: "div" | "aside";
  "aria-label"?: string;
};

/** Shared chrome for the floating cards (bottom bar, region menu, side panel). */
export function FloatingCard({
  as: Tag = "div",
  className = "",
  style,
  children,
  "aria-label": ariaLabel,
}: FloatingCardProps) {
  return (
    <Tag
      aria-label={ariaLabel}
      style={style}
      className={`rounded-md bg-surface/70 shadow-lg backdrop-blur ${className}`}
    >
      {children}
    </Tag>
  );
}
