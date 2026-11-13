import type { ReactNode } from "react";
import type { MenuRow, MenuSection } from "../../types/menu.type";

type MenuHeadingProps = {
  title: ReactNode;
  titleIcon?: string;
};

/** Heading row of a menu: optional icon + title. Render it outside the
    scrollable row area so it stays put while rows scroll. */
export function MenuHeading({ title, titleIcon }: MenuHeadingProps) {
  return (
    <h2 className="pb-2 text-md font-semibold text-stone-800">
      {titleIcon && (
        <i
          className={`bi ${titleIcon} mr-1.5 text-stone-600`}
          aria-hidden="true"
        />
      )}
      {title}
    </h2>
  );
}

type MenuListProps = {
  sections: MenuSection[];
  /** Fires when an enabled row is picked, before its own onClick. */
  onSelect?: (row: MenuRow) => void;
};

/** The one menu list: RegionList-style rows shared by every menu. */
export function MenuList({ sections, onSelect }: MenuListProps) {
  return (
    <>
      {sections.map((section, index) => (
        <div
          key={section.id}
          className={index > 0 ? "mt-1 border-t border-stone-200/60" : ""}
        >
          {section.rows.map((row) => (
            <button
              key={row.id}
              type="button"
              disabled={row.disabled}
              onClick={() => {
                if (row.disabled) return;
                onSelect?.(row);
                row.onClick?.();
              }}
              className={[
                "flex min-h-11 w-full items-center justify-between gap-3",
                "rounded text-left text-sm transition-colors",
                "disabled:cursor-not-allowed disabled:opacity-50",
                row.selected
                  ? "bg-stone-200/70 font-medium text-stone-800"
                  : row.danger
                    ? "text-red-700 hover:bg-red-50"
                    : "text-stone-700 hover:bg-stone-100/80",
              ].join(" ")}
            >
              <span className="flex min-w-0 items-center gap-2.5">
                {row.icon && (
                  <i className={`${row.icon} text-lg`} aria-hidden="true" />
                )}
                <span className="truncate">{row.label}</span>
              </span>
              {row.meta && (
                <span className="shrink-0 text-xs text-stone-400">
                  {row.meta}
                </span>
              )}
            </button>
          ))}
        </div>
      ))}
    </>
  );
}
