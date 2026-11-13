import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router";
import type { ButtonVariant } from "../../types/button.type";

export type ButtonSize = "sm" | "md";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Raised chrome: white + shadow, for controls floating over the map. */
  raised?: boolean;
  /** Ghost chrome: transparent until hover. */
  ghost?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconEnd?: string;
  label?: string;
  /** The label rests collapsed to zero width and expands on hover/focus. */
  expandLabel?: boolean;
  /** Always hide the label. */
  iconOnly?: boolean;
  /** Render as a router Link instead of a button. */
  to?: string;
  children?: ReactNode;
};

function getVariantClassName(variant?: ButtonVariant) {
  // Only semantic variants tint the icon; the default inherits the chrome
  // color so ghost/raised buttons keep their muted tone.
  if (variant === "danger") return "text-red-800";
  if (variant === "primary") return "text-emerald-800";
  return "";
}

export function Button({
  raised = false,
  ghost = false,
  variant = "default",
  size = "sm",
  icon,
  iconEnd,
  label,
  expandLabel = false,
  iconOnly = false,
  to,
  className = "",
  type = "button",
  title,
  children,
  "aria-label": ariaLabel,
  ...rest
}: ButtonProps) {
  const classes = [
    "inline-flex items-center gap-1.5 rounded transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-40",
    size === "md" ? "px-3 py-1.5 text-sm" : "px-2 py-1 text-xs",
    ghost
      ? "text-stone-400 hover:bg-stone-200 hover:text-stone-600"
      : raised
        ? "bg-white text-stone-700 shadow hover:bg-stone-50"
        : "bg-stone-100 text-stone-700 hover:bg-stone-300",
    expandLabel ? "group" : "",
    className,
  ].join(" ");

  const content = (
    <>
      {icon && (
        <i
          className={`bi ${icon} ${getVariantClassName(variant)}`}
          aria-hidden="true"
        />
      )}
      {label && !iconOnly && (
        <span
          className={
            expandLabel
              ? // The collapsed span still counts as a flex item, so cancel
                // the container's gap-1.5 to keep the icon centered.
                `-ml-1.5 max-w-0 overflow-hidden whitespace-nowrap opacity-0
                transition-all group-hover:ml-0 group-hover:max-w-24
                group-hover:opacity-100 group-focus:ml-0 group-focus:max-w-24
                group-focus:opacity-100`
              : undefined
          }
        >
          {label}
        </span>
      )}
      {children}
      {iconEnd && <i className={`bi ${iconEnd}`} aria-hidden="true" />}
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        title={title}
        aria-label={ariaLabel}
        onClick={rest.onClick}
        className={classes}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      title={title ?? label}
      aria-label={ariaLabel}
      className={classes}
      {...rest}
    >
      {content}
    </button>
  );
}
