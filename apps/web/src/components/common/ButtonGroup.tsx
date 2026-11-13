import { useState, type HTMLAttributes } from "react";
import { ActionMenuList } from "./ActionMenuList";
import { ActionSheet } from "./ActionSheet";
import { Button } from "./Button";
import type {
  ButtonActionGroup,
  ButtonGroupMobileMode,
} from "../../types/button.type";

type ButtonGroupProps = {
  classname?: HTMLAttributes<HTMLDivElement>["className"];
  groups: ButtonActionGroup[];
  mobileMode?: ButtonGroupMobileMode;
  mobileGroupIcon?: string;
  mobileGroupLabel?: string;
  breakpoint?: "sm" | "md" | "lg";
};

export function ButtonGroup({
  groups,
  mobileMode = "menu",
  mobileGroupIcon = "bi-three-dots",
  mobileGroupLabel = "更多操作",
  breakpoint = "sm",
  classname = "",
}: ButtonGroupProps) {
  const [isOpen, setIsOpen] = useState(false);

  const nonEmptyGroups = groups.filter((group) => group.buttons.length > 0);
  const desktopClass = {
    sm: "sm:flex",
    md: "md:flex",
    lg: "lg:flex",
  }[breakpoint];
  const mobileClass = {
    sm: "sm:hidden",
    md: "md:hidden",
    lg: "lg:hidden",
  }[breakpoint];

  if (nonEmptyGroups.length === 0) {
    return null;
  }

  return (
    <>
      <div
        className={["hidden items-center gap-2", desktopClass, classname].join(
          " ",
        )}
      >
        {nonEmptyGroups.map((group, index) => (
          <div
            key={group.id}
            className={[
              "flex items-center gap-2",
              index > 0 ? "border-l border-stone-300 pl-2" : "",
            ].join(" ")}
          >
            {group.buttons.map((button) => (
              <Button key={button.id} size="md" {...button} />
            ))}
          </div>
        ))}
      </div>

      {mobileMode === "none" ? null : mobileMode === "inline" ? (
        <div
          className={[
            "flex flex-wrap items-center justify-end gap-2",
            mobileClass,
          ].join(" ")}
        >
          {nonEmptyGroups.flatMap((group) =>
            group.buttons.map((button) => (
              <Button key={button.id} size="md" {...button} iconOnly />
            )),
          )}
        </div>
      ) : (
        <div className={mobileClass}>
          <Button
            size="md"
            label={mobileGroupLabel}
            icon={mobileGroupIcon}
            onClick={() => setIsOpen(true)}
          />

          <ActionSheet
            open={isOpen}
            title={mobileGroupLabel}
            onClose={() => setIsOpen(false)}
          >
            <ActionMenuList
              groups={nonEmptyGroups}
              onSelect={() => setIsOpen(false)}
            />
          </ActionSheet>
        </div>
      )}
    </>
  );
}
