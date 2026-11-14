import type { ButtonActionGroup } from "../types/button.type";
import type { MenuSection } from "../types/menu.type";

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
