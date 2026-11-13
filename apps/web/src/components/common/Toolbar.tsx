import { BottomBar } from "./BottomBar";
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
  mobileGroupIcon?: string;
  mobileGroupLabel?: string;

  /** Below sm, replace the strip with a floating bottom bar. */
  bottomBar?: boolean;

  className?: string;
};

export function Toolbar({
  label,
  value,
  meta,
  buttonGroups = [],
  mobileMode = "menu",
  mobileGroupIcon,
  mobileGroupLabel,
  bottomBar = false,
  className = "",
}: ToolbarProps) {
  const text = (
    <p className="min-w-0 flex-1 truncate text-stone-500">
      <span>{label}</span>

      {value !== undefined && value !== "" && (
        <span className="ml-1 font-medium text-stone-800">{value}</span>
      )}

      {meta && <span className="ml-1 text-stone-400">{meta}</span>}
    </p>
  );

  return (
    <>
      <section
        className={[
          "flex-wrap items-center justify-between gap-3",
          "border-y border-stone-300 text-sm h-15",
          bottomBar ? "hidden md:flex" : "flex",
          className,
        ].join(" ")}
      >
        <div className="mx-2 min-w-0 flex-1">{text}</div>

        <ButtonGroup
          groups={buttonGroups}
          mobileMode={mobileMode}
          mobileGroupIcon={mobileGroupIcon}
          mobileGroupLabel={mobileGroupLabel}
          classname="mx-2"
        />
      </section>

      {bottomBar && (
        <BottomBar
          fixed
          className="z-50 text-sm md:hidden"
          actions={
            <ButtonGroup
              groups={buttonGroups}
              mobileMode="inline"
              breakpoint="md"
            />
          }
        >
          {text}
        </BottomBar>
      )}
    </>
  );
}
