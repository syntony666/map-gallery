import type { ButtonActionGroup } from "../../types/button.type";

type ActionMenuListProps = {
  groups: ButtonActionGroup[];
  /** Fires when an enabled row is picked, before its own onClick. */
  onSelect?: () => void;
};

/** Row list shared by the action sheet and bottom-bar overlay menus. */
export function ActionMenuList({ groups, onSelect }: ActionMenuListProps) {
  return (
    <>
      {groups.map((group, groupIndex) => (
        <div
          key={group.id}
          className={
            groupIndex > 0 ? "mt-3 border-t border-stone-200 pt-3" : ""
          }
        >
          {group.label && (
            <p className="px-3 pb-1 text-xs font-medium tracking-wide text-stone-400">
              {group.label}
            </p>
          )}

          <div className="space-y-1">
            {group.buttons.map((button) => (
              <button
                key={button.id}
                type="button"
                disabled={button.disabled}
                onClick={() => {
                  if (button.disabled) return;
                  onSelect?.();
                  button.onClick();
                }}
                className={[
                  "flex min-h-12 w-full items-center gap-3 rounded-xl",
                  "px-3 py-3 text-left text-base font-medium",
                  "transition-colors",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  button.variant === "danger"
                    ? "text-red-700 hover:bg-red-50"
                    : "text-stone-700 hover:bg-stone-100",
                ].join(" ")}
              >
                {button.icon && (
                  <i className={`${button.icon} text-lg`} aria-hidden="true" />
                )}

                <span>{button.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
