import type { ButtonConfig, ButtonVariant } from "../../types/button.type";

type ButtonProps = {
  button: ButtonConfig;
  iconOnly?: boolean;
};

function getVariantClassName(variant?: ButtonVariant) {
  if (variant === "danger") return "text-red-800";
  if (variant === "primary") return "text-emerald-800";
  return "text-stone-800";
}

export function Button({ button, iconOnly }: ButtonProps) {
  return (
    <button
      key={button.id}
      type="button"
      onClick={button.onClick}
      disabled={button.disabled}
      className={[
        "rounded bg-stone-200 px-3 py-2 text-xs",
        "hover:bg-stone-300 disabled:cursor-not-allowed disabled:opacity-40",
      ].join(" ")}
      title={button.label}
    >
      {button.icon && (
        <i
          className={`bi ${button.icon} ${getVariantClassName(button.variant)}`}
        ></i>
      )}
      {button.label && !iconOnly && (
        <span className="ms-2">{button.label}</span>
      )}
    </button>
  );
}
