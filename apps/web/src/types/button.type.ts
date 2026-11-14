import type { IconName } from "../components/common/Icon";

export type ButtonVariant = "default" | "primary" | "danger";

export type ButtonConfig = {
  id: string;
  label: string;
  icon?: IconName;
  variant?: ButtonVariant;
  disabled?: boolean;
  /** Hide the label; the button still exposes it as its accessible name. */
  iconOnly?: boolean;
  "aria-label"?: string;
  onClick: () => void;
};

export type ButtonActionGroup = {
  id: string;
  label?: string;
  buttons: ButtonConfig[];
};

export type ButtonGroupMobileMode = "inline" | "none";

export type ButtonGroupMobileOptions = {
  mobileMode?: ButtonGroupMobileMode;
  /** Viewport width where the group switches to its mobile rendering. */
  breakpoint?: "sm" | "md" | "lg";
};
