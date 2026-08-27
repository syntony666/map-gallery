import { useState } from "react";
import { ActionSheet } from "./ActionSheet";
import { Button } from "./Button";
import type {
  ButtonActionGroup,
  ButtonConfig,
  ButtonGroupMobileMode,
} from "../../types/button.type";

type ButtonGroupProps = {
  groups: ButtonActionGroup[];
  mobileMode?: ButtonGroupMobileMode;
  mobileGroupIcon?: string;
  mobileGroupLabel?: string;
};

export function ButtonGroup({
  groups,
  mobileMode = "menu",
  mobileGroupIcon = "bi-three-dots",
  mobileGroupLabel = "更多操作",
}: ButtonGroupProps) {
  const [isOpen, setIsOpen] = useState(false);

  const nonEmptyGroups = groups.filter((group) => group.buttons.length > 0);

  if (nonEmptyGroups.length === 0) {
    return null;
  }

  function handleAction(button: ButtonConfig) {
    if (button.disabled) {
      return;
    }

    setIsOpen(false);
    button.onClick();
  }

  return (
    <>
      <div className="hidden items-center gap-2 sm:flex">
        {nonEmptyGroups.map((group, index) => (
          <div
            key={group.id}
            className={[
              "flex items-center gap-2",
              index > 0 ? "border-l border-stone-300 pl-2" : "",
            ].join(" ")}
          >
            {group.buttons.map((button) => (
              <Button key={button.id} button={button} />
            ))}
          </div>
        ))}
      </div>

      {mobileMode === "inline" ? (
        <div className="flex flex-wrap items-center justify-end gap-2 sm:hidden">
          {nonEmptyGroups.flatMap((group) =>
            group.buttons.map((button) => (
              <Button key={button.id} button={button} iconOnly />
            )),
          )}
        </div>
      ) : (
        <div className="sm:hidden">
          <Button
            button={{
              id: "button-group-menu-trigger",
              label: mobileGroupLabel,
              icon: mobileGroupIcon,
              onClick: () => setIsOpen(true),
            }}
          />

          <ActionSheet
            open={isOpen}
            title={mobileGroupLabel}
            onClose={() => setIsOpen(false)}
          >
            {nonEmptyGroups.map((group, groupIndex) => (
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
                      onClick={() => handleAction(button)}
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
                        <i
                          className={`${button.icon} text-lg`}
                          aria-hidden="true"
                        />
                      )}

                      <span>{button.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </ActionSheet>
        </div>
      )}
    </>
  );
}
