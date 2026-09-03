export type ButtonVariant = "default" | "primary" | "danger";

export type ButtonConfig = {
  id: string;
  label: string;
  icon?: string;
  variant?: ButtonVariant;
  disabled?: boolean;
  onClick: () => void;
};

export type ButtonActionGroup = {
  id: string;
  label?: string;
  buttons: ButtonConfig[];
};

export type ButtonGroupMobileMode = "inline" | "menu";

export type ButtonGroupMobileOptions = {
  mobileMode?: ButtonGroupMobileMode;
  mobileGroupIcon?: string;
  mobileGroupLabel?: string;
};
