import type { ReactNode } from "react";
import type { IconName } from "../components/common/Icon";

export type MenuRow = {
  id: string;
  icon?: IconName;
  label: ReactNode;
  /** Right-aligned muted text, e.g. a photo count. */
  meta?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  selected?: boolean;
  onClick?: () => void;
};

export type MenuSection = { id: string; rows: MenuRow[] };
