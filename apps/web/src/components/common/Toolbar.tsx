import type { ReactNode } from "react";
import { BottomBar } from "./BottomBar";
import { BottomBarStack } from "./BottomBarStack";
import { ButtonGroup } from "./ButtonGroup";
import type {
  ButtonActionGroup,
  ButtonGroupMobileMode,
} from "../../types/button.type";

type ToolbarProps = {
  label: string;
  value?: string | number;
  meta?: string;

  buttonGroups?: ButtonActionGroup[];

  mobileMode?: ButtonGroupMobileMode;

  /** Below lg, replace the strip with a floating bottom bar. */
  bottomBar?: boolean;

  /** Replaces the default button group inside the bottom bar. */
  barActions?: ReactNode;
  /** Overlay anchored above the bottom bar inside its positioning stack. */
  barOverlay?: ReactNode;

  className?: string;
};

export function Toolbar({
  label,
  value,
  meta,
  buttonGroups = [],
  mobileMode = "inline",
  bottomBar = false,
  barActions,
  barOverlay,
  className = "",
}: ToolbarProps) {
  const text = (
    <p className="min-w-0 flex-1 truncate text-ink-muted">
      <span>{label}</span>

      {value !== undefined && value !== "" && (
        <span className="ml-1 font-medium text-ink-strong">{value}</span>
      )}

      {meta && <span className="ml-1 text-ink-faint">{meta}</span>}
    </p>
  );

  return (
    <>
      <section
        className={[
          "flex-wrap items-center justify-between gap-3",
          "border-y border-line text-sm h-15",
          bottomBar ? "hidden lg:flex" : "flex",
          className,
        ].join(" ")}
      >
        <div className="mx-2 min-w-0 flex-1">{text}</div>

        <ButtonGroup
          groups={buttonGroups}
          mobileMode={mobileMode}
          classname="mx-2"
        />
      </section>

      {bottomBar && (
        <BottomBarStack overlay={barOverlay} className="lg:hidden">
          <BottomBar
            className="text-sm"
            actions={
              barActions ?? (
                <ButtonGroup
                  groups={buttonGroups}
                  mobileMode="inline"
                  breakpoint="md"
                />
              )
            }
          >
            {text}
          </BottomBar>
        </BottomBarStack>
      )}
    </>
  );
}
