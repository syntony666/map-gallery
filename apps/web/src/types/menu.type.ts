import type { ReactNode } from "react";

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
