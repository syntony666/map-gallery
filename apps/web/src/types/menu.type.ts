import type { ReactNode } from "react";
import type { ButtonActionGroup } from "./button.type";

export type MenuRow = {
  id: string;
  icon?: string;
  label: ReactNode;
  /** Right-aligned muted text, e.g. a photo count. */
  meta?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  selected?: boolean;
  onClick?: () => void;
};

export type MenuSection = { id: string; rows: MenuRow[] };

/** Map the button-strip config into menu sections. */
export function menuSections(groups: ButtonActionGroup[]): MenuSection[] {
  return groups.map((group) => ({
    id: group.id,
    rows: group.buttons.map((button) => ({
      id: button.id,
      icon: button.icon,
      label: button.label,
      danger: button.variant === "danger",
      disabled: button.disabled,
      onClick: button.onClick,
    })),
  }));
}
