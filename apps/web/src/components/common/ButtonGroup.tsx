import type { HTMLAttributes } from "react";
import { Button } from "./Button";
import type {
  ButtonActionGroup,
  ButtonGroupMobileMode,
} from "../../types/button.type";

type ButtonGroupProps = {
  classname?: HTMLAttributes<HTMLDivElement>["className"];
  groups: ButtonActionGroup[];
  mobileMode?: ButtonGroupMobileMode;
  breakpoint?: "sm" | "md" | "lg";
  /** Forwarded to every button — use on glass surfaces. */
  translucent?: boolean;
};

export function ButtonGroup({
  groups,
  mobileMode = "inline",
  breakpoint = "sm",
  classname = "",
  translucent = false,
}: ButtonGroupProps) {
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
              index > 0 ? "border-l border-line pl-2" : "",
            ].join(" ")}
          >
            {group.buttons.map((button) => (
              <Button
                key={button.id}
                size="md"
                translucent={translucent}
                {...button}
              />
            ))}
          </div>
        ))}
      </div>

      {mobileMode === "none" ? null : (
        <div
          className={[
            "flex flex-wrap items-center justify-end gap-2",
            mobileClass,
          ].join(" ")}
        >
          {nonEmptyGroups.flatMap((group) =>
            group.buttons.map((button) => (
              <Button
                key={button.id}
                size="md"
                translucent={translucent}
                {...button}
                iconOnly
              />
            )),
          )}
        </div>
      )}
    </>
  );
}
