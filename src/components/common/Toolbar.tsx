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
  className = "",
}: ToolbarProps) {
  return (
    <section
      className={[
        "flex flex-wrap items-center justify-between gap-3",
        "border-y border-stone-300 text-sm h-15",
        className,
      ].join(" ")}
    >
      <p className="min-w-0 flex-1 truncate text-stone-500 mx-2">
        <span>{label}</span>

        {value !== undefined && value !== "" && (
          <span className="ml-1 font-medium text-stone-800">{value}</span>
        )}

        {meta && <span className="ml-1 text-stone-400">{meta}</span>}
      </p>

      <ButtonGroup
        groups={buttonGroups}
        mobileMode={mobileMode}
        mobileGroupIcon={mobileGroupIcon}
        mobileGroupLabel={mobileGroupLabel}
        classname="mx-2"
      />
    </section>
  );
}
