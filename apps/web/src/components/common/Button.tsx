import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from "react";
import { Link } from "react-router";
import type { ButtonVariant } from "../../types/button.type";

export type ButtonSize = "sm" | "md";

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  /** Raised chrome: white + shadow, for controls floating over the map. */
  raised?: boolean;
  /** Translucent chrome, for controls sitting on a glass FloatingCard. */
  translucent?: boolean;
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
  /** Extra classes on the label span (e.g. hiding it below a breakpoint). */
  labelClassName?: string;
  /** Render as a router Link instead of a button. */
  to?: string;
  children?: ReactNode;
};

function getVariantClassName(variant?: ButtonVariant) {
  // Only semantic variants tint the icon; the default inherits the chrome
  // color so ghost/raised buttons keep their muted tone.
  if (variant === "danger") return "text-danger";
  if (variant === "primary") return "text-primary";
  return "";
}

export function Button({
  raised = false,
  translucent = false,
  ghost = false,
  variant = "default",
  size = "sm",
  icon,
  iconEnd,
  label,
  expandLabel = false,
  iconOnly = false,
  labelClassName,
  to,
  className = "",
  type = "button",
  title,
  children,
  "aria-label": ariaLabel,
  onClick,
  ...rest
}: ButtonProps) {
  const classes = [
    "inline-flex items-center gap-1.5 rounded transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-40",
    size === "md" ? "px-3 py-1.5 text-sm" : "px-2 py-1 text-xs",
    ghost
      ? "text-ink-faint hover:bg-fill hover:text-ink-secondary"
      : raised
        ? translucent
          ? "bg-surface/70 text-ink shadow hover:bg-page/70"
          : "bg-surface text-ink shadow hover:bg-page"
        : translucent
          ? "bg-fill/70 text-ink hover:bg-secondary/70"
          : "bg-fill text-ink hover:bg-secondary",
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
                transition-all delay-50 duration-200 group-hover:ml-0 group-hover:max-w-24
                group-hover:opacity-100 group-focus-visible:ml-0
                group-focus-visible:max-w-24 group-focus-visible:opacity-100`
              : labelClassName
          }
        >
          {label}
        </span>
      )}
      {children}
      {iconEnd && <i className={`bi ${iconEnd}`} aria-hidden="true" />}
    </>
  );

  const accessibleName = ariaLabel ?? (iconOnly ? label : undefined);

  if (to) {
    return (
      <Link
        to={to}
        title={title}
        aria-label={accessibleName}
        onClick={onClick}
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
      aria-label={accessibleName}
      onClick={onClick}
      className={classes}
      {...rest}
    >
      {content}
    </button>
  );
}
